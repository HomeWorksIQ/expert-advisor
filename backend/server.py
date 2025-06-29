from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import random
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import timedelta

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
import sys
sys.path.append('/app/backend')
from api_key_models import (
    APIKey, APIKeyCreate, APIKeyUpdate, APIKeyType, APIKeyStatus,
    Appointment, AppointmentAvailability, AppointmentType, AppointmentStatus,
    ChatRoom, ChatMessage, ChatType, MessageType,
    UploadedFile, FileType,
    Product, Order, ProductType, ShippingProvider
)
from video_service import VideoConferencingService, VideoRecordingService
from calendar_service import CalendarIntegrationService
from shipping_service import ShippingLabelService
from trial_service import TrialService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class SubscriptionType(str, Enum):
    FREE = "free"
    MONTHLY = "monthly"
    PER_VISIT = "per_visit"
    TEASER = "teaser"

class AccessLevel(str, Enum):
    FULL = "full"
    TEASER = "teaser"
    BLOCKED = "blocked"

class BlockReason(str, Enum):
    HARASSMENT = "harassment"
    BAD_LANGUAGE = "bad_language"
    INAPPROPRIATE_BEHAVIOR = "inappropriate_behavior"
    SPAM = "spam"
    OTHER = "other"

# Location Models
class Location(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    country: str
    country_code: str
    state: Optional[str] = None
    state_code: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LocationPreference(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str
    location_type: str  # "country", "state", "city", "zip_code"
    location_value: str  # e.g., "US", "CA", "Los Angeles", "90210"
    is_allowed: bool  # True for allowed, False for blocked
    subscription_type: SubscriptionType
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Teaser Models
class TeaserSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str
    enabled: bool = True
    duration_seconds: int = Field(default=30, ge=5, le=300)  # 5 seconds to 5 minutes
    message: Optional[str] = "Preview time expired! Subscribe to continue viewing my profile."
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeaserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str
    user_id: str
    user_ip: str
    started_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    is_active: bool = True

# User Blocking Models
class BlockedUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str
    blocked_user_id: str
    blocked_user_ip: Optional[str] = None
    reason: BlockReason
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Access Control Models
class AccessRequest(BaseModel):
    performer_id: str
    user_id: Optional[str] = None
    user_ip: str
    location: Location

class AccessResponse(BaseModel):
    access_level: AccessLevel
    allowed: bool
    reason: str
    teaser_remaining_seconds: Optional[int] = None
    subscription_required: Optional[SubscriptionType] = None
    message: Optional[str] = None

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Mock Geo-IP Detection Service
async def mock_detect_location_from_ip(ip_address: str) -> Location:
    """Mock implementation of IP geolocation - replace with real Google Geo IP API"""
    # Mock data for different IP ranges
    mock_locations = [
        Location(
            country="United States",
            country_code="US", 
            state="California",
            state_code="CA",
            city="Los Angeles",
            zip_code="90210",
            latitude=34.0522,
            longitude=-118.2437
        ),
        Location(
            country="United States",
            country_code="US",
            state="New York", 
            state_code="NY",
            city="New York",
            zip_code="10001",
            latitude=40.7128,
            longitude=-74.0060
        ),
        Location(
            country="Canada",
            country_code="CA",
            state="Ontario",
            state_code="ON", 
            city="Toronto",
            zip_code="M5V 3A8",
            latitude=43.6532,
            longitude=-79.3832
        ),
        Location(
            country="United Kingdom",
            country_code="GB",
            state="England",
            state_code="ENG",
            city="London",
            zip_code="SW1A 1AA",
            latitude=51.5074,
            longitude=-0.1278
        )
    ]
    
    # Return random location based on IP hash for consistency
    location_index = hash(ip_address) % len(mock_locations)
    return mock_locations[location_index]

# Access Control Service
class AccessControlService:
    def __init__(self):
        pass
    
    async def get_user_location(self, request: Request) -> Location:
        """Get user location from IP address"""
        user_ip = request.client.host
        # Handle localhost/development IPs
        if user_ip in ["127.0.0.1", "::1", "localhost"]:
            user_ip = "192.168.1.100"  # Mock IP for development
        
        return await mock_detect_location_from_ip(user_ip)
    
    async def check_location_access(self, performer_id: str, user_location: Location) -> tuple[bool, SubscriptionType, str]:
        """Check if user's location is allowed to access performer's profile"""
        # Get performer's location preferences
        preferences = await db.location_preferences.find({"performer_id": performer_id}).to_list(1000)
        
        if not preferences:
            # No preferences set - default to free access globally
            return True, SubscriptionType.FREE, "Global access allowed"
        
        # Check each location preference
        for pref in preferences:
            pref_obj = LocationPreference(**pref)
            location_match = False
            
            # Check location match based on preference type
            if pref_obj.location_type == "country" and pref_obj.location_value.lower() == user_location.country_code.lower():
                location_match = True
            elif pref_obj.location_type == "state" and pref_obj.location_value.lower() == user_location.state_code.lower():
                location_match = True
            elif pref_obj.location_type == "city" and pref_obj.location_value.lower() == user_location.city.lower():
                location_match = True
            elif pref_obj.location_type == "zip_code" and pref_obj.location_value == user_location.zip_code:
                location_match = True
            
            if location_match:
                if pref_obj.is_allowed:
                    return True, pref_obj.subscription_type, f"Access allowed for {pref_obj.location_type}: {pref_obj.location_value}"
                else:
                    return False, None, f"Access blocked for {pref_obj.location_type}: {pref_obj.location_value}"
        
        # No matching preferences found - default behavior
        return False, None, "Location not in allowed regions"
    
    async def check_user_blocked(self, performer_id: str, user_id: Optional[str], user_ip: str) -> tuple[bool, str]:
        """Check if user is blocked by the performer"""
        # Check by user ID if available
        if user_id:
            blocked = await db.blocked_users.find_one({
                "performer_id": performer_id,
                "blocked_user_id": user_id
            })
            if blocked:
                blocked_obj = BlockedUser(**blocked)
                return True, f"User blocked: {blocked_obj.reason.value}"
        
        # Check by IP address
        blocked = await db.blocked_users.find_one({
            "performer_id": performer_id,
            "blocked_user_ip": user_ip
        })
        if blocked:
            blocked_obj = BlockedUser(**blocked)
            return True, f"IP blocked: {blocked_obj.reason.value}"
        
        return False, ""
    
    async def get_or_create_teaser_session(self, performer_id: str, user_id: Optional[str], user_ip: str) -> Optional[TeaserSession]:
        """Get existing teaser session or create new one"""
        # Get teaser settings
        teaser_settings = await db.teaser_settings.find_one({"performer_id": performer_id})
        if not teaser_settings or not teaser_settings.get("enabled", False):
            return None
        
        settings = TeaserSettings(**teaser_settings)
        
        # Check for existing active session
        query = {"performer_id": performer_id, "user_ip": user_ip, "is_active": True}
        if user_id:
            query["user_id"] = user_id
        
        existing_session = await db.teaser_sessions.find_one(query)
        if existing_session:
            session = TeaserSession(**existing_session)
            if session.expires_at > datetime.utcnow():
                return session
            else:
                # Deactivate expired session
                await db.teaser_sessions.update_one(
                    {"id": session.id},
                    {"$set": {"is_active": False}}
                )
        
        # Create new teaser session
        new_session = TeaserSession(
            performer_id=performer_id,
            user_id=user_id or "",
            user_ip=user_ip,
            expires_at=datetime.utcnow() + timedelta(seconds=settings.duration_seconds)
        )
        
        await db.teaser_sessions.insert_one(new_session.dict())
        return new_session
    
    async def check_profile_access(self, access_request: AccessRequest) -> AccessResponse:
        """Main access control logic"""
        performer_id = access_request.performer_id
        user_id = access_request.user_id
        user_ip = access_request.user_ip
        location = access_request.location
        
        # 1. Check if user is blocked
        is_blocked, block_reason = await self.check_user_blocked(performer_id, user_id, user_ip)
        if is_blocked:
            return AccessResponse(
                access_level=AccessLevel.BLOCKED,
                allowed=False,
                reason=block_reason,
                message="You are blocked from accessing this profile."
            )
        
        # 2. Check location access
        location_allowed, subscription_type, location_reason = await self.check_location_access(performer_id, location)
        if not location_allowed:
            return AccessResponse(
                access_level=AccessLevel.BLOCKED,
                allowed=False,
                reason=location_reason,
                message="This profile is not available in your location."
            )
        
        # 3. Handle subscription types
        if subscription_type == SubscriptionType.FREE:
            return AccessResponse(
                access_level=AccessLevel.FULL,
                allowed=True,
                reason="Free access granted",
                message="Welcome! Enjoy full access to this profile."
            )
        
        elif subscription_type == SubscriptionType.TEASER:
            # Check/create teaser session
            teaser_session = await self.get_or_create_teaser_session(performer_id, user_id, user_ip)
            if teaser_session and teaser_session.expires_at > datetime.utcnow():
                remaining_seconds = int((teaser_session.expires_at - datetime.utcnow()).total_seconds())
                return AccessResponse(
                    access_level=AccessLevel.TEASER,
                    allowed=True,
                    reason="Teaser access active",
                    teaser_remaining_seconds=remaining_seconds,
                    message=f"Preview mode - {remaining_seconds} seconds remaining"
                )
            else:
                return AccessResponse(
                    access_level=AccessLevel.BLOCKED,
                    allowed=False,
                    reason="Teaser expired",
                    subscription_required=SubscriptionType.MONTHLY,
                    message="Preview time expired! Subscribe to continue viewing this profile."
                )
        
        else:  # MONTHLY or PER_VISIT
            # TODO: Check if user has active subscription/payment
            # For now, return subscription required
            return AccessResponse(
                access_level=AccessLevel.BLOCKED,
                allowed=False,
                reason="Subscription required",
                subscription_required=subscription_type,
                message=f"This profile requires a {subscription_type.value} subscription."
            )

access_control = AccessControlService()

# API Routes
# API Routes

# Original routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Location Detection API
@api_router.post("/detect-location")
async def detect_user_location(request: Request):
    """Detect user's location from IP address"""
    try:
        location = await access_control.get_user_location(request)
        return {
            "success": True,
            "location": location.dict(),
            "ip": request.client.host
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location detection failed: {str(e)}")

# Location Preferences API
@api_router.post("/performer/{performer_id}/location-preferences")
async def create_location_preference(performer_id: str, preference: LocationPreference):
    """Create or update location preference for a performer"""
    preference.performer_id = performer_id
    preference.updated_at = datetime.utcnow()
    
    # Check if preference already exists
    existing = await db.location_preferences.find_one({
        "performer_id": performer_id,
        "location_type": preference.location_type,
        "location_value": preference.location_value
    })
    
    if existing:
        # Update existing preference
        await db.location_preferences.update_one(
            {"id": existing["id"]},
            {"$set": preference.dict()}
        )
        return {"success": True, "message": "Location preference updated"}
    else:
        # Create new preference
        await db.location_preferences.insert_one(preference.dict())
        return {"success": True, "message": "Location preference created"}

@api_router.get("/performer/{performer_id}/location-preferences")
async def get_location_preferences(performer_id: str):
    """Get all location preferences for a performer"""
    preferences = await db.location_preferences.find({"performer_id": performer_id}).to_list(1000)
    return [LocationPreference(**pref) for pref in preferences]

@api_router.delete("/performer/{performer_id}/location-preferences/{preference_id}")
async def delete_location_preference(performer_id: str, preference_id: str):
    """Delete a location preference"""
    result = await db.location_preferences.delete_one({
        "id": preference_id,
        "performer_id": performer_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location preference not found")
    
    return {"success": True, "message": "Location preference deleted"}

# Teaser Settings API
@api_router.post("/performer/{performer_id}/teaser-settings")
async def update_teaser_settings(performer_id: str, settings: TeaserSettings):
    """Update teaser settings for a performer"""
    settings.performer_id = performer_id
    settings.updated_at = datetime.utcnow()
    
    # Upsert teaser settings
    await db.teaser_settings.update_one(
        {"performer_id": performer_id},
        {"$set": settings.dict()},
        upsert=True
    )
    
    return {"success": True, "message": "Teaser settings updated"}

@api_router.get("/performer/{performer_id}/teaser-settings")
async def get_teaser_settings(performer_id: str):
    """Get teaser settings for a performer"""
    settings = await db.teaser_settings.find_one({"performer_id": performer_id})
    if not settings:
        # Return default settings
        return TeaserSettings(performer_id=performer_id, enabled=False)
    return TeaserSettings(**settings)

# User Blocking API
@api_router.post("/performer/{performer_id}/block-user")
async def block_user(performer_id: str, block_data: BlockedUser):
    """Block a user from accessing performer's profile"""
    block_data.performer_id = performer_id
    
    # Check if user is already blocked
    existing = await db.blocked_users.find_one({
        "performer_id": performer_id,
        "blocked_user_id": block_data.blocked_user_id
    })
    
    if existing:
        return {"success": False, "message": "User is already blocked"}
    
    await db.blocked_users.insert_one(block_data.dict())
    return {"success": True, "message": "User blocked successfully"}

@api_router.get("/performer/{performer_id}/blocked-users")
async def get_blocked_users(performer_id: str):
    """Get all blocked users for a performer"""
    blocked_users = await db.blocked_users.find({"performer_id": performer_id}).to_list(1000)
    return [BlockedUser(**user) for user in blocked_users]

@api_router.delete("/performer/{performer_id}/unblock-user/{blocked_user_id}")
async def unblock_user(performer_id: str, blocked_user_id: str):
    """Unblock a user"""
    result = await db.blocked_users.delete_one({
        "performer_id": performer_id,
        "blocked_user_id": blocked_user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blocked user not found")
    
    return {"success": True, "message": "User unblocked successfully"}

# Profile Access Control API
@api_router.post("/check-profile-access")
async def check_profile_access(request: Request, access_request: AccessRequest):
    """Check if user can access a performer's profile"""
    try:
        # Get user location if not provided
        if not hasattr(access_request, 'location') or not access_request.location:
            access_request.location = await access_control.get_user_location(request)
        
        # Set user IP
        access_request.user_ip = request.client.host
        
        # Check access
        access_response = await access_control.check_profile_access(access_request)
        return access_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Access check failed: {str(e)}")

# Teaser Session API
@api_router.get("/teaser-session/{performer_id}")
async def get_teaser_session_status(performer_id: str, request: Request, user_id: Optional[str] = None):
    """Get current teaser session status for a user"""
    user_ip = request.client.host
    
    # Find active teaser session
    query = {"performer_id": performer_id, "user_ip": user_ip, "is_active": True}
    if user_id:
        query["user_id"] = user_id
    
    session = await db.teaser_sessions.find_one(query)
    if not session:
        return {"active": False, "message": "No active teaser session"}
    
    session_obj = TeaserSession(**session)
    if session_obj.expires_at <= datetime.utcnow():
        # Deactivate expired session
        await db.teaser_sessions.update_one(
            {"id": session_obj.id},
            {"$set": {"is_active": False}}
        )
        return {"active": False, "message": "Teaser session expired"}
    
    remaining_seconds = int((session_obj.expires_at - datetime.utcnow()).total_seconds())
    return {
        "active": True,
        "remaining_seconds": remaining_seconds,
        "expires_at": session_obj.expires_at.isoformat(),
        "message": f"Teaser active - {remaining_seconds} seconds remaining"
    }

# Include the router in the main app
app.include_router(api_router)

# API Key Management Service
class APIKeyService:
    def __init__(self):
        pass
    
    async def create_api_key(self, key_data: APIKeyCreate, created_by: str) -> APIKey:
        """Create a new API key"""
        api_key = APIKey(**key_data.dict(), created_by=created_by)
        await db.api_keys.insert_one(api_key.dict())
        return api_key
    
    async def get_api_key(self, key_type: APIKeyType, active_only: bool = True) -> Optional[APIKey]:
        """Get API key by type"""
        query = {"key_type": key_type.value}
        if active_only:
            query["status"] = APIKeyStatus.ACTIVE.value
        
        key_doc = await db.api_keys.find_one(query)
        if key_doc:
            return APIKey(**key_doc)
        return None
    
    async def get_all_api_keys(self) -> list[APIKey]:
        """Get all API keys"""
        keys = await db.api_keys.find().to_list(1000)
        return [APIKey(**key) for key in keys]
    
    async def update_api_key(self, key_id: str, update_data: APIKeyUpdate) -> bool:
        """Update an API key"""
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await db.api_keys.update_one(
            {"id": key_id},
            {"$set": update_dict}
        )
        return result.modified_count > 0
    
    async def delete_api_key(self, key_id: str) -> bool:
        """Delete an API key"""
        result = await db.api_keys.delete_one({"id": key_id})
        return result.deleted_count > 0

api_key_service = APIKeyService()

# Initialize video services
video_service = VideoConferencingService(api_key_service)
recording_service = VideoRecordingService(db)

# Initialize calendar service
calendar_service = CalendarIntegrationService(api_key_service, db)

# Initialize shipping service
shipping_service = ShippingLabelService(api_key_service, db)

# Initialize trial service
trial_service = TrialService(db)

# Video Conferencing API Routes
@api_router.post("/video/agora/token")
async def generate_agora_token(channel: str, uid: int = 0, role: int = 1):
    """Generate Agora RTC token for video conferencing"""
    try:
        token = await video_service.generate_agora_token(channel, uid, role)
        return {
            "success": True,
            "token": token,
            "channel": channel,
            "uid": uid,
            "expires_in": 3600
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token generation failed: {str(e)}")

@api_router.post("/video/twilio/token")
async def generate_twilio_token(identity: str, room: str):
    """Generate Twilio Video token for video conferencing"""
    try:
        token = await video_service.generate_twilio_token(identity, room)
        return {
            "success": True,
            "token": token,
            "identity": identity,
            "room": room
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token generation failed: {str(e)}")

@api_router.post("/video/jitsi/room")
async def create_jitsi_room(room_name: str, user_name: str):
    """Create Jitsi Meet room configuration"""
    try:
        config = await video_service.create_jitsi_room(room_name, user_name)
        return {
            "success": True,
            "config": config
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Room creation failed: {str(e)}")

@api_router.post("/video/recording/start")
async def start_video_recording(provider: str, session_data: dict):
    """Start video recording"""
    try:
        if provider == "agora":
            recording_data = await video_service.start_agora_recording(
                session_data["channel"],
                session_data["uid"]
            )
        elif provider == "twilio":
            recording_data = await video_service.start_twilio_recording(
                session_data["room_sid"]
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
        
        # Save recording metadata
        recording_metadata = {
            "provider": provider,
            "room_id": session_data.get("channel") or session_data.get("room_sid"),
            "session_id": session_data.get("session_id"),
            "performer_id": session_data.get("performer_id"),
            "participants": session_data.get("participants", []),
            "recording_sid": recording_data.get("sid") or recording_data.get("recording_sid"),
            "resource_id": recording_data.get("resource_id"),
            "status": "recording"
        }
        
        recording_id = await recording_service.save_recording_metadata(recording_metadata)
        
        return {
            "success": True,
            "recording_id": recording_id,
            "provider_data": recording_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Recording start failed: {str(e)}")

@api_router.post("/video/recording/stop/{recording_id}")
async def stop_video_recording(recording_id: str):
    """Stop video recording"""
    try:
        # Get recording metadata
        recording = await recording_service.get_recording_by_id(recording_id)
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        provider = recording["provider"]
        
        if provider == "agora":
            stop_data = await video_service.stop_agora_recording(
                recording["room_id"],
                str(recording.get("uid", "0")),
                recording["resource_id"],
                recording["recording_sid"]
            )
        elif provider == "twilio":
            stop_data = await video_service.stop_twilio_recording(
                recording["recording_sid"]
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
        
        # Update recording status
        await recording_service.update_recording_status(
            recording_id,
            "stopped",
            {
                "file_urls": stop_data.get("file_list", []),
                "duration": stop_data.get("duration"),
                "stopped_at": datetime.utcnow()
            }
        )
        
        return {
            "success": True,
            "recording_id": recording_id,
            "status": "stopped",
            "provider_data": stop_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Recording stop failed: {str(e)}")

@api_router.get("/video/recordings/{performer_id}")
async def get_performer_recordings(performer_id: str):
    """Get all recordings for a performer"""
    try:
        recordings = await recording_service.get_recordings_by_performer(performer_id)
        return {
            "success": True,
            "recordings": recordings
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch recordings: {str(e)}")

# Calendar Integration API Routes
@api_router.post("/calendar/google/auth")
async def initiate_google_calendar_auth(user_id: str):
    """Initiate Google Calendar OAuth flow"""
    try:
        auth_data = await calendar_service.initiate_google_oauth(user_id)
        return {
            "success": True,
            "authorization_url": auth_data["authorization_url"],
            "state": auth_data["state"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth initiation failed: {str(e)}")

@api_router.post("/calendar/google/callback")
async def handle_google_calendar_callback(code: str, state: str):
    """Handle Google Calendar OAuth callback"""
    try:
        result = await calendar_service.handle_google_callback(code, state)
        return {
            "success": True,
            "message": result["message"],
            "user_id": result["user_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {str(e)}")

@api_router.post("/calendar/sync-appointment")
async def sync_appointment_to_calendar(appointment_data: dict):
    """Sync appointment to connected calendars"""
    try:
        sync_results = await calendar_service.sync_appointment_to_calendars(appointment_data)
        return {
            "success": True,
            "sync_results": sync_results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calendar sync failed: {str(e)}")

@api_router.get("/calendar/integrations/{user_id}")
async def get_calendar_integrations(user_id: str):
    """Get user's calendar integrations"""
    try:
        integrations = await calendar_service.get_user_calendar_integrations(user_id)
        return {
            "success": True,
            "integrations": integrations
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch integrations: {str(e)}")

@api_router.delete("/calendar/integrations/{user_id}/{provider}")
async def disconnect_calendar_integration(user_id: str, provider: str):
    """Disconnect a calendar integration"""
    try:
        success = await calendar_service.disconnect_calendar_integration(user_id, provider)
        if success:
            return {"success": True, "message": "Calendar integration disconnected"}
        else:
            raise HTTPException(status_code=404, detail="Integration not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to disconnect integration: {str(e)}")

# Shipping Label API Routes
@api_router.post("/shipping/labels")
async def create_shipping_label(label_request: dict):
    """Create a shipping label"""
    try:
        provider = label_request.get("provider", "usps")
        to_address = label_request["to_address"]
        from_address = label_request["from_address"]
        package_info = label_request["package_info"]
        order_id = label_request.get("order_id")
        
        label_data = await shipping_service.create_shipping_label(
            provider, to_address, from_address, package_info, order_id
        )
        
        return {
            "success": True,
            "shipping_id": label_data["shipping_id"],
            "tracking_number": label_data["tracking_number"],
            "label_image": label_data["label_image"],
            "shipping_cost": label_data["shipping_cost"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Label creation failed: {str(e)}")

@api_router.get("/shipping/track/{tracking_number}")
async def track_shipment(tracking_number: str, provider: str = "usps"):
    """Track a shipment"""
    try:
        tracking_data = await shipping_service.track_shipment(tracking_number, provider)
        return {
            "success": True,
            "tracking_data": tracking_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Tracking failed: {str(e)}")

@api_router.get("/shipping/labels/{performer_id}")
async def get_performer_shipping_labels(performer_id: str):
    """Get all shipping labels for a performer"""
    try:
        labels = await shipping_service.get_shipping_labels_by_performer(performer_id)
        return {
            "success": True,
            "shipping_labels": labels
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch shipping labels: {str(e)}")

@api_router.post("/shipping/labels/{shipping_id}/save")
async def save_label_image(shipping_id: str, label_image_base64: str):
    """Save shipping label image to file"""
    try:
        file_path = await shipping_service.save_label_image(shipping_id, label_image_base64)
        return {
            "success": True,
            "file_path": file_path,
            "message": "Label image saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save label image: {str(e)}")

# Trial Management API Routes
@api_router.post("/trials/create")
async def create_trial(user_id: str, trial_type: str, trial_duration_days: int = 7):
    """Create a new trial for a user"""
    try:
        trial = await trial_service.create_trial(user_id, trial_type, trial_duration_days)
        return {
            "success": True,
            "trial": trial.dict(),
            "message": f"7-day free trial activated for {trial_type}!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create trial: {str(e)}")

@api_router.get("/trials/{user_id}")
async def get_user_trial(user_id: str):
    """Get user's current trial status"""
    try:
        trial = await trial_service.get_user_trial(user_id)
        if trial:
            return {
                "success": True,
                "trial": trial.dict()
            }
        else:
            return {
                "success": True,
                "trial": None,
                "message": "No active trial found"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get trial: {str(e)}")

@api_router.get("/trials/{user_id}/access")
async def check_trial_access(user_id: str, feature: str = None):
    """Check user's trial access to features"""
    try:
        access_info = await trial_service.check_trial_access(user_id, feature)
        return {
            "success": True,
            "access": access_info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to check access: {str(e)}")

@api_router.post("/trials/{user_id}/convert")
async def convert_trial_to_paid(user_id: str, subscription_type: str):
    """Convert trial to paid subscription"""
    try:
        success = await trial_service.convert_trial_to_paid(user_id, subscription_type)
        return {
            "success": success,
            "message": "Trial successfully converted to paid subscription!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to convert trial: {str(e)}")

@api_router.post("/trials/{user_id}/extend")
async def extend_trial(user_id: str, additional_days: int):
    """Extend a trial by additional days"""
    try:
        trial = await trial_service.extend_trial(user_id, additional_days)
        return {
            "success": True,
            "trial": trial.dict(),
            "message": f"Trial extended by {additional_days} days!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extend trial: {str(e)}")

@api_router.post("/trials/{user_id}/expire")
async def expire_trial(user_id: str):
    """Manually expire a trial"""
    try:
        success = await trial_service.expire_trial(user_id)
        return {
            "success": success,
            "message": "Trial expired successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to expire trial: {str(e)}")

@api_router.get("/admin/trials/stats")
async def get_trial_statistics(trial_type: str = None):
    """Get trial statistics for admin"""
    try:
        stats = await trial_service.get_trial_statistics(trial_type)
        return {
            "success": True,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get statistics: {str(e)}")

@api_router.get("/admin/trials/expiring")
async def get_expiring_trials(days_threshold: int = 1):
    """Get trials expiring within specified days"""
    try:
        trials = await trial_service.get_expiring_trials(days_threshold)
        return {
            "success": True,
            "expiring_trials": [trial.dict() for trial in trials],
            "count": len(trials)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get expiring trials: {str(e)}")

@api_router.post("/trials/{user_id}/reminder")
async def send_trial_reminder(user_id: str, reminder_type: str):
    """Send trial reminder notification"""
    try:
        success = await trial_service.send_trial_reminder(user_id, reminder_type)
        return {
            "success": success,
            "message": "Reminder sent successfully" if success else "Failed to send reminder"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to send reminder: {str(e)}")

@api_router.post("/admin/trials/cleanup")
async def cleanup_expired_trials():
    """Clean up expired trials"""
    try:
        count = await trial_service.cleanup_expired_trials()
        return {
            "success": True,
            "cleaned_up": count,
            "message": f"Cleaned up {count} expired trials"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to cleanup trials: {str(e)}")

@api_router.get("/video/recordings/{recording_id}/download")
async def download_recording(recording_id: str):
    """Download a recording file"""
    try:
        recording = await recording_service.get_recording_by_id(recording_id)
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        file_urls = recording.get("file_urls", [])
        if not file_urls:
            raise HTTPException(status_code=404, detail="No recording files available")
        
        # Download the first file (you can extend this to handle multiple files)
        file_url = file_urls[0] if isinstance(file_urls, list) else file_urls
        local_path = await recording_service.download_recording_file(recording_id, file_url)
        
        if not local_path:
            raise HTTPException(status_code=500, detail="Failed to download recording")
        
        return {
            "success": True,
            "download_path": local_path,
            "recording_id": recording_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Download failed: {str(e)}")

@api_router.get("/video/twilio/recordings/{room_sid}")
async def get_twilio_room_recordings(room_sid: str):
    """Get Twilio recordings for a specific room"""
    try:
        recordings = await video_service.get_twilio_recordings(room_sid)
        return {
            "success": True,
            "recordings": recordings
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch recordings: {str(e)}")

# Admin API Routes
@api_router.post("/admin/api-keys", response_model=APIKey)
async def create_api_key(key_data: APIKeyCreate, created_by: str = "admin"):
    """Create a new API key"""
    return await api_key_service.create_api_key(key_data, created_by)

@api_router.get("/admin/api-keys", response_model=list[APIKey])
async def get_all_api_keys():
    """Get all API keys"""
    return await api_key_service.get_all_api_keys()

@api_router.get("/admin/api-keys/{key_type}", response_model=APIKey)
async def get_api_key_by_type(key_type: APIKeyType):
    """Get API key by type"""
    key = await api_key_service.get_api_key(key_type)
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    return key

@api_router.put("/admin/api-keys/{key_id}", response_model=dict)
async def update_api_key(key_id: str, update_data: APIKeyUpdate):
    """Update an API key"""
    success = await api_key_service.update_api_key(key_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"success": True, "message": "API key updated successfully"}

@api_router.delete("/admin/api-keys/{key_id}", response_model=dict)
async def delete_api_key(key_id: str):
    """Delete an API key"""
    success = await api_key_service.delete_api_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"success": True, "message": "API key deleted successfully"}

# Appointment Booking API Routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: dict):
    """Create a new appointment"""
    appointment = Appointment(**appointment_data)
    await db.appointments.insert_one(appointment.dict())
    return appointment

@api_router.get("/performer/{performer_id}/appointments", response_model=list[Appointment])
async def get_performer_appointments(performer_id: str):
    """Get all appointments for a performer"""
    appointments = await db.appointments.find({"performer_id": performer_id}).to_list(1000)
    return [Appointment(**apt) for apt in appointments]

@api_router.get("/member/{member_id}/appointments", response_model=list[Appointment])
async def get_member_appointments(member_id: str):
    """Get all appointments for a member"""
    appointments = await db.appointments.find({"member_id": member_id}).to_list(1000)
    return [Appointment(**apt) for apt in appointments]

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: AppointmentStatus):
    """Update appointment status"""
    update_data = {"status": status.value, "updated_at": datetime.utcnow()}
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": "Appointment status updated"}

@api_router.post("/performer/{performer_id}/availability", response_model=AppointmentAvailability)
async def create_availability(performer_id: str, availability_data: dict):
    """Create availability schedule for performer"""
    availability_data["performer_id"] = performer_id
    availability = AppointmentAvailability(**availability_data)
    await db.appointment_availability.insert_one(availability.dict())
    return availability

@api_router.get("/performer/{performer_id}/availability", response_model=list[AppointmentAvailability])
async def get_performer_availability(performer_id: str):
    """Get performer's availability schedule"""
    availability = await db.appointment_availability.find({"performer_id": performer_id}).to_list(1000)
    return [AppointmentAvailability(**avail) for avail in availability]

# Chat System API Routes
@api_router.post("/chat/rooms", response_model=ChatRoom)
async def create_chat_room(chat_data: dict):
    """Create a new chat room"""
    chat_room = ChatRoom(**chat_data)
    await db.chat_rooms.insert_one(chat_room.dict())
    return chat_room

@api_router.get("/chat/rooms/{user_id}", response_model=list[ChatRoom])
async def get_user_chat_rooms(user_id: str):
    """Get all chat rooms for a user"""
    chat_rooms = await db.chat_rooms.find({"participants": user_id}).to_list(1000)
    return [ChatRoom(**room) for room in chat_rooms]

@api_router.post("/chat/rooms/{room_id}/messages", response_model=ChatMessage)
async def send_message(room_id: str, message_data: dict):
    """Send a message to a chat room"""
    message_data["chat_room_id"] = room_id
    message = ChatMessage(**message_data)
    await db.chat_messages.insert_one(message.dict())
    
    # Update chat room last message timestamp
    await db.chat_rooms.update_one(
        {"id": room_id},
        {"$set": {"last_message_at": datetime.utcnow()}, "$inc": {"message_count": 1}}
    )
    
    return message

@api_router.get("/chat/rooms/{room_id}/messages", response_model=list[ChatMessage])
async def get_chat_messages(room_id: str, limit: int = 50, offset: int = 0):
    """Get messages from a chat room"""
    messages = await db.chat_messages.find(
        {"chat_room_id": room_id}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    return [ChatMessage(**msg) for msg in reversed(messages)]

@api_router.put("/chat/messages/{message_id}/read")
async def mark_message_read(message_id: str, user_id: str):
    """Mark a message as read"""
    result = await db.chat_messages.update_one(
        {"id": message_id},
        {"$addToSet": {"read_by": user_id}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"success": True, "message": "Message marked as read"}

# File Upload API Routes
@api_router.post("/files/upload", response_model=UploadedFile)
async def upload_file(file_data: dict):
    """Upload a file"""
    uploaded_file = UploadedFile(**file_data)
    await db.uploaded_files.insert_one(uploaded_file.dict())
    return uploaded_file

@api_router.get("/files/{file_id}", response_model=UploadedFile)
async def get_file(file_id: str):
    """Get file information"""
    file_doc = await db.uploaded_files.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    return UploadedFile(**file_doc)

@api_router.get("/files/{file_id}/download")
async def download_file(file_id: str, user_id: str):
    """Download a file (with access control)"""
    file_doc = await db.uploaded_files.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_obj = UploadedFile(**file_doc)
    
    # Check access permissions
    if file_obj.is_private and file_obj.uploader_id != user_id:
        if file_obj.is_paid_content:
            # Check if user has paid for this file
            # TODO: Implement payment verification
            pass
        else:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Update download count
    await db.uploaded_files.update_one(
        {"id": file_id},
        {"$inc": {"download_count": 1}}
    )
    
    return {"download_url": file_obj.storage_path, "filename": file_obj.original_filename}

# Store and Products API Routes
@api_router.post("/store/products", response_model=Product)
async def create_product(product_data: dict):
    """Create a new product"""
    product = Product(**product_data)
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/store/performer/{performer_id}/products", response_model=list[Product])
async def get_performer_products(performer_id: str):
    """Get all products for a performer"""
    products = await db.products.find({"performer_id": performer_id}).to_list(1000)
    return [Product(**prod) for prod in products]

@api_router.post("/store/orders", response_model=Order)
async def create_order(order_data: dict):
    """Create a new order"""
    order = Order(**order_data)
    await db.orders.insert_one(order.dict())
    return order

@api_router.get("/store/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order details"""
    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order_doc)

@api_router.put("/store/orders/{order_id}/shipping")
async def update_order_shipping(order_id: str, shipping_data: dict):
    """Update order shipping information"""
    update_data = {**shipping_data, "updated_at": datetime.utcnow()}
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "message": "Shipping information updated"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
