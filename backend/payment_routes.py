from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import httpx
import json
import hashlib
import hmac
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Pydantic Models
class PaymentPackage(BaseModel):
    id: str
    name: str
    price: float
    period: str
    description: str
    userType: str

class CCBillPaymentRequest(BaseModel):
    paymentToken: str
    packageId: str
    amount: float
    isSubscription: bool

class StripePaymentRequest(BaseModel):
    packageId: str
    successUrl: str
    cancelUrl: str
    metadata: Optional[Dict[str, str]] = None

class CryptoPaymentRequest(BaseModel):
    packageId: str
    amount: float
    currency: str
    isSubscription: bool

class PaymentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Package Definitions (Server-side only for security)
PAYMENT_PACKAGES = {
    # Member Packages
    "member_monthly": {
        "id": "member_monthly",
        "name": "Monthly Membership",
        "price": 19.95,
        "period": "1 month",
        "description": "Access to all premium content",
        "userType": "member"
    },
    "member_quarterly": {
        "id": "member_quarterly", 
        "name": "Quarterly Membership",
        "price": 54.99,
        "period": "3 months",
        "description": "Best value for regular users",
        "userType": "member"
    },
    "member_annual": {
        "id": "member_annual",
        "name": "Annual Membership", 
        "price": 179.99,
        "period": "12 months",
        "description": "Maximum savings for power users",
        "userType": "member"
    },
    # Performer Packages
    "performer_monthly": {
        "id": "performer_monthly",
        "name": "Creator Monthly",
        "price": 50.00,
        "period": "1 month", 
        "description": "Start your content creation journey",
        "userType": "performer"
    },
    "performer_quarterly": {
        "id": "performer_quarterly",
        "name": "Creator Quarterly",
        "price": 140.00,
        "period": "3 months",
        "description": "Popular choice for serious creators", 
        "userType": "performer"
    },
    "performer_annual": {
        "id": "performer_annual",
        "name": "Creator Annual",
        "price": 500.00,
        "period": "12 months",
        "description": "Best value for professional creators",
        "userType": "performer"
    }
}

