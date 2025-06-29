from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
import uuid


class SexualPreference(str, Enum):
    STRAIGHT = "straight"
    BISEXUAL = "bisexual"
    GAY = "gay"
    LESBIAN = "lesbian"
    PANSEXUAL = "pansexual"
    OTHER = "other"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    TRANS_MALE = "trans_male"
    TRANS_FEMALE = "trans_female"
    NON_BINARY = "non_binary"
    OTHER = "other"


class Ethnicity(str, Enum):
    WHITE = "white"
    BLACK = "black"
    HISPANIC = "hispanic"
    ASIAN = "asian"
    MIDDLE_EASTERN = "middle_eastern"
    NATIVE_AMERICAN = "native_american"
    PACIFIC_ISLANDER = "pacific_islander"
    MIXED = "mixed"
    OTHER = "other"


class PerformerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(..., description="User ID")
    
    # Basic Info
    stage_name: str = Field(..., description="Performer stage name")
    bio: str = Field("", description="Performer bio")
    age: int = Field(..., description="Performer age", ge=18, le=99)
    
    # Identity Information
    gender: Gender = Field(..., description="Gender identity")
    sexual_preference: SexualPreference = Field(..., description="Sexual preference")
    ethnicity: Ethnicity = Field(..., description="Ethnicity")
    
    # Location Information
    country: str = Field(..., description="Country")
    state: Optional[str] = Field(None, description="State/Province")
    city: str = Field(..., description="City")
    zip_code: Optional[str] = Field(None, description="ZIP/Postal code")
    show_exact_location: bool = Field(False, description="Show exact location to users")
    location_radius_km: int = Field(50, description="Search radius in kilometers")
    
    # Physical Attributes (optional)
    height_cm: Optional[int] = Field(None, description="Height in centimeters")
    weight_kg: Optional[int] = Field(None, description="Weight in kilograms")
    body_type: Optional[str] = Field(None, description="Body type")
    hair_color: Optional[str] = Field(None, description="Hair color")
    eye_color: Optional[str] = Field(None, description="Eye color")
    
    # Professional Info
    experience_level: str = Field("beginner", description="Experience level")
    specialties: List[str] = Field([], description="Performance specialties")
    languages: List[str] = Field(["english"], description="Languages spoken")
    
    # Availability
    online_status: str = Field("offline", description="Current online status")
    last_active: datetime = Field(default_factory=datetime.utcnow)
    timezone: str = Field("UTC", description="Performer timezone")
    
    # Content & Media
    profile_image: Optional[str] = Field(None, description="Profile image URL")
    cover_image: Optional[str] = Field(None, description="Cover image URL")
    gallery_images: List[str] = Field([], description="Gallery image URLs")
    
    # Pricing & Services
    rates: Dict[str, float] = Field({}, description="Service rates")
    accepts_tips: bool = Field(True, description="Accepts tips")
    minimum_tip: float = Field(1.0, description="Minimum tip amount")
    
    # Verification & Status
    is_verified: bool = Field(False, description="Account verification status")
    verification_level: str = Field("none", description="Verification level")
    account_status: str = Field("active", description="Account status")
    
    # Statistics
    total_views: int = Field(0, description="Total profile views")
    total_likes: int = Field(0, description="Total likes received")
    total_shows: int = Field(0, description="Total shows performed")
    average_rating: float = Field(0.0, description="Average user rating")
    rating_count: int = Field(0, description="Number of ratings")
    
    # Privacy Settings
    show_in_search: bool = Field(True, description="Show in search results")
    allow_location_search: bool = Field(True, description="Allow location-based search")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PerformerSearch(BaseModel):
    # Text Search
    query: Optional[str] = Field(None, description="Search query")
    
    # Location Filters
    country: Optional[str] = Field(None, description="Filter by country")
    state: Optional[str] = Field(None, description="Filter by state")
    city: Optional[str] = Field(None, description="Filter by city")
    zip_code: Optional[str] = Field(None, description="Filter by ZIP code")
    radius_km: Optional[int] = Field(None, description="Search radius in kilometers")
    
    # Demographic Filters
    min_age: Optional[int] = Field(None, description="Minimum age", ge=18)
    max_age: Optional[int] = Field(None, description="Maximum age", le=99)
    gender: Optional[List[Gender]] = Field(None, description="Gender filter")
    sexual_preference: Optional[List[SexualPreference]] = Field(None, description="Sexual preference filter")
    ethnicity: Optional[List[Ethnicity]] = Field(None, description="Ethnicity filter")
    
    # Physical Filters
    min_height_cm: Optional[int] = Field(None, description="Minimum height in cm")
    max_height_cm: Optional[int] = Field(None, description="Maximum height in cm")
    body_type: Optional[List[str]] = Field(None, description="Body type filter")
    hair_color: Optional[List[str]] = Field(None, description="Hair color filter")
    eye_color: Optional[List[str]] = Field(None, description="Eye color filter")
    
    # Status Filters
    online_only: bool = Field(False, description="Show only online performers")
    verified_only: bool = Field(False, description="Show only verified performers")
    
    # Service Filters
    max_rate: Optional[float] = Field(None, description="Maximum rate filter")
    accepts_tips: Optional[bool] = Field(None, description="Accepts tips filter")
    languages: Optional[List[str]] = Field(None, description="Language filter")
    
    # Sort Options
    sort_by: str = Field("popularity", description="Sort field")
    sort_order: str = Field("desc", description="Sort order (asc/desc)")
    
    # Pagination
    page: int = Field(1, description="Page number", ge=1)
    limit: int = Field(20, description="Results per page", ge=1, le=100)


class TrialStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    USED = "used"
    NOT_STARTED = "not_started"


class Trial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(..., description="User ID")
    trial_type: str = Field(..., description="Type of trial (performer/member)")
    
    # Trial Period
    trial_start_date: datetime = Field(..., description="Trial start date")
    trial_end_date: datetime = Field(..., description="Trial end date")
    trial_duration_days: int = Field(7, description="Trial duration in days")
    
    # Trial Status
    status: TrialStatus = Field(TrialStatus.ACTIVE, description="Current trial status")
    is_active: bool = Field(True, description="Whether trial is currently active")
    has_used_trial: bool = Field(True, description="Whether user has used their trial")
    
    # Trial Benefits
    benefits_unlocked: List[str] = Field([], description="List of benefits unlocked during trial")
    access_level: str = Field("premium", description="Access level during trial")
    
    # Usage Tracking
    days_used: int = Field(0, description="Number of days used")
    days_remaining: int = Field(7, description="Number of days remaining")
    usage_stats: Optional[Dict[str, Any]] = Field(None, description="Trial usage statistics")
    
    # Conversion Tracking
    converted_to_paid: bool = Field(False, description="Whether trial converted to paid subscription")
    conversion_date: Optional[datetime] = Field(None, description="Date of conversion to paid")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expired_at: Optional[datetime] = Field(None, description="Trial expiration timestamp")
    
    def update_status(self):
        """Update trial status based on current date"""
        now = datetime.utcnow()
        
        if now > self.trial_end_date:
            self.status = TrialStatus.EXPIRED
            self.is_active = False
            if not self.expired_at:
                self.expired_at = now
        else:
            # Calculate remaining days
            remaining = self.trial_end_date - now
            self.days_remaining = max(0, remaining.days)
            self.days_used = self.trial_duration_days - self.days_remaining
            
            if self.days_remaining > 0:
                self.status = TrialStatus.ACTIVE
                self.is_active = True
            else:
                self.status = TrialStatus.EXPIRED
                self.is_active = False
        
        self.updated_at = now


class TrialCreate(BaseModel):
    user_id: str
    trial_type: str
    trial_duration_days: int = 7
    benefits_unlocked: List[str] = []
    access_level: str = "premium"


class TrialUpdate(BaseModel):
    status: Optional[TrialStatus] = None
    benefits_unlocked: Optional[List[str]] = None
    usage_stats: Optional[Dict[str, Any]] = None
    converted_to_paid: Optional[bool] = None


class APIKeyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"


