from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid

# Enums for affiliate and credits system
class AffiliateStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class CreditTransactionType(str, Enum):
    EARNED_REFERRAL = "earned_referral"
    EARNED_SIGNUP_BONUS = "earned_signup_bonus"
    SPENT_PURCHASE = "spent_purchase"
    SPENT_SERVICE = "spent_service"
    REFUNDED = "refunded"
    EXPIRED = "expired"
    ADMIN_ADJUSTMENT = "admin_adjustment"

class CreditTransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"

class PayoutStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"

class PayoutMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    CHECK = "check"

# Affiliate Program Models
class AffiliateProgram(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique affiliate program identifier")
    memberId: str = Field(..., description="Member user ID who owns this affiliate account")
    
    # Affiliate Details
    affiliateCode: str = Field(..., description="Unique affiliate code for referrals")
    referralLink: str = Field(..., description="Full referral link with affiliate code")
    status: AffiliateStatus = Field(AffiliateStatus.ACTIVE, description="Affiliate account status")
    
    # Earnings Settings
    referralBonus: float = Field(10.0, description="Credit amount earned per successful referral")
    tier1Rate: float = Field(0.10, description="Commission rate for direct referrals")
    tier2Rate: float = Field(0.05, description="Commission rate for 2nd tier referrals")
    
    # Statistics
    totalReferrals: int = Field(0, description="Total number of successful referrals")
    totalCreditsEarned: float = Field(0.0, description="Total credits earned from referrals")
    totalCommissionEarned: float = Field(0.0, description="Total commission earned")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    lastActiveAt: Optional[datetime] = Field(None, description="Last referral activity")

class ReferralTracking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique referral tracking identifier")
    affiliateCode: str = Field(..., description="Affiliate code used")
    referrerId: str = Field(..., description="Member ID who made the referral")
    referredUserId: Optional[str] = Field(None, description="User ID who was referred (set when they sign up)")
    
    # Tracking Details
    ipAddress: Optional[str] = Field(None, description="IP address of the referral click")
    userAgent: Optional[str] = Field(None, description="User agent string")
    referrerUrl: Optional[str] = Field(None, description="URL where the referral link was clicked")
    
    # Conversion Details
    hasSignedUp: bool = Field(False, description="Whether the referred user signed up")
    signupDate: Optional[datetime] = Field(None, description="Date when referred user signed up")
    creditsAwarded: float = Field(0.0, description="Credits awarded for this referral")
    
    # Status
    isActive: bool = Field(True, description="Whether this referral is active")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Credits System Models
class CreditAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique credit account identifier")
    userId: str = Field(..., description="User ID who owns this credit account")
    
    # Balance Information
    totalCredits: float = Field(0.0, description="Total credits available")
    pendingCredits: float = Field(0.0, description="Credits pending approval")
    lifetimeEarned: float = Field(0.0, description="Total credits ever earned")
    lifetimeSpent: float = Field(0.0, description="Total credits ever spent")
    
    # Settings
    autoApprove: bool = Field(True, description="Auto-approve credit transactions")
    maxDailySpend: Optional[float] = Field(None, description="Maximum credits that can be spent per day")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CreditTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique credit transaction identifier")
    userId: str = Field(..., description="User ID associated with this transaction")
    creditAccountId: str = Field(..., description="Credit account ID")
    
    # Transaction Details
    transactionType: CreditTransactionType = Field(..., description="Type of credit transaction")
    amount: float = Field(..., description="Amount of credits (positive for earning, negative for spending)")
    description: str = Field(..., description="Description of the transaction")
    
    # Related Information
    relatedId: Optional[str] = Field(None, description="Related entity ID (referral, purchase, etc.)")
    relatedType: Optional[str] = Field(None, description="Related entity type")
    orderId: Optional[str] = Field(None, description="Order ID if related to a purchase")
    
    # Status
    status: CreditTransactionStatus = Field(CreditTransactionStatus.COMPLETED, description="Transaction status")
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional transaction metadata")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    processedAt: Optional[datetime] = Field(None, description="When transaction was processed")

# Payout System Models
class ExpertPayoutAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique payout account identifier")
    expertId: str = Field(..., description="Expert user ID")
    
    # Account Details
    accountHolderName: str = Field(..., description="Name on the account")
    payoutMethod: PayoutMethod = Field(..., description="Preferred payout method")
    
    # Bank Details (for bank transfers)
    bankName: Optional[str] = Field(None, description="Bank name")
    accountNumber: Optional[str] = Field(None, description="Bank account number (encrypted)")
    routingNumber: Optional[str] = Field(None, description="Bank routing number")
    swiftCode: Optional[str] = Field(None, description="SWIFT code for international transfers")
    
    # PayPal Details
    paypalEmail: Optional[str] = Field(None, description="PayPal email address")
    
    # Address Information
    country: str = Field(..., description="Country")
    state: Optional[str] = Field(None, description="State/Province")
    city: str = Field(..., description="City")
    address: str = Field(..., description="Street address")
    zipCode: str = Field(..., description="ZIP/Postal code")
    
    # Verification
    isVerified: bool = Field(False, description="Account verification status")
    verificationDocuments: List[str] = Field([], description="Verification document URLs")
    verifiedAt: Optional[datetime] = Field(None, description="Verification completion date")
    
    # Settings
    isDefault: bool = Field(False, description="Whether this is the default payout account")
    isActive: bool = Field(True, description="Account active status")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class PayoutRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique payout request identifier")
    expertId: str = Field(..., description="Expert user ID requesting payout")
    payoutAccountId: str = Field(..., description="Payout account to use")
    
    # Request Details
    amount: float = Field(..., description="Amount requested for payout")
    currency: str = Field("USD", description="Currency for payout")
    description: Optional[str] = Field(None, description="Payout description or notes")
    
    # Status and Processing
    status: PayoutStatus = Field(PayoutStatus.PENDING, description="Payout request status")
    processingNotes: Optional[str] = Field(None, description="Admin notes on processing")
    
    # Payment Information
    transactionId: Optional[str] = Field(None, description="External transaction ID when processed")
    processingFee: Optional[float] = Field(None, description="Fee charged for processing")
    netAmount: Optional[float] = Field(None, description="Net amount after fees")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    processedAt: Optional[datetime] = Field(None, description="When payout was processed")
    completedAt: Optional[datetime] = Field(None, description="When payout was completed")

class PayoutHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique payout history identifier")
    payoutRequestId: str = Field(..., description="Associated payout request ID")
    expertId: str = Field(..., description="Expert user ID")
    
    # Historical Record
    amount: float = Field(..., description="Payout amount")
    currency: str = Field("USD", description="Payout currency")
    payoutMethod: PayoutMethod = Field(..., description="Method used for payout")
    status: PayoutStatus = Field(..., description="Final payout status")
    
    # Processing Details
    processingFee: float = Field(0.0, description="Fee charged")
    netAmount: float = Field(..., description="Net amount paid out")
    transactionId: Optional[str] = Field(None, description="External transaction ID")
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional payout metadata")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: datetime = Field(..., description="When payout was completed")

# Shopping Cart Enhancement for Credits
class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique cart item identifier")
    userId: str = Field(..., description="User ID who owns this cart")
    
    # Item Details
    productId: str = Field(..., description="Product or service ID")
    productType: str = Field(..., description="Type of product (service, consultation, etc.)")
    productName: str = Field(..., description="Product name")
    quantity: int = Field(1, description="Quantity of items")
    unitPrice: float = Field(..., description="Price per unit")
    totalPrice: float = Field(..., description="Total price for this item")
    
    # Product Details
    expertId: Optional[str] = Field(None, description="Expert ID if purchasing from an expert")
    duration: Optional[int] = Field(None, description="Duration in minutes for services")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional item metadata")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ShoppingCart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique shopping cart identifier")
    userId: str = Field(..., description="User ID who owns this cart")
    
    # Cart Totals
    subtotal: float = Field(0.0, description="Subtotal before discounts and fees")
    taxAmount: float = Field(0.0, description="Tax amount")
    discountAmount: float = Field(0.0, description="Total discount amount")
    creditsUsed: float = Field(0.0, description="Credits applied to this cart")
    finalTotal: float = Field(0.0, description="Final total after all adjustments")
    
    # Payment Breakdown
    cashPayment: float = Field(0.0, description="Amount to be paid with cash/card")
    creditPayment: float = Field(0.0, description="Amount to be paid with credits")
    
    # Settings
    maxCreditsUsable: Optional[float] = Field(None, description="Maximum credits that can be used (50% of total)")
    
    # Status
    isActive: bool = Field(True, description="Whether cart is active")
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    lastModifiedAt: datetime = Field(default_factory=datetime.utcnow)