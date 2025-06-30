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
from performer_search_service import PerformerSearchService
from affiliate_credits_service import AffiliateService, CreditService, PayoutService, ShoppingCartService
from affiliate_credits_models import (
    AffiliateProgram, ReferralTracking, CreditAccount, CreditTransaction,
    ExpertPayoutAccount, PayoutRequest, PayoutHistory, ShoppingCart, CartItem,
    AffiliateStatus, CreditTransactionType, PayoutStatus, PayoutMethod
)
from member_auth_service import MemberAuthService
from member_profile_service import MemberProfileService


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
            country="United States",
            country_code="US",
            state="Massachusetts", 
            state_code="MA",
            city="Boston",
            zip_code="02115",
            latitude=42.3601,
            longitude=-71.0589
        ),
        Location(
            country="United States",
            country_code="US",
            state="Texas", 
            state_code="TX",
            city="Austin",
            zip_code="78701",
            latitude=30.2672,
            longitude=-97.7431
        ),
        Location(
            country="United States",
            country_code="US",
            state="Florida", 
            state_code="FL",
            city="Miami",
            zip_code="33101",
            latitude=25.7617,
            longitude=-80.1918
        ),
        Location(
            country="Canada",
            country_code="CA",
            state="Ontario",
            state_code="ON",
            city="Toronto",
            zip_code="M5H 2N2",
            latitude=43.6532,
            longitude=-79.3832
        )
    ]
    
    # Randomly select a location for demo purposes
    # In production, this would use actual IP geolocation
    import random
    return random.choice(mock_locations)

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

# Expert API Aliases (for platform transformation from performer to expert platform)
# These endpoints provide expert-friendly aliases to the existing performer endpoints

@api_router.get("/experts/{expert_id}/profile")
async def get_expert_profile(expert_id: str):
    """Get expert profile (alias for performer profile)"""
    return await get_performer_profile(expert_id)

@api_router.post("/experts/profile")
async def create_expert_profile(profile_data: dict):
    """Create expert profile (alias for performer profile)"""
    return await create_performer_profile(profile_data)

@api_router.get("/experts/{expert_id}/consultations")
async def get_expert_consultations(expert_id: str):
    """Get expert consultations (alias for performer appointments)"""
    return await get_performer_appointments(expert_id)

@api_router.get("/clients/{client_id}/consultations")
async def get_client_consultations(client_id: str):
    """Get client consultations (alias for member appointments)"""
    return await get_member_appointments(client_id)