class APIKeyType(str, Enum):
    # Video Conferencing
    AGORA = "agora"
    TWILIO_VIDEO = "twilio_video"
    JITSI = "jitsi"
    
    # Calendar Integration
    GOOGLE_CALENDAR = "google_calendar"
    MICROSOFT_OUTLOOK = "microsoft_outlook"
    
    # Real-time Chat & Notifications
    FIREBASE_FCM = "firebase_fcm"
    TWILIO_SMS = "twilio_sms"
    
    # File Storage & Processing
    AWS_S3 = "aws_s3"
    GOOGLE_CLOUD_STORAGE = "google_cloud_storage"
    CLOUDINARY = "cloudinary"
    
    # Shipping Integrations
    USPS = "usps"
    UPS = "ups"
    FEDEX = "fedex"
    
    # Payment Processing
    STRIPE_CONNECT = "stripe_connect"
    
    # AI/ML Services
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class APIKey(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key_type: APIKeyType = Field(..., description="Type of API key")
    service_name: str = Field(..., description="Human-readable service name")
    
    # Key Data (encrypted in production)
    api_key: Optional[str] = Field(None, description="Primary API key")
    api_secret: Optional[str] = Field(None, description="API secret/certificate")
    app_id: Optional[str] = Field(None, description="Application ID")
    account_sid: Optional[str] = Field(None, description="Account SID (Twilio)")
    auth_token: Optional[str] = Field(None, description="Auth token")
    client_id: Optional[str] = Field(None, description="OAuth Client ID")
    client_secret: Optional[str] = Field(None, description="OAuth Client Secret")
    
    # Additional Configuration
    config: Optional[Dict[str, Any]] = Field(None, description="Additional configuration parameters")
    environment: str = Field("production", description="Environment (sandbox/production)")
    
    # Status and Management
    status: APIKeyStatus = Field(APIKeyStatus.ACTIVE, description="Key status")
    is_default: bool = Field(False, description="Default key for this service type")
    
    # Usage Tracking
    last_used: Optional[datetime] = Field(None, description="Last usage timestamp")
    usage_count: int = Field(0, description="Number of times used")
    
    # Metadata
    description: Optional[str] = Field(None, description="Key description/notes")
    created_by: str = Field(..., description="User ID who created the key")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="Key expiration date")


class APIKeyCreate(BaseModel):
    key_type: APIKeyType
    service_name: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    app_id: Optional[str] = None
    account_sid: Optional[str] = None
    auth_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    environment: str = "production"
    description: Optional[str] = None
    expires_at: Optional[datetime] = None


class APIKeyUpdate(BaseModel):
    service_name: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    app_id: Optional[str] = None
    account_sid: Optional[str] = None
    auth_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    environment: Optional[str] = None
    status: Optional[APIKeyStatus] = None
    description: Optional[str] = None
    expires_at: Optional[datetime] = None


# Appointment Models
class AppointmentType(str, Enum):
    VIDEO_CALL = "video_call"
    PHONE_CALL = "phone_call"
    CHAT_SESSION = "chat_session"
    CUSTOM_SERVICE = "custom_service"
    IN_PERSON = "in_person"


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str = Field(..., description="Performer user ID")
    member_id: str = Field(..., description="Member user ID")
    
    # Appointment Details
    title: str = Field(..., description="Appointment title")
    description: Optional[str] = Field(None, description="Appointment description")
    appointment_type: AppointmentType = Field(..., description="Type of appointment")
    
    # Scheduling
    scheduled_start: datetime = Field(..., description="Scheduled start time")
    scheduled_end: datetime = Field(..., description="Scheduled end time")
    timezone: str = Field(..., description="Timezone for the appointment")
    
    # Actual Times
    actual_start: Optional[datetime] = Field(None, description="Actual start time")
    actual_end: Optional[datetime] = Field(None, description="Actual end time")
    
    # Status and Payment
    status: AppointmentStatus = Field(AppointmentStatus.SCHEDULED, description="Appointment status")
    price: float = Field(..., description="Appointment price")
    currency: str = Field("USD", description="Currency")
    payment_status: str = Field("pending", description="Payment status")
    transaction_id: Optional[str] = Field(None, description="Payment transaction ID")
    
    # Meeting Details
    meeting_url: Optional[str] = Field(None, description="Video meeting URL")
    meeting_id: Optional[str] = Field(None, description="Meeting ID")
    meeting_password: Optional[str] = Field(None, description="Meeting password")
    
    # Calendar Integration
    calendar_event_ids: Optional[Dict[str, str]] = Field(None, description="Calendar event IDs")
    
    # Reminders and Notifications
    reminder_sent: bool = Field(False, description="Reminder notification sent")
    notification_settings: Optional[Dict[str, Any]] = Field(None, description="Notification preferences")
    
    # Notes and Metadata
    performer_notes: Optional[str] = Field(None, description="Performer's private notes")
    member_notes: Optional[str] = Field(None, description="Member's private notes")
    cancellation_reason: Optional[str] = Field(None, description="Cancellation reason")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cancelled_at: Optional[datetime] = Field(None, description="Cancellation timestamp")


