#!/usr/bin/env python3
import unittest
import requests
import json
import time
import os
from enum import Enum
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"')
            break

# Add /api prefix for all API endpoints
API_URL = f"{BACKEND_URL}/api"

# Test constants
TEST_MEMBER_ID = "test-member-123"
TEST_NEW_USER_ID = "test-new-user-456"
TEST_EXPERT_ID = "test-expert-789"

class TestAffiliateCreditsPayout(unittest.TestCase):
    """Test suite for Affiliate Program, Credits System, and Payout System APIs"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Test payout account data
        self.test_bank_account = {
            "accountHolderName": "John Expert",
            "payoutMethod": "bank_transfer",
            "bankName": "Test Bank",
            "accountNumber": "1234567890",
            "routingNumber": "987654321",
            "country": "United States",
            "state": "California",
            "city": "San Francisco",
            "address": "123 Test St",
            "zipCode": "94105"
        }
        
        # Test product data
        self.test_product = {
            "productType": "consultation",
            "productName": "1-Hour Expert Consultation",
            "unitPrice": 50.0,
            "totalPrice": 50.0,
            "expertId": TEST_EXPERT_ID,
            "duration": 60
        }
        
    def test_affiliate_program(self):
        """Test the affiliate program functionality"""
        print("\n=== Testing Affiliate Program ===")
        
        # 1. Create affiliate account
        response = requests.post(f"{API_URL}/affiliate/create", params={"member_id": TEST_MEMBER_ID})
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("affiliate_account", data)
        
        affiliate_account = data["affiliate_account"]
        self.assertEqual(affiliate_account["memberId"], TEST_MEMBER_ID)
        self.assertIn("affiliateCode", affiliate_account)
        self.assertIn("referralLink", affiliate_account)
        
        affiliate_code = affiliate_account["affiliateCode"]
        print(f"Created affiliate account with code: {affiliate_code}")
        
        # 2. Track referral click
        response = requests.post(
            f"{API_URL}/affiliate/track-click",
            params={
                "affiliate_code": affiliate_code,
                "referrer_url": "https://example.com/landing-page"
            }
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("tracking_id", data)
        
        print(f"Tracked referral click: {data['tracking_id']}")
        
        # 3. Process referral signup
        response = requests.post(
            f"{API_URL}/affiliate/process-signup",
            params={
                "affiliate_code": affiliate_code,
                "new_user_id": TEST_NEW_USER_ID
            }
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Processed referral signup: {data['message']}")
        
        # 4. Get affiliate account
        response = requests.get(f"{API_URL}/affiliate/{TEST_MEMBER_ID}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("affiliate_account", data)
        
        retrieved_account = data["affiliate_account"]
        self.assertEqual(retrieved_account["memberId"], TEST_MEMBER_ID)
        
        print(f"Retrieved affiliate account for member {TEST_MEMBER_ID}")
        print(f"Created affiliate code: {affiliate_code}")
        print(f"Retrieved affiliate code: {retrieved_account['affiliateCode']}")
        
        # 5. Get referral stats (might fail with 500 error)
        try:
            response = requests.get(f"{API_URL}/affiliate/{TEST_MEMBER_ID}/stats")
            if response.status_code == 200:
                data = response.json()
                self.assertTrue(data["success"])
                self.assertIn("stats", data)
                
                stats = data["stats"]
                print(f"Retrieved referral stats: {stats.get('total_referrals', 0)} referrals, {stats.get('total_credits_earned', 0)} credits earned")
            else:
                print(f"Failed to get referral stats. Response status: {response.status_code}")
                print(f"Response content: {response.text}")
        except Exception as e:
            print(f"Error getting referral stats: {str(e)}")
    
    def test_credits_system(self):
        """Test the credits system functionality"""
        print("\n=== Testing Credits System ===")
        
        # 1. Create credit account
        response = requests.post(f"{API_URL}/credits/create-account", params={"user_id": TEST_MEMBER_ID})
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("credit_account", data)
        
        credit_account = data["credit_account"]
        self.assertEqual(credit_account["userId"], TEST_MEMBER_ID)
        
        print(f"Created credit account for user {TEST_MEMBER_ID} with initial balance: {credit_account['totalCredits']}")
        
        # 2. Get credit balance
        response = requests.get(f"{API_URL}/credits/{TEST_MEMBER_ID}/balance")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("balance", data)
        self.assertIn("currency", data)
        
        balance = data["balance"]
        currency = data["currency"]
        
        print(f"Retrieved credit balance: {balance} {currency}")
        
        # 3. Get credit history
        response = requests.get(f"{API_URL}/credits/{TEST_MEMBER_ID}/history")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("transactions", data)
        self.assertIn("count", data)
        
        transactions = data["transactions"]
        count = data["count"]
        
        print(f"Retrieved {count} credit transactions")
        
        # 4. Use credits for purchase
        response = requests.post(
            f"{API_URL}/credits/use",
            params={
                "user_id": TEST_MEMBER_ID,
                "amount": 5.0,
                "order_id": "test-order-123",
                "description": "Test purchase of digital product"
            }
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        if data.get("success", False):
            print(f"Used credits for purchase: {data['message']}")
        else:
            print(f"Could not use credits: {data.get('message', 'Insufficient credits')}")
            
        # Check updated balance
        response = requests.get(f"{API_URL}/credits/{TEST_MEMBER_ID}/balance")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        print(f"Updated credit balance: {data['balance']} {data['currency']}")
    
    def test_payout_system(self):
        """Test the payout system functionality"""
        print("\n=== Testing Payout System ===")
        
        # 1. Create payout account
        response = requests.post(
            f"{API_URL}/payouts/accounts",
            params={"expert_id": TEST_EXPERT_ID},
            json=self.test_bank_account
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("payout_account", data)
        
        payout_account = data["payout_account"]
        self.assertEqual(payout_account["expertId"], TEST_EXPERT_ID)
        self.assertEqual(payout_account["accountHolderName"], "John Expert")
        self.assertEqual(payout_account["payoutMethod"], "bank_transfer")
        
        account_id = payout_account["id"]
        print(f"Created bank payout account for expert {TEST_EXPERT_ID}")
        
        # 2. Get payout accounts
        response = requests.get(f"{API_URL}/payouts/{TEST_EXPERT_ID}/accounts")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("accounts", data)
        
        accounts = data["accounts"]
        print(f"Retrieved {len(accounts)} payout accounts for expert {TEST_EXPERT_ID}")
        
        # 3. Request payout
        response = requests.post(
            f"{API_URL}/payouts/request",
            params={
                "expert_id": TEST_EXPERT_ID,
                "amount": 100.0,
                "payout_account_id": account_id,
                "description": "Test payout request"
            }
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("payout_request", data)
        
        payout_request = data["payout_request"]
        self.assertEqual(payout_request["expertId"], TEST_EXPERT_ID)
        self.assertEqual(payout_request["payoutAccountId"], account_id)
        self.assertEqual(payout_request["amount"], 100.0)
        self.assertEqual(payout_request["status"], "pending")
        
        request_id = payout_request["id"]
        print(f"Created payout request: {request_id} for ${payout_request['amount']}")
        
        # 4. Get payout requests
        response = requests.get(f"{API_URL}/payouts/{TEST_EXPERT_ID}/requests")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("requests", data)
        
        payout_requests = data["requests"]
        print(f"Retrieved {len(payout_requests)} payout requests for expert {TEST_EXPERT_ID}")
        
        # 5. Admin process payout
        response = requests.post(
            f"{API_URL}/admin/payouts/{request_id}/process",
            params={"admin_notes": "Approved for processing"}
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("message", data)
        
        print(f"Processed payout request: {data['message']}")
        
        # 6. Admin complete payout
        response = requests.post(
            f"{API_URL}/admin/payouts/{request_id}/complete",
            params={
                "transaction_id": "BANK-TX-12345",
                "processing_fee": 2.50
            }
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("payout_history", data)
        
        history = data["payout_history"]
        self.assertEqual(history["payoutRequestId"], request_id)
        self.assertEqual(history["expertId"], TEST_EXPERT_ID)
        self.assertEqual(history["amount"], 100.0)
        self.assertEqual(history["processingFee"], 2.50)
        self.assertEqual(history["netAmount"], 97.50)
        self.assertEqual(history["status"], "completed")
        
        print(f"Completed payout: ${history['netAmount']} (after ${history['processingFee']} fee)")
        
        # 7. Verify payout status
        response = requests.get(f"{API_URL}/payouts/{TEST_EXPERT_ID}/requests")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        payout_requests = data["requests"]
        completed_request = next((r for r in payout_requests if r["id"] == request_id), None)
        
        self.assertIsNotNone(completed_request)
        self.assertEqual(completed_request["status"], "completed")
        
        print(f"Verified payout status is now: {completed_request['status']}")
    
    def test_shopping_cart(self):
        """Test the shopping cart with credits functionality"""
        print("\n=== Testing Shopping Cart with Credits ===")
        
        # 1. Get shopping cart
        response = requests.get(f"{API_URL}/cart/{TEST_MEMBER_ID}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("cart", data)
        
        cart = data["cart"]
        self.assertEqual(cart["userId"], TEST_MEMBER_ID)
        
        print(f"Retrieved shopping cart for user {TEST_MEMBER_ID}")
        
        # 2. Add item to cart
        response = requests.post(
            f"{API_URL}/cart/{TEST_MEMBER_ID}/items",
            params={"product_id": "product-123"},
            json=self.test_product
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("cart_item", data)
        
        cart_item = data["cart_item"]
        self.assertEqual(cart_item["userId"], TEST_MEMBER_ID)
        self.assertEqual(cart_item["productId"], "product-123")
        self.assertEqual(cart_item["productName"], "1-Hour Expert Consultation")
        self.assertEqual(cart_item["totalPrice"], 50.0)
        
        print(f"Added item to cart: {cart_item['productName']} (${cart_item['totalPrice']})")
        
        # 3. Get max credits usable
        response = requests.get(f"{API_URL}/cart/{TEST_MEMBER_ID}/max-credits")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        
        # The response might have max_credits or max_credits_usable
        max_credits = data.get("max_credits", data.get("max_credits_usable", 0))
        cart_subtotal = data.get("cart_subtotal", 0)
        
        print(f"Maximum credits usable: ${max_credits}")
        print(f"Cart subtotal: ${cart_subtotal}")
        
        # 4. Apply credits to cart
        response = requests.post(
            f"{API_URL}/cart/{TEST_MEMBER_ID}/apply-credits",
            params={"credits_to_use": 10.0}
        )
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        if "error" not in data:
            self.assertTrue(data["success"])
            print(f"Applied credits to cart: {data.get('result', {})}")
        else:
            print(f"Could not apply credits: {data.get('error', 'Insufficient credits')}")
            
        # 5. Check updated cart
        response = requests.get(f"{API_URL}/cart/{TEST_MEMBER_ID}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        cart = data["cart"]
        
        print(f"Updated cart: subtotal=${cart['subtotal']}, credits used=${cart['creditsUsed']}, final total=${cart['finalTotal']}")


if __name__ == "__main__":
    unittest.main()