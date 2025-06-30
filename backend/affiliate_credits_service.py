import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from affiliate_credits_models import (
    AffiliateProgram, ReferralTracking, CreditAccount, CreditTransaction,
    ExpertPayoutAccount, PayoutRequest, PayoutHistory, ShoppingCart, CartItem,
    AffiliateStatus, CreditTransactionType, CreditTransactionStatus,
    PayoutStatus, PayoutMethod
)

class AffiliateService:
    def __init__(self, db):
        self.db = db
        
    async def create_affiliate_account(self, member_id: str) -> AffiliateProgram:
        """Create a new affiliate account for a member"""
        # Generate unique affiliate code
        affiliate_code = self._generate_affiliate_code(member_id)
        referral_link = f"https://theexperts.com/signup?ref={affiliate_code}"
        
        affiliate_account = AffiliateProgram(
            memberId=member_id,
            affiliateCode=affiliate_code,
            referralLink=referral_link
        )
        
        await self.db.affiliate_programs.insert_one(affiliate_account.dict())
        return affiliate_account
    
    async def get_affiliate_account(self, member_id: str) -> Optional[AffiliateProgram]:
        """Get affiliate account for a member"""
        account_data = await self.db.affiliate_programs.find_one({"memberId": member_id})
        if account_data:
            return AffiliateProgram(**account_data)
        return None
    
    async def track_referral_click(self, affiliate_code: str, ip_address: str, user_agent: str, referrer_url: str) -> ReferralTracking:
        """Track when someone clicks on a referral link"""
        # Find the affiliate account
        affiliate_account = await self.db.affiliate_programs.find_one({"affiliateCode": affiliate_code})
        if not affiliate_account:
            raise Exception("Invalid affiliate code")
        
        tracking = ReferralTracking(
            affiliateCode=affiliate_code,
            referrerId=affiliate_account["memberId"],
            ipAddress=ip_address,
            userAgent=user_agent,
            referrerUrl=referrer_url
        )
        
        await self.db.referral_tracking.insert_one(tracking.dict())
        return tracking
    
    async def process_referral_signup(self, affiliate_code: str, new_user_id: str) -> bool:
        """Process when a referred user actually signs up"""
        # Find pending referral tracking
        tracking_data = await self.db.referral_tracking.find_one({
            "affiliateCode": affiliate_code,
            "hasSignedUp": False
        })
        
        if not tracking_data:
            return False
        
        # Update tracking record
        await self.db.referral_tracking.update_one(
            {"id": tracking_data["id"]},
            {
                "$set": {
                    "referredUserId": new_user_id,
                    "hasSignedUp": True,
                    "signupDate": datetime.utcnow(),
                    "creditsAwarded": 10.0,  # Default referral bonus
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Award credits to the referrer
        credit_service = CreditService(self.db)
        await credit_service.award_referral_credits(tracking_data["referrerId"], 10.0, new_user_id)
        
        # Update affiliate account stats
        await self.db.affiliate_programs.update_one(
            {"affiliateCode": affiliate_code},
            {
                "$inc": {
                    "totalReferrals": 1,
                    "totalCreditsEarned": 10.0
                },
                "$set": {
                    "updatedAt": datetime.utcnow(),
                    "lastActiveAt": datetime.utcnow()
                }
            }
        )
        
        return True
    
    async def get_referral_stats(self, member_id: str) -> Dict[str, Any]:
        """Get referral statistics for a member"""
        try:
            affiliate_account = await self.get_affiliate_account(member_id)
            if not affiliate_account:
                return {"error": "No affiliate account found"}
            
            # Get recent referrals
            recent_referrals = await self.db.referral_tracking.find({
                "referrerId": member_id,
                "hasSignedUp": True
            }).sort("signupDate", -1).limit(10).to_list(10)
            
            return {
                "affiliate_code": affiliate_account.affiliateCode,
                "referral_link": affiliate_account.referralLink,
                "total_referrals": affiliate_account.totalReferrals,
                "total_credits_earned": affiliate_account.totalCreditsEarned,
                "recent_referrals": recent_referrals,
                "status": affiliate_account.status
            }
        except Exception as e:
            # Log the error and return a safe response
            print(f"Error getting referral stats: {str(e)}")
            return {
                "error": f"Failed to get referral stats: {str(e)}",
                "affiliate_code": None,
                "referral_link": None,
                "total_referrals": 0,
                "total_credits_earned": 0.0,
                "recent_referrals": [],
                "status": "inactive"
            }
    
    def _generate_affiliate_code(self, member_id: str) -> str:
        """Generate a unique affiliate code"""
        # Create a more predictable but still unique hash using member_id as base
        data = f"affiliate_{member_id}_{datetime.utcnow().strftime('%Y%m%d')}"
        hash_object = hashlib.md5(data.encode())
        return f"REF{hash_object.hexdigest()[:8].upper()}"

class CreditService:
    def __init__(self, db):
        self.db = db
    
    async def create_credit_account(self, user_id: str) -> CreditAccount:
        """Create a new credit account for a user"""
        # Check if account already exists
        existing = await self.db.credit_accounts.find_one({"userId": user_id})
        if existing:
            return CreditAccount(**existing)
        
        credit_account = CreditAccount(userId=user_id)
        await self.db.credit_accounts.insert_one(credit_account.dict())
        return credit_account
    
    async def get_credit_account(self, user_id: str) -> Optional[CreditAccount]:
        """Get credit account for a user"""
        account_data = await self.db.credit_accounts.find_one({"userId": user_id})
        if account_data:
            return CreditAccount(**account_data)
        return None
    
    async def get_credit_balance(self, user_id: str) -> float:
        """Get available credit balance for a user"""
        account = await self.get_credit_account(user_id)
        if account:
            return account.totalCredits
        return 0.0
    
    async def award_referral_credits(self, user_id: str, amount: float, referred_user_id: str) -> CreditTransaction:
        """Award credits for a successful referral"""
        # Ensure credit account exists
        await self.create_credit_account(user_id)
        
        # Create credit transaction
        transaction = CreditTransaction(
            userId=user_id,
            creditAccountId=user_id,  # Using user_id as account_id for simplicity
            transactionType=CreditTransactionType.EARNED_REFERRAL,
            amount=amount,
            description=f"Referral bonus for new member {referred_user_id}",
            relatedId=referred_user_id,
            relatedType="referral"
        )
        
        await self.db.credit_transactions.insert_one(transaction.dict())
        
        # Update credit account balance
        await self.db.credit_accounts.update_one(
            {"userId": user_id},
            {
                "$inc": {
                    "totalCredits": amount,
                    "lifetimeEarned": amount
                },
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        return transaction
    
    async def use_credits_for_purchase(self, user_id: str, amount: float, order_id: str, description: str) -> bool:
        """Use credits for a purchase"""
        account = await self.get_credit_account(user_id)
        if not account or account.totalCredits < amount:
            return False
        
        # Create debit transaction
        transaction = CreditTransaction(
            userId=user_id,
            creditAccountId=user_id,
            transactionType=CreditTransactionType.SPENT_PURCHASE,
            amount=-amount,  # Negative for spending
            description=description,
            orderId=order_id,
            relatedType="purchase"
        )
        
        await self.db.credit_transactions.insert_one(transaction.dict())
        
        # Update credit account balance
        await self.db.credit_accounts.update_one(
            {"userId": user_id},
            {
                "$inc": {
                    "totalCredits": -amount,
                    "lifetimeSpent": amount
                },
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        return True
    
    async def get_credit_history(self, user_id: str, limit: int = 50) -> List[CreditTransaction]:
        """Get credit transaction history for a user"""
        transactions = await self.db.credit_transactions.find({
            "userId": user_id
        }).sort("createdAt", -1).limit(limit).to_list(limit)
        
        return [CreditTransaction(**t) for t in transactions]
    
    async def calculate_max_credits_usable(self, total_amount: float, max_percentage: float = 0.5) -> float:
        """Calculate maximum credits that can be used for a purchase (default 50%)"""
        return total_amount * max_percentage

class PayoutService:
    def __init__(self, db):
        self.db = db
    
    async def create_payout_account(self, expert_id: str, account_data: Dict[str, Any]) -> ExpertPayoutAccount:
        """Create a new payout account for an expert"""
        payout_account = ExpertPayoutAccount(
            expertId=expert_id,
            **account_data
        )
        
        await self.db.expert_payout_accounts.insert_one(payout_account.dict())
        return payout_account
    
    async def get_payout_accounts(self, expert_id: str) -> List[ExpertPayoutAccount]:
        """Get all payout accounts for an expert"""
        accounts = await self.db.expert_payout_accounts.find({
            "expertId": expert_id,
            "isActive": True
        }).to_list(100)
        
        return [ExpertPayoutAccount(**account) for account in accounts]
    
    async def request_payout(self, expert_id: str, amount: float, payout_account_id: str, description: str = None) -> PayoutRequest:
        """Create a new payout request"""
        # Verify payout account exists and belongs to expert
        account = await self.db.expert_payout_accounts.find_one({
            "id": payout_account_id,
            "expertId": expert_id,
            "isActive": True
        })
        
        if not account:
            raise Exception("Invalid payout account")
        
        # Check if expert has sufficient earnings to payout
        # This would typically check against their earnings/wallet balance
        
        payout_request = PayoutRequest(
            expertId=expert_id,
            payoutAccountId=payout_account_id,
            amount=amount,
            description=description
        )
        
        await self.db.payout_requests.insert_one(payout_request.dict())
        return payout_request
    
    async def get_payout_requests(self, expert_id: str, status: Optional[PayoutStatus] = None) -> List[PayoutRequest]:
        """Get payout requests for an expert"""
        query = {"expertId": expert_id}
        if status:
            query["status"] = status.value
        
        requests = await self.db.payout_requests.find(query).sort("createdAt", -1).to_list(100)
        return [PayoutRequest(**req) for req in requests]
    
    async def process_payout_request(self, request_id: str, admin_notes: str = None) -> bool:
        """Process a payout request (admin function)"""
        payout_request = await self.db.payout_requests.find_one({"id": request_id})
        if not payout_request:
            return False
        
        # Update status to processing
        await self.db.payout_requests.update_one(
            {"id": request_id},
            {
                "$set": {
                    "status": PayoutStatus.PROCESSING.value,
                    "processingNotes": admin_notes,
                    "processedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Here you would integrate with actual payment processing
        # For now, we'll simulate successful processing
        
        return True
    
    async def complete_payout(self, request_id: str, transaction_id: str, processing_fee: float = 0.0) -> PayoutHistory:
        """Complete a payout and create history record"""
        payout_request = await self.db.payout_requests.find_one({"id": request_id})
        if not payout_request:
            raise Exception("Payout request not found")
        
        net_amount = payout_request["amount"] - processing_fee
        
        # Update payout request
        await self.db.payout_requests.update_one(
            {"id": request_id},
            {
                "$set": {
                    "status": PayoutStatus.COMPLETED.value,
                    "transactionId": transaction_id,
                    "processingFee": processing_fee,
                    "netAmount": net_amount,
                    "completedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Create history record
        history = PayoutHistory(
            payoutRequestId=request_id,
            expertId=payout_request["expertId"],
            amount=payout_request["amount"],
            payoutMethod=PayoutMethod.BANK_TRANSFER,  # Default for now
            status=PayoutStatus.COMPLETED,
            processingFee=processing_fee,
            netAmount=net_amount,
            transactionId=transaction_id,
            completedAt=datetime.utcnow()
        )
        
        await self.db.payout_history.insert_one(history.dict())
        return history

class ShoppingCartService:
    def __init__(self, db):
        self.db = db
        self.credit_service = CreditService(db)
    
    async def get_or_create_cart(self, user_id: str) -> ShoppingCart:
        """Get existing cart or create new one for user"""
        cart_data = await self.db.shopping_carts.find_one({
            "userId": user_id,
            "isActive": True
        })
        
        if cart_data:
            return ShoppingCart(**cart_data)
        
        # Create new cart
        cart = ShoppingCart(userId=user_id)
        await self.db.shopping_carts.insert_one(cart.dict())
        return cart
    
    async def add_item_to_cart(self, user_id: str, product_id: str, product_data: Dict[str, Any]) -> CartItem:
        """Add item to shopping cart"""
        cart = await self.get_or_create_cart(user_id)
        
        cart_item = CartItem(
            userId=user_id,
            productId=product_id,
            **product_data
        )
        
        await self.db.cart_items.insert_one(cart_item.dict())
        await self._update_cart_totals(cart.id)
        
        return cart_item
    
    async def apply_credits_to_cart(self, user_id: str, credits_to_use: float) -> Dict[str, Any]:
        """Apply credits to shopping cart"""
        cart = await self.get_or_create_cart(user_id)
        user_credit_balance = await self.credit_service.get_credit_balance(user_id)
        
        # Calculate maximum credits that can be used (50% of total)
        max_credits_usable = await self.credit_service.calculate_max_credits_usable(cart.subtotal)
        
        # Validate credits amount
        if credits_to_use > user_credit_balance:
            return {"error": "Insufficient credit balance"}
        
        if credits_to_use > max_credits_usable:
            return {"error": f"Maximum {max_credits_usable} credits can be used for this purchase"}
        
        # Update cart with credits
        cash_payment = cart.subtotal - credits_to_use
        
        await self.db.shopping_carts.update_one(
            {"id": cart.id},
            {
                "$set": {
                    "creditsUsed": credits_to_use,
                    "creditPayment": credits_to_use,
                    "cashPayment": cash_payment,
                    "finalTotal": cash_payment,
                    "maxCreditsUsable": max_credits_usable,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "credits_used": credits_to_use,
            "cash_payment": cash_payment,
            "total_savings": credits_to_use
        }
    
    async def _update_cart_totals(self, cart_id: str):
        """Update cart totals based on items"""
        # Find the cart first to get the user_id
        cart = await self.db.shopping_carts.find_one({"id": cart_id})
        if not cart:
            return
        
        user_id = cart["userId"]
        cart_items = await self.db.cart_items.find({"userId": user_id}).to_list(100)
        subtotal = sum(item["totalPrice"] for item in cart_items)
        
        await self.db.shopping_carts.update_one(
            {"id": cart_id},
            {
                "$set": {
                    "subtotal": subtotal,
                    "finalTotal": subtotal,
                    "cashPayment": subtotal,
                    "updatedAt": datetime.utcnow()
                }
            }
        )