class AppointmentAvailability(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str = Field(..., description="Performer user ID")
    
    # Availability Schedule
    day_of_week: int = Field(..., description="Day of week (0=Monday, 6=Sunday)", ge=0, le=6)
    start_time: str = Field(..., description="Start time (HH:MM format)")
    end_time: str = Field(..., description="End time (HH:MM format)")
    timezone: str = Field(..., description="Timezone")
    
    # Appointment Types Available
    available_types: list[AppointmentType] = Field(..., description="Available appointment types")
    
    # Pricing per type
    pricing: Dict[str, float] = Field(..., description="Pricing for each appointment type")
    
    # Status
    is_active: bool = Field(True, description="Whether this availability slot is active")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Chat Models
class ChatType(str, Enum):
    DIRECT_MESSAGE = "direct_message"
    GROUP_CHAT = "group_chat"
    SUPPORT_CHAT = "support_chat"


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    FILE = "file"
    SYSTEM = "system"


class ChatRoom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_type: ChatType = Field(..., description="Type of chat room")
    
    # Participants
    participants: list[str] = Field(..., description="List of participant user IDs")
    creator_id: str = Field(..., description="User ID who created the chat")
    
    # Chat Details
    name: Optional[str] = Field(None, description="Chat room name (for group chats)")
    description: Optional[str] = Field(None, description="Chat description")
    
    # Settings
    is_active: bool = Field(True, description="Whether chat is active")
    is_private: bool = Field(True, description="Whether chat is private")
    allow_file_sharing: bool = Field(True, description="Allow file sharing")
    file_sharing_fee: Optional[float] = Field(None, description="Fee for file sharing")
    
    # Metadata
    last_message_at: Optional[datetime] = Field(None, description="Last message timestamp")
    message_count: int = Field(0, description="Total message count")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_room_id: str = Field(..., description="Chat room ID")
    sender_id: str = Field(..., description="Sender user ID")
    
    # Message Content
    message_type: MessageType = Field(..., description="Type of message")
    content: str = Field(..., description="Message content")
    
    # Media Attachments
    media_url: Optional[str] = Field(None, description="Media file URL")
    media_type: Optional[str] = Field(None, description="Media MIME type")
    media_size: Optional[int] = Field(None, description="Media file size in bytes")
    thumbnail_url: Optional[str] = Field(None, description="Media thumbnail URL")
    
    # File Sharing
    is_paid_content: bool = Field(False, description="Whether content requires payment")
    price: Optional[float] = Field(None, description="Content price")
    currency: str = Field("USD", description="Currency")
    
    # Message Status
    is_edited: bool = Field(False, description="Whether message was edited")
    edited_at: Optional[datetime] = Field(None, description="Edit timestamp")
    is_deleted: bool = Field(False, description="Whether message is deleted")
    deleted_at: Optional[datetime] = Field(None, description="Deletion timestamp")
    
    # Read Receipts
    read_by: list[str] = Field([], description="List of user IDs who read the message")
    delivered_to: list[str] = Field([], description="List of user IDs message was delivered to")
    
    # Reply/Thread
    reply_to_message_id: Optional[str] = Field(None, description="Message ID this is replying to")
    thread_id: Optional[str] = Field(None, description="Thread ID for threaded conversations")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# File Upload Models
class FileType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    ARCHIVE = "archive"
    OTHER = "other"


class UploadedFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    uploader_id: str = Field(..., description="User ID who uploaded the file")
    
    # File Details
    original_filename: str = Field(..., description="Original filename")
    file_type: FileType = Field(..., description="Type of file")
    mime_type: str = Field(..., description="MIME type")
    file_size: int = Field(..., description="File size in bytes")
    
    # Storage Details
    storage_path: str = Field(..., description="Storage path/URL")
    thumbnail_path: Optional[str] = Field(None, description="Thumbnail path/URL")
    cdn_url: Optional[str] = Field(None, description="CDN URL")
    
    # Access Control
    is_private: bool = Field(True, description="Whether file is private")
    is_paid_content: bool = Field(False, description="Whether file requires payment")
    price: Optional[float] = Field(None, description="File price")
    currency: str = Field("USD", description="Currency")
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="File metadata")
    tags: list[str] = Field([], description="File tags")
    
    # Statistics
    download_count: int = Field(0, description="Number of downloads")
    view_count: int = Field(0, description="Number of views")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="File expiration date")


