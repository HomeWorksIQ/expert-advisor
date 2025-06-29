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

# Add your routes to the router instead of directly to app
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
