from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

# Enums for better type safety
class UserType(str, Enum):
    CLIENT = "client"
    EXPERT = "expert"
    ADMIN = "admin"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    EXPIRED = "expired"

class PaymentMethod(str, Enum):
    CCBILL = "ccbill"
    STRIPE = "stripe"
    CRYPTO = "crypto"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"
    SUSPENDED = "suspended"

class ContentType(str, Enum):
    PHOTO = "photo"
    VIDEO = "video"
    AUDIO = "audio"
    TEXT = "text"
    STORY = "story"

class ConsultationType(str, Enum):
    DOCUMENT = "document"
    VIDEO_CALL = "video_call"
    AUDIO_CALL = "audio_call"
    CHAT = "chat"
    RESOURCE = "resource"

class ExpertiseCategory(str, Enum):
    LEGAL = "legal"
    ACCOUNTING = "accounting"
    MEDICAL = "medical"
    FINANCIAL = "financial"
    BUSINESS = "business"
    TECHNOLOGY = "technology"
    EDUCATION = "education"
    MARKETING = "marketing"
    REAL_ESTATE = "real_estate"
    INSURANCE = "insurance"

class ExpertiseLevel(str, Enum):
    ENTRY = "entry"
    INTERMEDIATE = "intermediate"
    EXPERIENCED = "experienced"
    EXPERT = "expert"