# CCBill OAuth Token Management
async def get_ccbill_token() -> str:
    """Get OAuth token for CCBill API"""
    try:
        url = f"{os.getenv('CCBILL_BASE_URL', 'https://api.ccbill.com')}/ccbill-auth/oauth/token"
        auth = (os.getenv('CCBILL_MERCHANT_ID'), os.getenv('CCBILL_SECRET_KEY'))
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                data={"grant_type": "client_credentials"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                auth=auth,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(502, f"CCBill auth failed: {response.text}")
                
            return response.json()["access_token"]
    except Exception as e:
        raise HTTPException(502, f"CCBill authentication error: {str(e)}")

# CCBill Payment Processing
@router.post("/ccbill/process")
async def process_ccbill_payment(
    request: CCBillPaymentRequest,
    # Add authentication dependency here
):
    """Process CCBill payment"""
    try:
        # Validate package
        if request.packageId not in PAYMENT_PACKAGES:
            raise HTTPException(400, "Invalid package ID")
        
        package = PAYMENT_PACKAGES[request.packageId]
        
        # Verify amount matches package price
        if abs(request.amount - package["price"]) > 0.01:
            raise HTTPException(400, "Amount mismatch")
        
        # Get CCBill token
        token = await get_ccbill_token()
        
        # Process payment
        charge_url = f"{os.getenv('CCBILL_BASE_URL')}/transactions/payment-tokens/{request.paymentToken}"
        headers = {"Authorization": f"Bearer {token}"}
        
        payload = {
            "clientAccnum": os.getenv("CCBILL_ACCOUNT_NUM"),
            "clientSubacc": "0000",
            "initialPrice": request.amount,
            "initialPeriod": get_period_in_days(package["period"]),
            "currencyCode": "USD"
        }
        
        # Add subscription details if applicable
        if request.isSubscription:
            payload.update({
                "recurringPrice": request.amount,
                "recurringPeriod": get_period_in_days(package["period"]),
                "rebills": 99
            })
        
        async with httpx.AsyncClient() as client:
            response = await client.post(charge_url, json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                return PaymentResponse(
                    success=False,
                    message=f"Payment failed: {response.text}"
                )
            
            result = response.json()
            
            # Store transaction in database (implement your database logic here)
            transaction_data = {
                "id": str(uuid.uuid4()),
                "user_id": "current_user_id",  # Get from auth
                "package_id": request.packageId,
                "amount": request.amount,
                "currency": "USD",
                "payment_method": "ccbill",
                "transaction_id": result.get("transactionId"),
                "status": "completed",
                "created_at": datetime.utcnow(),
                "metadata": {
                    "package_name": package["name"],
                    "is_subscription": request.isSubscription
                }
            }
            
            # TODO: Save to MongoDB
            
            return PaymentResponse(
                success=True,
                message="Payment processed successfully",
                data={
                    "transactionId": result.get("transactionId"),
                    "package": package,
                    "amount": request.amount
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Payment processing error: {str(e)}")

# Stripe Payment Processing
@router.post("/stripe/create-session")
async def create_stripe_session(
    request: StripePaymentRequest,
    # Add authentication dependency here
):
    """Create Stripe checkout session"""
    try:
        # Validate package
        if request.packageId not in PAYMENT_PACKAGES:
            raise HTTPException(400, "Invalid package ID")
        
        package = PAYMENT_PACKAGES[request.packageId]
        
        # Simulate Stripe session creation (replace with actual Stripe integration)
        session_data = {
            "id": f"cs_{str(uuid.uuid4())[:24]}",
            "url": f"https://checkout.stripe.com/pay/{str(uuid.uuid4())[:32]}",
            "amount": package["price"],
            "currency": "usd",
            "package": package,
            "metadata": request.metadata or {}
        }
        
        # Store pending transaction
        transaction_data = {
            "id": str(uuid.uuid4()),
            "user_id": "current_user_id",  # Get from auth
            "package_id": request.packageId,
            "amount": package["price"],
            "currency": "USD",
            "payment_method": "stripe",
            "session_id": session_data["id"],
            "status": "pending",
            "created_at": datetime.utcnow(),
            "metadata": request.metadata or {}
        }
        
        # TODO: Save to MongoDB
        
        return PaymentResponse(
            success=True,
            message="Stripe session created",
            data={
                "url": session_data["url"],
                "sessionId": session_data["id"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Stripe session creation error: {str(e)}")

# Cryptocurrency Payment Processing
@router.post("/crypto/create")
async def create_crypto_payment(
    request: CryptoPaymentRequest,
    # Add authentication dependency here
):
    """Create cryptocurrency payment"""
    try:
        # Validate package
        if request.packageId not in PAYMENT_PACKAGES:
            raise HTTPException(400, "Invalid package ID")
        
        package = PAYMENT_PACKAGES[request.packageId]
        
        # Verify amount matches package price
        if abs(request.amount - package["price"]) > 0.01:
            raise HTTPException(400, "Amount mismatch")
        
        # Simulate NOWPayments API call
        payment_data = {
            "id": str(uuid.uuid4()),
            "address": generate_crypto_address(request.currency),
            "amount": request.amount,
            "currency": "USD",
            "cryptoAmount": calculate_crypto_amount(request.amount, request.currency),
            "cryptoCurrency": request.currency.upper(),
            "status": "waiting",
            "expiresAt": (datetime.utcnow() + timedelta(minutes=30)).isoformat(),
            "qrCode": f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
        
        # Store pending crypto transaction
        transaction_data = {
            "id": payment_data["id"],
            "user_id": "current_user_id",  # Get from auth
            "package_id": request.packageId,
            "amount": request.amount,
            "currency": "USD",
            "payment_method": "crypto",
            "crypto_currency": request.currency.upper(),
            "crypto_amount": payment_data["cryptoAmount"],
            "crypto_address": payment_data["address"],
            "status": "pending",
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=30),
            "metadata": {
                "package_name": package["name"],
                "is_subscription": request.isSubscription
            }
        }
        
        # TODO: Save to MongoDB
        
        return PaymentResponse(
            success=True,
            message="Crypto payment created",
            data={"payment": payment_data}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Crypto payment creation error: {str(e)}")

# Payment Status Check
@router.get("/status/{payment_id}")
async def check_payment_status(
    payment_id: str,
    # Add authentication dependency here
):
    """Check payment status"""
    try:
        # TODO: Retrieve from MongoDB based on payment_id
        # This is a mock implementation
        
        # Simulate different payment statuses
        mock_status = {
            "transactionId": payment_id,
            "status": "completed",
            "amount": 19.95,
            "currency": "USD",
            "date": datetime.utcnow().isoformat(),
            "method": "ccbill"
        }
        
        return PaymentResponse(
            success=True,
            message="Payment status retrieved",
            data=mock_status
        )
        
    except Exception as e:
        raise HTTPException(500, f"Error checking payment status: {str(e)}")

# Crypto Payment Status Check
@router.get("/crypto/status/{payment_id}")
async def check_crypto_payment_status(
    payment_id: str,
    # Add authentication dependency here
):
    """Check cryptocurrency payment status"""
    try:
        # TODO: Check with NOWPayments API and update database
        # This is a mock implementation
        
        # Simulate payment confirmation
        import random
        statuses = ["pending", "completed", "failed"]
        status = random.choice(statuses)
        
        mock_status = {
            "id": payment_id,
            "status": status,
            "amount": 19.95,
            "currency": "USD",
            "cryptoAmount": "0.00052",
            "cryptoCurrency": "BTC",
            "confirmations": 3 if status == "completed" else 0,
            "date": datetime.utcnow().isoformat()
        }
        
        return PaymentResponse(
            success=True,
            message="Crypto payment status retrieved",
            data=mock_status
        )
        
    except Exception as e:
        raise HTTPException(500, f"Error checking crypto payment status: {str(e)}")

# Webhook Handlers
@router.post("/webhooks/ccbill")
async def ccbill_webhook(request: Request):
    """Handle CCBill webhooks"""
    try:
        payload = await request.form()
        event_type = payload.get("eventType")
        
        # Verify webhook signature (implement proper verification)
        
        if event_type == "NewSaleSuccess":
            # Handle successful payment
            await handle_successful_payment(dict(payload))
        elif event_type == "Renewal":
            # Handle subscription renewal
            await handle_subscription_renewal(dict(payload))
        elif event_type == "Cancellation":
            # Handle subscription cancellation
            await handle_subscription_cancellation(dict(payload))
        elif event_type == "Chargeback":
            # Handle chargeback
            await handle_chargeback(dict(payload))
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(500, f"Webhook processing failed: {str(e)}")

@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        body = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # Verify webhook signature (implement proper verification)
        
        event = json.loads(body)
        
        if event['type'] == 'checkout.session.completed':
            # Handle successful checkout
            await handle_stripe_success(event['data']['object'])
        elif event['type'] == 'invoice.payment_succeeded':
            # Handle subscription payment
            await handle_stripe_subscription_payment(event['data']['object'])
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(500, f"Stripe webhook processing failed: {str(e)}")

# Helper Functions
def get_period_in_days(period: str) -> int:
    """Convert period string to days"""
    period_map = {
        "1 month": 30,
        "3 months": 90,
        "12 months": 365
    }
    return period_map.get(period, 30)

def generate_crypto_address(currency: str) -> str:
    """Generate mock crypto address"""
    # This should be replaced with actual address generation from crypto payment processor
    address_prefixes = {
        "btc": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        "eth": "0x742e4d8c0be515c12f5f88dfc59f19c94b2d1234",
        "usdt": "0x742e4d8c0be515c12f5f88dfc59f19c94b2d5678",
        "usdc": "0x742e4d8c0be515c12f5f88dfc59f19c94b2d9abc",
        "ltc": "LhK2zqFAj8RdJ1d2bCUf6hG8pQ3v9Xy123",
        "bch": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"
    }
    return address_prefixes.get(currency.lower(), "mock_address_12345")

def calculate_crypto_amount(usd_amount: float, currency: str) -> str:
    """Calculate crypto amount based on USD (mock implementation)"""
    # This should use real-time exchange rates
    mock_rates = {
        "btc": 45000.0,
        "eth": 2800.0,
        "usdt": 1.0,
        "usdc": 1.0,
        "ltc": 85.0,
        "bch": 220.0
    }
    
    rate = mock_rates.get(currency.lower(), 1.0)
    crypto_amount = usd_amount / rate
    
    # Format based on currency
    if currency.lower() in ["usdt", "usdc"]:
        return f"{crypto_amount:.2f}"
    elif currency.lower() == "btc":
        return f"{crypto_amount:.8f}"
    else:
        return f"{crypto_amount:.6f}"

# Webhook Event Handlers
async def handle_successful_payment(payload: dict):
    """Handle successful payment webhook"""
    # TODO: Update transaction status in MongoDB
    # Update user subscription status
    # Send confirmation email
    pass

async def handle_subscription_renewal(payload: dict):
    """Handle subscription renewal webhook"""
    # TODO: Update subscription end date
    # Record renewal transaction
    pass

async def handle_subscription_cancellation(payload: dict):
    """Handle subscription cancellation webhook"""
    # TODO: Mark subscription as canceled
    # Update user access
    pass

async def handle_chargeback(payload: dict):
    """Handle chargeback webhook"""
    # TODO: Handle dispute logic
    # Suspend user account if needed
    pass

async def handle_stripe_success(session: dict):
    """Handle Stripe checkout success"""
    # TODO: Update transaction status
    # Activate user subscription
    pass

async def handle_stripe_subscription_payment(invoice: dict):
    """Handle Stripe subscription payment"""
    # TODO: Update subscription status
    # Record recurring payment
    pass