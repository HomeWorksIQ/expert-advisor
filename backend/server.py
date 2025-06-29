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
from api_key_models import (
    APIKey, APIKeyCreate, APIKeyUpdate, APIKeyType, APIKeyStatus,
    Appointment, AppointmentAvailability, AppointmentType, AppointmentStatus,
    ChatRoom, ChatMessage, ChatType, MessageType,
    UploadedFile, FileType,
    Product, Order, ProductType, ShippingProvider
)


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