# Store and Shipping Models
class ProductType(str, Enum):
    PHYSICAL = "physical"
    DIGITAL = "digital"
    SERVICE = "service"


class ShippingProvider(str, Enum):
    USPS = "usps"
    UPS = "ups"
    FEDEX = "fedex"
    DHL = "dhl"
    CUSTOM = "custom"


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performer_id: str = Field(..., description="Performer who owns the product")
    
    # Product Details
    name: str = Field(..., description="Product name")
    description: str = Field(..., description="Product description")
    product_type: ProductType = Field(..., description="Type of product")
    
    # Pricing
    price: float = Field(..., description="Product price")
    currency: str = Field("USD", description="Currency")
    
    # Inventory (for physical products)
    stock_quantity: Optional[int] = Field(None, description="Stock quantity")
    sku: Optional[str] = Field(None, description="Stock keeping unit")
    
    # Media
    images: list[str] = Field([], description="Product image URLs")
    files: list[str] = Field([], description="Digital product file URLs")
    
    # Shipping (for physical products)
    requires_shipping: bool = Field(False, description="Whether product requires shipping")
    weight: Optional[float] = Field(None, description="Weight in pounds")
    dimensions: Optional[Dict[str, float]] = Field(None, description="Dimensions (length, width, height)")
    shipping_providers: list[ShippingProvider] = Field([], description="Available shipping providers")
    
    # Status
    is_active: bool = Field(True, description="Whether product is active")
    is_featured: bool = Field(False, description="Whether product is featured")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str = Field(..., description="Customer user ID")
    performer_id: str = Field(..., description="Performer user ID")
    
    # Order Details
    product_id: str = Field(..., description="Product ID")
    quantity: int = Field(1, description="Quantity ordered")
    unit_price: float = Field(..., description="Unit price at time of order")
    total_price: float = Field(..., description="Total order price")
    currency: str = Field("USD", description="Currency")
    
    # Payment
    payment_status: str = Field("pending", description="Payment status")
    transaction_id: Optional[str] = Field(None, description="Payment transaction ID")
    
    # Shipping Information
    shipping_address: Optional[Dict[str, str]] = Field(None, description="Shipping address")
    shipping_provider: Optional[ShippingProvider] = Field(None, description="Selected shipping provider")
    shipping_cost: Optional[float] = Field(None, description="Shipping cost")
    tracking_number: Optional[str] = Field(None, description="Shipping tracking number")
    shipping_label_url: Optional[str] = Field(None, description="Shipping label URL")
    
    # Order Status
    status: str = Field("pending", description="Order status")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    shipped_at: Optional[datetime] = Field(None, description="Shipping timestamp")
    delivered_at: Optional[datetime] = Field(None, description="Delivery timestamp")