@api_router.get("/experts/search-by-location")
async def search_experts_by_location(
    zip_code: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    radius: Optional[int] = 25,
    category: Optional[str] = None
):
    """Search experts by geographic location with radius"""
    try:
        # Mock implementation for demonstration
        # In production, this would use geolocation services and database queries
        
        base_experts = [
            {
                "id": 1,
                "name": "Dr. Sarah Chen",
                "specialty": "Family Medicine",
                "location": {"city": "Boston", "state": "MA", "zip": "02115"},
                "distance": 5.2,
                "hourly_rate": 150
            },
            {
                "id": 2,
                "name": "James Wilson",
                "specialty": "Life Insurance",
                "location": {"city": "Cambridge", "state": "MA", "zip": "02138"},
                "distance": 8.7,
                "hourly_rate": 100
            },
            {
                "id": 3,
                "name": "David Thompson",
                "specialty": "Business Consulting",
                "location": {"city": "Newton", "state": "MA", "zip": "02458"},
                "distance": 12.3,
                "hourly_rate": 200
            }
        ]
        
        # Filter by radius
        filtered_experts = [expert for expert in base_experts if expert["distance"] <= radius]
        
        # Filter by category if specified
        if category:
            category_map = {
                "medical": ["Family Medicine", "Cardiology", "Mental Health"],
                "insurance": ["Life Insurance", "Health Insurance"],
                "business": ["Business Consulting", "Financial Consulting"]
            }
            relevant_specialties = category_map.get(category, [])
            filtered_experts = [expert for expert in filtered_experts if expert["specialty"] in relevant_specialties]
        
        search_location = ""
        if zip_code:
            # Add city lookup for zip code (mock implementation)
            zip_to_city = {
                "02115": "Boston, MA",
                "02138": "Cambridge, MA", 
                "02458": "Newton, MA"
            }
            city_name = zip_to_city.get(zip_code, "Unknown City")
            search_location = f"{zip_code} ({city_name})"
        elif city and state:
            search_location = f"{city}, {state}"
        elif city:
            search_location = city
            
        return {
            "success": True,
            "experts": filtered_experts,
            "search_params": {
                "location": search_location,
                "radius": radius,
                "category": category,
                "total_results": len(filtered_experts)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location search failed: {str(e)}")

# Social Authentication Routes
@api_router.get("/auth/{provider}")
async def initiate_social_auth(provider: str):
    """Initiate social authentication flow"""
    try:
        # OAuth URLs for different providers
        auth_urls = {
            "google": f"https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=openid email profile&response_type=code&state=google",
            "linkedin": f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_LINKEDIN_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=linkedin&scope=r_liteprofile r_emailaddress",
            "facebook": f"https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=email&state=facebook",
            "github": f"https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=user:email&state=github"
        }
        
        if provider not in auth_urls:
            raise HTTPException(status_code=400, detail="Unsupported authentication provider")
        
        return {
            "success": True,
            "auth_url": auth_urls[provider],
            "provider": provider
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social auth initiation failed: {str(e)}")

@api_router.post("/auth/{provider}/callback")
async def handle_social_auth_callback(provider: str, code: str, state: str):
    """Handle social authentication callback"""
    try:
        # In production, this would:
        # 1. Exchange code for access token
        # 2. Fetch user profile from provider
        # 3. Create or update user account
        # 4. Generate JWT token for the session
        
        # Mock response for demo
        mock_user_data = {
            "google": {"email": "user@gmail.com", "name": "Google User", "picture": "https://example.com/avatar.jpg"},
            "linkedin": {"email": "user@linkedin.com", "name": "LinkedIn User", "picture": "https://example.com/avatar.jpg"},
            "facebook": {"email": "user@facebook.com", "name": "Facebook User", "picture": "https://example.com/avatar.jpg"},
            "github": {"email": "user@github.com", "name": "GitHub User", "picture": "https://example.com/avatar.jpg"}
        }
        
        user_data = mock_user_data.get(provider, {})
        
        return {
            "success": True,
            "user": user_data,
            "access_token": "mock_jwt_token_here",
            "provider": provider
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social auth callback failed: {str(e)}")

@api_router.get("/experts/discover")
async def discover_experts(
    category: Optional[str] = None,
    location: Optional[str] = None,
    zipCode: Optional[str] = None,
    radius: Optional[str] = None,
    status: Optional[str] = None,
    experienceLevel: Optional[str] = None,
    sortBy: Optional[str] = None,
    limit: int = 50
):
    """Enhanced expert discovery with comprehensive filtering"""
    try:
        # This would normally query the database, but for demo we'll return mock data
        # In a real implementation, this would filter the experts collection in MongoDB
        
        mock_experts = [
            # Medical Experts
            {
                "id": 1,
                "name": "Dr. Sarah Chen",
                "category": "medical",
                "specialty": "Family Medicine",
                "location": {"city": "Boston", "state": "MA", "zipCode": "02115"},
                "experienceLevel": "expert",
                "yearsOfExperience": 15,
                "isOnline": True,
                "rating": 4.9,
                "consultationRate": 150,
                "profileImage": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
                "credentials": ["MD", "Board Certified"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 2,
                "name": "Dr. Michael Rodriguez",
                "category": "medical",
                "specialty": "Cardiology",
                "location": {"city": "Houston", "state": "TX", "zipCode": "77002"},
                "experienceLevel": "expert",
                "yearsOfExperience": 20,
                "isOnline": False,
                "rating": 4.8,
                "consultationRate": 250,
                "profileImage": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
                "credentials": ["MD", "FACC"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 3,
                "name": "Dr. Emily Foster",
                "category": "medical",
                "specialty": "Pediatrics",
                "location": {"city": "Los Angeles", "state": "CA", "zipCode": "90210"},
                "experienceLevel": "experienced",
                "yearsOfExperience": 12,
                "isOnline": True,
                "rating": 4.7,
                "consultationRate": 180,
                "profileImage": "https://images.unsplash.com/photo-1582750433449-648ed127bb54",
                "credentials": ["MD", "Pediatric Board Certified"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Insurance Experts
            {
                "id": 4,
                "name": "James Wilson",
                "category": "insurance",
                "specialty": "Life Insurance",
                "location": {"city": "Denver", "state": "CO", "zipCode": "80202"},
                "experienceLevel": "experienced",
                "yearsOfExperience": 15,
                "isOnline": True,
                "rating": 4.7,
                "consultationRate": 100,
                "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                "credentials": ["Licensed Agent"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 5,
                "name": "Lisa Anderson",
                "category": "insurance",
                "specialty": "Auto & Home Insurance",
                "location": {"city": "Phoenix", "state": "AZ", "zipCode": "85001"},
                "experienceLevel": "expert",
                "yearsOfExperience": 18,
                "isOnline": True,
                "rating": 4.8,
                "consultationRate": 85,
                "profileImage": "https://images.unsplash.com/photo-1494790108755-2616c8da6ad6",
                "credentials": ["Licensed Agent", "CPCU"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Business Experts
            {
                "id": 6,
                "name": "David Thompson",
                "category": "business",
                "specialty": "Strategy Consulting",
                "location": {"city": "Seattle", "state": "WA", "zipCode": "98101"},
                "experienceLevel": "expert",
                "yearsOfExperience": 22,
                "isOnline": True,
                "rating": 4.9,
                "consultationRate": 200,
                "profileImage": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                "credentials": ["MBA", "CPA"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 7,
                "name": "Amanda Rodriguez",
                "category": "business",
                "specialty": "Marketing Strategy",
                "location": {"city": "Miami", "state": "FL", "zipCode": "33101"},
                "experienceLevel": "experienced",
                "yearsOfExperience": 10,
                "isOnline": False,
                "rating": 4.6,
                "consultationRate": 175,
                "profileImage": "https://images.unsplash.com/photo-1580489944761-15a19d654956",
                "credentials": ["MBA", "PMP"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Education Experts
            {
                "id": 8,
                "name": "Professor Robert Adams",
                "category": "education",
                "specialty": "Mathematics",
                "location": {"city": "Boston", "state": "MA", "zipCode": "02116"},
                "experienceLevel": "expert",
                "yearsOfExperience": 25,
                "isOnline": True,
                "rating": 4.9,
                "consultationRate": 75,
                "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                "credentials": ["PhD Mathematics"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 9,
                "name": "Jennifer Kim",
                "category": "education",
                "specialty": "Language Learning",
                "location": {"city": "San Francisco", "state": "CA", "zipCode": "94102"},
                "experienceLevel": "experienced",
                "yearsOfExperience": 8,
                "isOnline": True,
                "rating": 4.8,
                "consultationRate": 60,
                "profileImage": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                "credentials": ["MA Linguistics", "TESOL Certified"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 10,
                "name": "Marcus Johnson",
                "category": "education",
                "specialty": "SAT/ACT Prep",
                "location": {"city": "Chicago", "state": "IL", "zipCode": "60601"},
                "experienceLevel": "intermediate",
                "yearsOfExperience": 6,
                "isOnline": True,
                "rating": 4.7,
                "consultationRate": 55,
                "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                "credentials": ["MS Education", "SAT Certified"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Legal Experts
            {
                "id": 11,
                "name": "Attorney Michelle Stone",
                "category": "legal",
                "specialty": "Family Law",
                "location": {"city": "Atlanta", "state": "GA", "zipCode": "30309"},
                "experienceLevel": "expert",
                "yearsOfExperience": 16,
                "isOnline": False,
                "rating": 4.8,
                "consultationRate": 300,
                "profileImage": "https://images.unsplash.com/photo-1594736797933-d0ff1d1e2e8e",
                "credentials": ["JD", "State Bar Certified"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 12,
                "name": "Richard Parker",
                "category": "legal",
                "specialty": "Business Law",
                "location": {"city": "New York", "state": "NY", "zipCode": "10001"},
                "experienceLevel": "expert",
                "yearsOfExperience": 24,
                "isOnline": True,
                "rating": 4.9,
                "consultationRate": 450,
                "profileImage": "https://images.unsplash.com/photo-1556157382-97eda2d62296",
                "credentials": ["JD", "LLM", "NY Bar"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Financial Experts
            {
                "id": 13,
                "name": "Thomas Bradford",
                "category": "financial",
                "specialty": "Investment Planning",
                "location": {"city": "Dallas", "state": "TX", "zipCode": "75201"},
                "experienceLevel": "expert",
                "yearsOfExperience": 19,
                "isOnline": True,
                "rating": 4.8,
                "consultationRate": 275,
                "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                "credentials": ["CFP", "CFA"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            {
                "id": 14,
                "name": "Sophia Williams",
                "category": "financial",
                "specialty": "Retirement Planning",
                "location": {"city": "Portland", "state": "OR", "zipCode": "97201"},
                "experienceLevel": "experienced",
                "yearsOfExperience": 11,
                "isOnline": True,
                "rating": 4.7,
                "consultationRate": 225,
                "profileImage": "https://images.unsplash.com/photo-1580489944761-15a19d654956",
                "credentials": ["CFP", "ChFC"],
                "availableFor": ["chat", "video_call", "in_person"]
            },
            # Technology Experts
            {
                "id": 15,
                "name": "Kevin Zhang",
                "category": "technology",
                "specialty": "Cybersecurity",
                "location": {"city": "Austin", "state": "TX", "zipCode": "78701"},
                "experienceLevel": "expert",
                "yearsOfExperience": 14,
                "isOnline": True,
                "rating": 4.9,
                "consultationRate": 225,
                "profileImage": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                "credentials": ["CISSP", "CEH"],
                "availableFor": ["chat", "video_call", "in_person"]
            }
        ]
        
        # Apply filters
        filtered_experts = mock_experts
        
        # Filter by category
        if category and category != 'all':
            filtered_experts = [e for e in filtered_experts if e['category'] == category]
        
        # Filter by status
        if status and status != 'all':
            if status == 'online':
                filtered_experts = [e for e in filtered_experts if e['isOnline']]
            elif status == 'offline':
                filtered_experts = [e for e in filtered_experts if not e['isOnline']]
        
        # Filter by experience level
        if experienceLevel and experienceLevel != 'all':
            experience_map = {
                'entry': (0, 2),
                'intermediate': (3, 7),
                'experienced': (8, 15),
                'expert': (16, 100)
            }
            if experienceLevel in experience_map:
                min_exp, max_exp = experience_map[experienceLevel]
                filtered_experts = [e for e in filtered_experts if min_exp <= e['yearsOfExperience'] <= max_exp]
        
        # Sort results
        if sortBy:
            if sortBy == 'rating':
                filtered_experts.sort(key=lambda x: x['rating'], reverse=True)
            elif sortBy == 'price_low':
                filtered_experts.sort(key=lambda x: x['consultationRate'])
            elif sortBy == 'price_high':
                filtered_experts.sort(key=lambda x: x['consultationRate'], reverse=True)
            elif sortBy == 'experience':
                filtered_experts.sort(key=lambda x: x['yearsOfExperience'], reverse=True)
        
        # Apply limit
        filtered_experts = filtered_experts[:limit]
        
        return {
            "success": True,
            "experts": filtered_experts,
            "total": len(filtered_experts),
            "filters_applied": {
                "category": category,
                "location": location,
                "status": status,
                "experienceLevel": experienceLevel,
                "sortBy": sortBy
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Expert discovery failed: {str(e)}")

@api_router.get("/experts/search")
async def search_experts(
    category: Optional[str] = None,
    level: Optional[str] = None,
    location: Optional[str] = None,
    online_only: bool = False
):
    """Search experts (enhanced version of performer search)"""
    # Map expert parameters to performer search parameters
    gender_filter = None
    if category:
        # Map expertise categories to search terms that work with existing data
        expertise_map = {
            "legal": ["law", "legal", "attorney"],
            "medical": ["doctor", "medical", "health"],
            "financial": ["financial", "finance", "money"],
            "accounting": ["accounting", "tax", "cpa"],
            "business": ["business", "consulting", "strategy"]
        }
        if category in expertise_map:
            # For now, return a mock response since we need to update the search service
            return {
                "experts": [],
                "total": 0,
                "message": f"Expert search for {category} category - API endpoint ready for integration"
            }
    
    # Return existing performer search for now
    search_service = PerformerSearchService(db)
    return await search_service.search_performers({
        "online_only": online_only,
        "location": location
    })

@api_router.get("/experts/categories")
async def get_expert_categories():
    """Get available expert categories"""
    return {
        "categories": [
            {"id": "legal", "name": "Legal", "description": "Attorneys, lawyers, legal advisors"},
            {"id": "medical", "name": "Medical", "description": "Doctors, physicians, healthcare professionals"},
            {"id": "financial", "name": "Financial", "description": "Financial planners, investment advisors"},
            {"id": "accounting", "name": "Accounting", "description": "CPAs, tax specialists, bookkeepers"},
            {"id": "business", "name": "Business", "description": "Business consultants, strategy advisors"},
            {"id": "technology", "name": "Technology", "description": "IT consultants, software architects"},
            {"id": "education", "name": "Education", "description": "Educational specialists, tutors"},
            {"id": "marketing", "name": "Marketing", "description": "Marketing specialists, brand consultants"},
            {"id": "real_estate", "name": "Real Estate", "description": "Real estate brokers, property advisors"},
            {"id": "insurance", "name": "Insurance", "description": "Insurance agents, risk advisors"}
        ]
    }

@api_router.get("/experts/featured")
async def get_featured_experts():
    """Get featured experts"""
    # For now, return sample expert data
    featured_experts = [
        {
            "id": "expert_001",
            "name": "Dr. Sarah Chen",
            "title": "Senior Corporate Attorney",
            "category": "legal",
            "rating": 4.9,
            "consultations": 1247,
            "rate": 350.0,
            "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
        },
        {
            "id": "expert_002",
            "name": "Dr. Priya Patel",
            "title": "Internal Medicine Physician",
            "category": "medical",
            "rating": 4.9,
            "consultations": 1456,
            "rate": 200.0,
            "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54"
        },
        {
            "id": "expert_003",
            "name": "Jennifer Thompson",
            "title": "Certified Financial Planner",
            "category": "financial",
            "rating": 4.8,
            "consultations": 734,
            "rate": 250.0,
            "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956"
        }
    ]
    return {"featured_experts": featured_experts}

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

# Initialize performer search service
performer_search_service = PerformerSearchService(db)

# Initialize affiliate, credits, and payout services
affiliate_service = AffiliateService(db)
credit_service = CreditService(db)
payout_service = PayoutService(db)
cart_service = ShoppingCartService(db)

# Initialize member services
member_auth_service = MemberAuthService(db)
member_profile_service = MemberProfileService(db)

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

# Trial Settings Management
@api_router.get("/admin/trial-settings")
async def get_trial_settings():
    """Get current trial settings"""
    try:
        settings = await db.trial_settings.find_one({"setting_type": "global"})
        if not settings:
            # Create default settings
            default_settings = {
                "setting_type": "global",
                "performer_trial_days": 7,
                "member_trial_days": 7,
                "trial_enabled": True,
                "auto_remind_days": [3, 1],
                "trial_benefits_performer": [
                    "premium_analytics",
                    "advanced_messaging", 
                    "live_streaming",
                    "video_calls",
                    "content_monetization",
                    "priority_support"
                ],
                "trial_benefits_member": [
                    "premium_content_access",
                    "hd_streaming",
                    "download_content",
                    "advanced_search",
                    "priority_messaging",
                    "ad_free_experience"
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.trial_settings.insert_one(default_settings)
            settings = default_settings
        
        return {
            "success": True,
            "settings": settings
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get trial settings: {str(e)}")

@api_router.put("/admin/trial-settings")
async def update_trial_settings(settings_data: dict):
    """Update trial settings"""
    try:
        settings_data["updated_at"] = datetime.utcnow()
        
        result = await db.trial_settings.update_one(
            {"setting_type": "global"},
            {"$set": settings_data},
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Trial settings updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update trial settings: {str(e)}")

@api_router.get("/trial-settings/public")
async def get_public_trial_settings():
    """Get public trial settings for join page"""
    try:
        settings = await db.trial_settings.find_one({"setting_type": "global"})
        if not settings:
            return {
                "success": True,
                "trial_enabled": True,
                "performer_trial_days": 7,
                "member_trial_days": 7
            }
        
        return {
            "success": True,
            "trial_enabled": settings.get("trial_enabled", True),
            "performer_trial_days": settings.get("performer_trial_days", 7),
            "member_trial_days": settings.get("member_trial_days", 7)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get public trial settings: {str(e)}")

# Performer Search API Routes
@api_router.post("/performers/search")
async def search_performers(search_params: dict):
    """Advanced performer search with filters"""
    try:
        from api_key_models import PerformerSearch
        search = PerformerSearch(**search_params)
        results = await performer_search_service.search_performers(search)
        return {
            "success": True,
            **results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Search failed: {str(e)}")

@api_router.get("/performers/filters")
async def get_performer_filter_options():
    """Get available filter options for performer search"""
    try:
        options = await performer_search_service.get_filter_options()
        return {
            "success": True,
            "filter_options": options
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get filter options: {str(e)}")

@api_router.get("/performers/locations/{location_type}")
async def get_location_suggestions(location_type: str, query: str):
    """Get location suggestions for autocomplete"""
    try:
        suggestions = await performer_search_service.get_location_suggestions(query, location_type)
        return {
            "success": True,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get suggestions: {str(e)}")

@api_router.post("/performers/profile")
async def create_performer_profile(profile_data: dict):
    """Create or update performer profile"""
    try:
        profile = await performer_search_service.create_performer_profile(profile_data)
        return {
            "success": True,
            "profile": profile.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create profile: {str(e)}")

@api_router.put("/performers/{user_id}/profile")
async def update_performer_profile(user_id: str, profile_data: dict):
    """Update performer profile"""
    try:
        success = await performer_search_service.update_performer_profile(user_id, profile_data)
        if success:
            return {"success": True, "message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update profile: {str(e)}")

@api_router.get("/performers/{user_id}/profile")
async def get_performer_profile(user_id: str):
    """Get performer profile"""
    try:
        profile = await performer_search_service.get_performer_profile(user_id)
        if profile:
            return {
                "success": True,
                "profile": profile.dict()
            }
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get profile: {str(e)}")

@api_router.post("/performers/{user_id}/view")
async def increment_performer_views(user_id: str):
    """Increment performer view count"""
    try:
        success = await performer_search_service.increment_view_count(user_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to increment views: {str(e)}")

@api_router.put("/performers/{user_id}/status")
async def update_performer_status(user_id: str, status: str):
    """Update performer online status"""
    try:
        success = await performer_search_service.update_online_status(user_id, status)
        if success:
            return {"success": True, "message": "Status updated"}
        else:
            raise HTTPException(status_code=404, detail="Performer not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update status: {str(e)}")

# =============================================================================
# MEMBER AUTHENTICATION API ROUTES
# =============================================================================

@api_router.post("/members/register")
async def register_member(registration_data: dict):
    """Register a new member with email/password"""
    try:
        result = await member_auth_service.register_member(registration_data)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Registration failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@api_router.post("/members/login")
async def login_member(login_data: dict):
    """Login member with email/password"""
    try:
        email = login_data.get('email', '')
        password = login_data.get('password', '')
        
        result = await member_auth_service.login_member(email, password)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=401, detail=result.get('message', 'Login failed'))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

@api_router.post("/members/logout")
async def logout_member(logout_data: dict):
    """Logout member and invalidate session"""
    try:
        session_token = logout_data.get('session_token', '')
        
        result = await member_auth_service.logout_member(session_token)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Logout failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Logout failed: {str(e)}")

@api_router.post("/members/verify-email")
async def verify_member_email(verification_data: dict):
    """Verify member email address"""
    try:
        token = verification_data.get('token', '')
        
        result = await member_auth_service.verify_email(token)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Email verification failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Email verification failed: {str(e)}")

@api_router.post("/members/forgot-password")
async def forgot_member_password(request_data: dict):
    """Request password reset for member"""
    try:
        email = request_data.get('email', '')
        
        result = await member_auth_service.forgot_password(email)
        return result  # Always return success for security
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Password reset request failed: {str(e)}")

@api_router.post("/members/reset-password")
async def reset_member_password(reset_data: dict):
    """Reset member password"""
    try:
        token = reset_data.get('token', '')
        new_password = reset_data.get('new_password', '')
        
        result = await member_auth_service.reset_password(token, new_password)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Password reset failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Password reset failed: {str(e)}")

@api_router.post("/members/{member_id}/change-password")
async def change_member_password(member_id: str, password_data: dict):
    """Change member password (authenticated)"""
    try:
        old_password = password_data.get('old_password', '')
        new_password = password_data.get('new_password', '')
        
        result = await member_auth_service.change_password(member_id, old_password, new_password)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Password change failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Password change failed: {str(e)}")

# =============================================================================
# MEMBER PROFILE API ROUTES
# =============================================================================

@api_router.get("/members/{member_id}/profile")
async def get_member_profile(member_id: str):
    """Get member profile"""
    try:
        result = await member_profile_service.get_member_profile(member_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get('message', 'Profile not found'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get profile: {str(e)}")

@api_router.put("/members/{member_id}/profile")
async def update_member_profile(member_id: str, profile_data: dict):
    """Update member profile"""
    try:
        result = await member_profile_service.update_member_profile(member_id, profile_data)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Profile update failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update profile: {str(e)}")

@api_router.delete("/members/{member_id}/account")
async def delete_member_account(member_id: str):
    """Delete member account"""
    try:
        result = await member_profile_service.delete_member_account(member_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Account deletion failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete account: {str(e)}")

@api_router.get("/members/{member_id}/preferences")
async def get_member_preferences(member_id: str):
    """Get member preferences"""
    try:
        result = await member_profile_service.get_member_preferences(member_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get('message', 'Preferences not found'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get preferences: {str(e)}")

@api_router.put("/members/{member_id}/preferences")
async def update_member_preferences(member_id: str, preferences_data: dict):
    """Update member preferences"""
    try:
        result = await member_profile_service.update_member_preferences(member_id, preferences_data)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Preferences update failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update preferences: {str(e)}")

# =============================================================================
# MEMBER DASHBOARD API ROUTES
# =============================================================================

@api_router.get("/members/{member_id}/dashboard")
async def get_member_dashboard(member_id: str):
    """Get member dashboard data"""
    try:
        result = await member_profile_service.get_member_dashboard(member_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get('message', 'Dashboard data not found'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get dashboard: {str(e)}")

@api_router.get("/members/{member_id}/activity")
async def get_member_activity(member_id: str, limit: int = 50):
    """Get member activity history"""
    try:
        result = await member_profile_service.get_member_activity(member_id, limit)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get('message', 'Activity not found'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get activity: {str(e)}")

# =============================================================================
# MEMBER FAVORITES API ROUTES
# =============================================================================

@api_router.get("/members/{member_id}/favorites")
async def get_member_favorites(member_id: str):
    """Get member's favorite experts"""
    try:
        result = await member_profile_service.get_member_favorites(member_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get('message', 'Favorites not found'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get favorites: {str(e)}")

@api_router.post("/members/{member_id}/favorites/{expert_id}")
async def add_member_favorite(member_id: str, expert_id: str):
    """Add expert to member's favorites"""
    try:
        result = await member_profile_service.add_favorite_expert(member_id, expert_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Failed to add favorite'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add favorite: {str(e)}")

@api_router.delete("/members/{member_id}/favorites/{expert_id}")
async def remove_member_favorite(member_id: str, expert_id: str):
    """Remove expert from member's favorites"""
    try:
        result = await member_profile_service.remove_favorite_expert(member_id, expert_id)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Failed to remove favorite'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to remove favorite: {str(e)}")

# =============================================================================
# AFFILIATE PROGRAM API ROUTES
# =============================================================================

@api_router.post("/affiliate/create")
async def create_affiliate_account(member_id: str):
    """Create affiliate account for a member"""
    try:
        affiliate_account = await affiliate_service.create_affiliate_account(member_id)
        return {
            "success": True,
            "affiliate_account": affiliate_account.dict(),
            "message": "Affiliate account created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create affiliate account: {str(e)}")

@api_router.get("/affiliate/{member_id}")
async def get_affiliate_account(member_id: str):
    """Get affiliate account for a member"""
    try:
        affiliate_account = await affiliate_service.get_affiliate_account(member_id)
        if affiliate_account:
            return {
                "success": True,
                "affiliate_account": affiliate_account.dict()
            }
        else:
            return {
                "success": False,
                "message": "No affiliate account found"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get affiliate account: {str(e)}")

@api_router.post("/affiliate/track-click")
async def track_referral_click(request: Request, affiliate_code: str, referrer_url: str = None):
    """Track referral link click"""
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        tracking = await affiliate_service.track_referral_click(
            affiliate_code=affiliate_code,
            ip_address=client_ip,
            user_agent=user_agent,
            referrer_url=referrer_url or ""
        )
        
        return {
            "success": True,
            "tracking_id": tracking.id,
            "message": "Referral click tracked"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to track referral: {str(e)}")

@api_router.post("/affiliate/process-signup")
async def process_referral_signup(affiliate_code: str, new_user_id: str):
    """Process referral signup and award credits"""
    try:
        success = await affiliate_service.process_referral_signup(affiliate_code, new_user_id)
        if success:
            return {
                "success": True,
                "message": "Referral processed and credits awarded"
            }
        else:
            return {
                "success": False,
                "message": "Referral could not be processed"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process referral signup: {str(e)}")

@api_router.get("/affiliate/{member_id}/stats")
async def get_referral_stats(member_id: str):
    """Get referral statistics for a member"""
    try:
        stats = await affiliate_service.get_referral_stats(member_id)
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get referral stats: {str(e)}")

# =============================================================================
# CREDITS SYSTEM API ROUTES
# =============================================================================

@api_router.post("/credits/create-account")
async def create_credit_account(user_id: str):
    """Create credit account for a user"""
    try:
        credit_account = await credit_service.create_credit_account(user_id)
        return {
            "success": True,
            "credit_account": credit_account.dict(),
            "message": "Credit account created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create credit account: {str(e)}")

@api_router.get("/credits/{user_id}/balance")
async def get_credit_balance(user_id: str):
    """Get credit balance for a user"""
    try:
        balance = await credit_service.get_credit_balance(user_id)
        return {
            "success": True,
            "balance": balance,
            "currency": "USD"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get credit balance: {str(e)}")

@api_router.get("/credits/{user_id}/history")
async def get_credit_history(user_id: str, limit: int = 50):
    """Get credit transaction history for a user"""
    try:
        transactions = await credit_service.get_credit_history(user_id, limit)
        return {
            "success": True,
            "transactions": [t.dict() for t in transactions],
            "count": len(transactions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get credit history: {str(e)}")

@api_router.post("/credits/use")
async def use_credits_for_purchase(user_id: str, amount: float, order_id: str, description: str):
    """Use credits for a purchase"""
    try:
        success = await credit_service.use_credits_for_purchase(user_id, amount, order_id, description)
        if success:
            return {
                "success": True,
                "message": f"Successfully used {amount} credits"
            }
        else:
            return {
                "success": False,
                "message": "Insufficient credit balance"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to use credits: {str(e)}")

# =============================================================================
# PAYOUT SYSTEM API ROUTES
# =============================================================================

@api_router.post("/payouts/accounts")
async def create_payout_account(expert_id: str, account_data: dict):
    """Create payout account for an expert"""
    try:
        payout_account = await payout_service.create_payout_account(expert_id, account_data)
        return {
            "success": True,
            "payout_account": payout_account.dict(),
            "message": "Payout account created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create payout account: {str(e)}")

@api_router.get("/payouts/{expert_id}/accounts")
async def get_payout_accounts(expert_id: str):
    """Get payout accounts for an expert"""
    try:
        accounts = await payout_service.get_payout_accounts(expert_id)
        return {
            "success": True,
            "accounts": [account.dict() for account in accounts]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get payout accounts: {str(e)}")

@api_router.post("/payouts/request")
async def request_payout(expert_id: str, amount: float, payout_account_id: str, description: str = None):
    """Create a payout request"""
    try:
        payout_request = await payout_service.request_payout(expert_id, amount, payout_account_id, description)
        return {
            "success": True,
            "payout_request": payout_request.dict(),
            "message": "Payout request submitted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to request payout: {str(e)}")

@api_router.get("/payouts/{expert_id}/requests")
async def get_payout_requests(expert_id: str, status: str = None):
    """Get payout requests for an expert"""
    try:
        payout_status = PayoutStatus(status) if status else None
        requests = await payout_service.get_payout_requests(expert_id, payout_status)
        return {
            "success": True,
            "requests": [req.dict() for req in requests]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get payout requests: {str(e)}")

@api_router.post("/admin/payouts/{request_id}/process")
async def process_payout_request(request_id: str, admin_notes: str = None):
    """Process a payout request (admin only)"""
    try:
        success = await payout_service.process_payout_request(request_id, admin_notes)
        if success:
            return {
                "success": True,
                "message": "Payout request processed successfully"
            }
        else:
            return {
                "success": False,
                "message": "Payout request not found"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process payout: {str(e)}")

@api_router.post("/admin/payouts/{request_id}/complete")
async def complete_payout(request_id: str, transaction_id: str, processing_fee: float = 0.0):
    """Complete a payout (admin only)"""
    try:
        history = await payout_service.complete_payout(request_id, transaction_id, processing_fee)
        return {
            "success": True,
            "payout_history": history.dict(),
            "message": "Payout completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to complete payout: {str(e)}")

# =============================================================================
# SHOPPING CART WITH CREDITS API ROUTES
# =============================================================================

@api_router.get("/cart/{user_id}")
async def get_shopping_cart(user_id: str):
    """Get shopping cart for a user"""
    try:
        cart = await cart_service.get_or_create_cart(user_id)
        return {
            "success": True,
            "cart": cart.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get shopping cart: {str(e)}")

@api_router.post("/cart/{user_id}/items")
async def add_item_to_cart(user_id: str, product_id: str, product_data: dict):
    """Add item to shopping cart"""
    try:
        cart_item = await cart_service.add_item_to_cart(user_id, product_id, product_data)
        return {
            "success": True,
            "cart_item": cart_item.dict(),
            "message": "Item added to cart"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add item to cart: {str(e)}")

@api_router.post("/cart/{user_id}/apply-credits")
async def apply_credits_to_cart(user_id: str, credits_to_use: float):
    """Apply credits to shopping cart"""
    try:
        result = await cart_service.apply_credits_to_cart(user_id, credits_to_use)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to apply credits: {str(e)}")

@api_router.get("/cart/{user_id}/max-credits")
async def get_max_credits_usable(user_id: str):
    """Get maximum credits that can be used for current cart"""
    try:
        cart = await cart_service.get_or_create_cart(user_id)
        max_credits = await credit_service.calculate_max_credits_usable(cart.subtotal)
        user_balance = await credit_service.get_credit_balance(user_id)
        
        return {
            "success": True,
            "max_credits_usable": min(max_credits, user_balance),
            "cart_subtotal": cart.subtotal,
            "user_credit_balance": user_balance,
            "max_percentage": 50
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get max credits: {str(e)}")

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