class PrivacyLevel(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    SUBSCRIBERS = "subscribers"
    PAID = "paid"

# User Models
class User(BaseModel):
    id: str = Field(..., description="Unique user identifier")
    email: str = Field(..., description="User email address")
    phone: Optional[str] = Field(None, description="User phone number")
    firstName: str = Field(..., description="User first name")
    lastName: str = Field(..., description="User last name")
    displayName: Optional[str] = Field(None, description="Public display name")
    username: str = Field(..., description="Unique username")
    userType: UserType = Field(..., description="Type of user account")
    profileImage: Optional[str] = Field(None, description="Profile image URL")
    coverImage: Optional[str] = Field(None, description="Cover image URL")
    bio: Optional[str] = Field(None, description="User biography", max_length=1000)
    location: Optional[Dict[str, str]] = Field(None, description="User location details")
    
    # Expert-specific fields
    expertiseCategory: Optional[ExpertiseCategory] = Field(None, description="Primary expertise category")
    expertiseLevel: Optional[ExpertiseLevel] = Field(None, description="Professional expertise level")
    specializations: Optional[List[str]] = Field(None, description="Specialized areas within expertise")
    credentials: Optional[List[str]] = Field(None, description="Professional credentials and certifications")
    yearsOfExperience: Optional[int] = Field(None, description="Years of professional experience")
    education: Optional[List[Dict[str, str]]] = Field(None, description="Educational background")
    licenses: Optional[List[Dict[str, str]]] = Field(None, description="Professional licenses")
    
    # Replaced gender field (keeping for backward compatibility)
    gender: Optional[str] = Field(None, description="User gender (deprecated - use expertiseCategory for experts)")
    age: Optional[int] = Field(None, description="User age", ge=18)
    dateOfBirth: Optional[datetime] = Field(None, description="User date of birth")
    
    # Account Status
    isVerified: bool = Field(False, description="Email verification status")
    isIdVerified: bool = Field(False, description="ID verification status")
    isBankVerified: bool = Field(False, description="Bank verification status")
    accountStatus: str = Field("pending", description="Account status")
    
    # Social Media Links
    socialAccounts: Optional[Dict[str, str]] = Field(None, description="Social media accounts")
    websiteUrl: Optional[str] = Field(None, description="Personal website URL")
    
    # Preferences
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    lastSeen: Optional[datetime] = Field(None, description="Last activity timestamp")
    
    # Stats (for performers)
    stats: Optional[Dict[str, Any]] = Field(None, description="User statistics")

# Transaction Models
class Transaction(BaseModel):
    id: str = Field(..., description="Unique transaction identifier")
    userId: str = Field(..., description="User ID who made the transaction")
    recipientId: Optional[str] = Field(None, description="Recipient user ID (for tips, subscriptions)")
    packageId: Optional[str] = Field(None, description="Package ID if applicable")
    amount: float = Field(..., description="Transaction amount in USD")
    currency: str = Field("USD", description="Transaction currency")
    
    # Payment Details
    paymentMethod: PaymentMethod = Field(..., description="Payment method used")
    paymentProcessorTransactionId: Optional[str] = Field(None, description="External transaction ID")
    sessionId: Optional[str] = Field(None, description="Payment session ID")
    
    # Status and Type
    status: TransactionStatus = Field(..., description="Transaction status")
    transactionType: str = Field(..., description="Type of transaction")
    
    # Crypto specific fields
    cryptoCurrency: Optional[str] = Field(None, description="Cryptocurrency type")
    cryptoAmount: Optional[str] = Field(None, description="Amount in cryptocurrency")
    cryptoAddress: Optional[str] = Field(None, description="Crypto payment address")
    confirmations: Optional[int] = Field(None, description="Blockchain confirmations")
    
    # Metadata
    description: str = Field(..., description="Transaction description")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional transaction data")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    expiresAt: Optional[datetime] = Field(None, description="Transaction expiration time")
    
    # Fee information
    platformFee: Optional[float] = Field(None, description="Platform fee amount")
    processingFee: Optional[float] = Field(None, description="Payment processing fee")

# Subscription Models
class Subscription(BaseModel):
    id: str = Field(..., description="Unique subscription identifier")
    subscriberId: str = Field(..., description="User ID of the subscriber")
    clientId: str = Field(..., description="User ID of the client")
    expertId: str = Field(..., description="User ID of the expert")
    packageId: str = Field(..., description="Subscription package ID")
    
    # Subscription Details
    status: SubscriptionStatus = Field(..., description="Subscription status")
    startDate: datetime = Field(..., description="Subscription start date")
    endDate: datetime = Field(..., description="Subscription end date")
    nextBillingDate: Optional[datetime] = Field(None, description="Next billing date")
    
    # Pricing
    price: float = Field(..., description="Subscription price")
    currency: str = Field("USD", description="Subscription currency")
    billingPeriod: str = Field(..., description="Billing period")
    
    # Settings
    autoRenew: bool = Field(True, description="Auto-renewal setting")
    
    # Payment Information
    paymentMethod: PaymentMethod = Field(..., description="Payment method")
    lastPaymentDate: Optional[datetime] = Field(None, description="Last successful payment")
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional subscription data")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    canceledAt: Optional[datetime] = Field(None, description="Cancellation timestamp")

# Content Models
class Content(BaseModel):
    id: str = Field(..., description="Unique content identifier")
    performerId: str = Field(..., description="Creator user ID")
    
    # Content Details
    title: str = Field(..., description="Content title")
    description: str = Field(..., description="Content description")
    contentType: ContentType = Field(..., description="Type of content")
    
    # Media Information
    mediaUrl: str = Field(..., description="Primary media URL")
    thumbnailUrl: Optional[str] = Field(None, description="Thumbnail image URL")
    duration: Optional[str] = Field(None, description="Media duration (for video/audio)")
    fileSize: Optional[int] = Field(None, description="File size in bytes")
    
    # Privacy and Access
    privacyLevel: PrivacyLevel = Field(..., description="Content privacy level")
    isLocked: bool = Field(False, description="Whether content requires payment")
    price: Optional[float] = Field(None, description="Content price if locked")
    
    # Engagement
    likes: int = Field(0, description="Number of likes")
    comments: int = Field(0, description="Number of comments")
    views: int = Field(0, description="Number of views")
    shares: int = Field(0, description="Number of shares")
    
    # Scheduling
    uploadType: str = Field("immediate", description="Upload type (immediate/scheduled)")
    scheduledFor: Optional[datetime] = Field(None, description="Scheduled publication time")
    
    # Metadata
    tags: List[str] = Field([], description="Content tags")
    location: Optional[str] = Field(None, description="Content location")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional content data")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    publishedAt: Optional[datetime] = Field(None, description="Publication timestamp")

# Story Models (24-hour content)
class Story(BaseModel):
    id: str = Field(..., description="Unique story identifier")
    performerId: str = Field(..., description="Creator user ID")
    
    # Story Content
    contentType: ContentType = Field(..., description="Type of story content")
    mediaUrl: str = Field(..., description="Story media URL")
    text: Optional[str] = Field(None, description="Text overlay")
    duration: int = Field(15, description="Story duration in seconds")
    
    # Engagement
    views: int = Field(0, description="Number of views")
    viewers: List[str] = Field([], description="List of viewer user IDs")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    expiresAt: datetime = Field(..., description="Story expiration time")

# Tip Models
class Tip(BaseModel):
    id: str = Field(..., description="Unique tip identifier")
    senderId: str = Field(..., description="Tip sender user ID")
    recipientId: str = Field(..., description="Tip recipient user ID")
    contentId: Optional[str] = Field(None, description="Associated content ID")
    
    # Tip Details
    amount: float = Field(..., description="Tip amount")
    currency: str = Field("USD", description="Tip currency")
    message: Optional[str] = Field(None, description="Tip message")
    
    # Payment Information
    transactionId: str = Field(..., description="Associated transaction ID")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Referral Models
class Referral(BaseModel):
    id: str = Field(..., description="Unique referral identifier")
    referrerId: str = Field(..., description="User ID who made the referral")
    referredId: str = Field(..., description="User ID who was referred")
    
    # Referral Details
    tier: int = Field(..., description="Referral tier (1, 2, or 3)")
    commissionRate: float = Field(..., description="Commission rate for this referral")
    
    # Earnings
    totalEarnings: float = Field(0, description="Total earnings from this referral")
    lastEarningDate: Optional[datetime] = Field(None, description="Last earning date")
    
    # Status
    isActive: bool = Field(True, description="Whether referral is active")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Commission Models
class Commission(BaseModel):
    id: str = Field(..., description="Unique commission identifier")
    referralId: str = Field(..., description="Associated referral ID")
    transactionId: str = Field(..., description="Source transaction ID")
    
    # Commission Details
    amount: float = Field(..., description="Commission amount")
    rate: float = Field(..., description="Commission rate applied")
    tier: int = Field(..., description="Referral tier")
    
    # Status
    status: str = Field("pending", description="Commission status")
    paidAt: Optional[datetime] = Field(None, description="Payment timestamp")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Wallet Models
class Wallet(BaseModel):
    id: str = Field(..., description="Unique wallet identifier")
    userId: str = Field(..., description="Wallet owner user ID")
    
    # Balances
    availableBalance: float = Field(0, description="Available balance")
    pendingBalance: float = Field(0, description="Pending balance")
    totalEarnings: float = Field(0, description="Total lifetime earnings")
    totalSpent: float = Field(0, description="Total lifetime spending")
    
    # Currency
    currency: str = Field("USD", description="Wallet currency")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Bank Account Models
class BankAccount(BaseModel):
    id: str = Field(..., description="Unique bank account identifier")
    userId: str = Field(..., description="Account owner user ID")
    
    # Bank Details
    accountHolderName: str = Field(..., description="Account holder name")
    bankName: str = Field(..., description="Bank name")
    accountNumber: str = Field(..., description="Account number (encrypted)")
    routingNumber: str = Field(..., description="Routing number")
    accountType: str = Field(..., description="Account type (checking/savings)")
    
    # Address Information
    country: str = Field(..., description="Country")
    state: Optional[str] = Field(None, description="State/Province")
    city: str = Field(..., description="City")
    address: str = Field(..., description="Address")
    zipCode: str = Field(..., description="ZIP/Postal code")
    
    # Verification
    isVerified: bool = Field(False, description="Verification status")
    verificationDocuments: List[str] = Field([], description="Verification document URLs")
    
    # Status
    isActive: bool = Field(True, description="Whether account is active")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Message Models
class Message(BaseModel):
    id: str = Field(..., description="Unique message identifier")
    senderId: str = Field(..., description="Sender user ID")
    recipientId: str = Field(..., description="Recipient user ID")
    conversationId: str = Field(..., description="Conversation identifier")
    
    # Message Content
    content: str = Field(..., description="Message content")
    messageType: str = Field("text", description="Message type")
    mediaUrl: Optional[str] = Field(None, description="Media attachment URL")
    
    # Status
    isRead: bool = Field(False, description="Read status")
    readAt: Optional[datetime] = Field(None, description="Read timestamp")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Notification Models  
class Notification(BaseModel):
    id: str = Field(..., description="Unique notification identifier")
    userId: str = Field(..., description="Recipient user ID")
    
    # Notification Details
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    notificationType: str = Field(..., description="Notification type")
    
    # Related Objects
    relatedId: Optional[str] = Field(None, description="Related object ID")
    relatedType: Optional[str] = Field(None, description="Related object type")
    
    # Status
    isRead: bool = Field(False, description="Read status")
    readAt: Optional[datetime] = Field(None, description="Read timestamp")
    
    # Delivery Methods
    sentViaEmail: bool = Field(False, description="Email delivery status")
    sentViaPush: bool = Field(False, description="Push notification status")
    sentViaSMS: bool = Field(False, description="SMS delivery status")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Analytics Models
class Analytics(BaseModel):
    id: str = Field(..., description="Unique analytics record identifier")
    userId: str = Field(..., description="User ID for analytics")
    
    # Analytics Data
    date: datetime = Field(..., description="Analytics date")
    metrics: Dict[str, Any] = Field(..., description="Analytics metrics")
    
    # Revenue Metrics (for performers)
    revenue: Optional[float] = Field(None, description="Daily revenue")
    subscriptions: Optional[int] = Field(None, description="New subscriptions")
    tips: Optional[float] = Field(None, description="Tips received")
    
    # Engagement Metrics
    views: Optional[int] = Field(None, description="Content views")
    likes: Optional[int] = Field(None, description="Content likes")
    comments: Optional[int] = Field(None, description="Content comments")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)