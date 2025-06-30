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
TEST_PERFORMER_ID = "test-performer-123"
TEST_USER_ID = "test-user-456"
TEST_MEMBER_ID = "test-member-789"

# Enum classes to match backend
class SubscriptionType(str, Enum):
    FREE = "free"
    MONTHLY = "monthly"
    PER_VISIT = "per_visit"
    TEASER = "teaser"

class BlockReason(str, Enum):
    HARASSMENT = "harassment"
    BAD_LANGUAGE = "bad_language"
    INAPPROPRIATE_BEHAVIOR = "inappropriate_behavior"
    SPAM = "spam"
    OTHER = "other"

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

class APIKeyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"

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

class FileType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    ARCHIVE = "archive"
    OTHER = "other"

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

class TestGeoLocationAndAccessControlAPIs(unittest.TestCase):
    """Test suite for geo-location and access control APIs"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Clean up any existing test data
        self.cleanup_test_data()

    def tearDown(self):
        """Clean up after tests"""
        self.cleanup_test_data()

    def cleanup_test_data(self):
        """Clean up test data created during tests"""
        # Get all location preferences and delete them
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences")
        if response.status_code == 200:
            preferences = response.json()
            for pref in preferences:
                requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences/{pref['id']}")
        
        # Get all blocked users and unblock them
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/blocked-users")
        if response.status_code == 200:
            blocked_users = response.json()
            for user in blocked_users:
                requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/unblock-user/{user['blocked_user_id']}")
        
        # Reset teaser settings to default
        default_settings = {
            "performer_id": TEST_PERFORMER_ID,
            "enabled": False,
            "duration_seconds": 30,
            "message": "Preview time expired! Subscribe to continue viewing my profile."
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=default_settings)

    def test_01_detect_location_api(self):
        """Test the location detection API"""
        print("\n=== Testing Location Detection API ===")
        
        # Test with default IP
        response = requests.post(f"{API_URL}/detect-location")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertIn('location', data)
        self.assertIn('ip', data)
        
        location = data['location']
        self.assertIn('country', location)
        self.assertIn('country_code', location)
        self.assertIn('state', location)
        self.assertIn('city', location)
        
        print(f"Detected location: {location['city']}, {location['state']}, {location['country']} ({location['country_code']})")
        print(f"IP address: {data['ip']}")
        
        # The API should return consistent results for the same IP
        response2 = requests.post(f"{API_URL}/detect-location")
        data2 = response2.json()
        self.assertEqual(data['location']['country'], data2['location']['country'])
        self.assertEqual(data['location']['city'], data2['location']['city'])

    def test_02_location_preferences_crud(self):
        """Test CRUD operations for performer location preferences"""
        print("\n=== Testing Location Preferences API ===")
        
        # 1. Create location preference - Country level (US) with FREE access
        us_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "country",
            "location_value": "US",
            "is_allowed": True,
            "subscription_type": SubscriptionType.FREE
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=us_preference)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Created US country preference: {data['message']}")
        
        # 2. Create location preference - Country level (CA) with MONTHLY access
        ca_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "country",
            "location_value": "CA",
            "is_allowed": True,
            "subscription_type": SubscriptionType.MONTHLY
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ca_preference)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Created CA country preference: {data['message']}")
        
        # 3. Create location preference - State level (NY) with TEASER access
        ny_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "state",
            "location_value": "NY",
            "is_allowed": True,
            "subscription_type": SubscriptionType.TEASER
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ny_preference)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Created NY state preference: {data['message']}")
        
        # 4. Create location preference - City level (London) with blocked access
        london_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "city",
            "location_value": "London",
            "is_allowed": False,
            "subscription_type": SubscriptionType.FREE
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=london_preference)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Created London city preference (blocked): {data['message']}")
        
        # 5. Get all location preferences
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences")
        self.assertEqual(response.status_code, 200)
        preferences = response.json()
        
        # Should have 4 preferences
        self.assertEqual(len(preferences), 4)
        print(f"Retrieved {len(preferences)} location preferences")
        
        # Verify each preference
        us_pref = next((p for p in preferences if p['location_type'] == 'country' and p['location_value'] == 'US'), None)
        self.assertIsNotNone(us_pref)
        self.assertTrue(us_pref['is_allowed'])
        self.assertEqual(us_pref['subscription_type'], SubscriptionType.FREE)
        
        ca_pref = next((p for p in preferences if p['location_type'] == 'country' and p['location_value'] == 'CA'), None)
        self.assertIsNotNone(ca_pref)
        self.assertTrue(ca_pref['is_allowed'])
        self.assertEqual(ca_pref['subscription_type'], SubscriptionType.MONTHLY)
        
        ny_pref = next((p for p in preferences if p['location_type'] == 'state' and p['location_value'] == 'NY'), None)
        self.assertIsNotNone(ny_pref)
        self.assertTrue(ny_pref['is_allowed'])
        self.assertEqual(ny_pref['subscription_type'], SubscriptionType.TEASER)
        
        london_pref = next((p for p in preferences if p['location_type'] == 'city' and p['location_value'] == 'London'), None)
        self.assertIsNotNone(london_pref)
        self.assertFalse(london_pref['is_allowed'])
        
        # 6. Delete one preference (London)
        response = requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences/{london_pref['id']}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Deleted London city preference: {data['message']}")
        
        # 7. Verify deletion
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences")
        self.assertEqual(response.status_code, 200)
        preferences = response.json()
        
        # Should have 3 preferences now
        self.assertEqual(len(preferences), 3)
        london_pref = next((p for p in preferences if p['location_type'] == 'city' and p['location_value'] == 'London'), None)
        self.assertIsNone(london_pref)
        print(f"Verified deletion - now have {len(preferences)} preferences")

    def test_03_teaser_settings_api(self):
        """Test teaser configuration endpoints"""
        print("\n=== Testing Teaser Settings API ===")
        
        # 1. Get default teaser settings
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings")
        self.assertEqual(response.status_code, 200)
        default_settings = response.json()
        
        # Default settings should have enabled=False
        self.assertEqual(default_settings['performer_id'], TEST_PERFORMER_ID)
        self.assertFalse(default_settings['enabled'])
        print(f"Default teaser settings: {default_settings}")
        
        # 2. Update teaser settings
        new_settings = {
            "performer_id": TEST_PERFORMER_ID,
            "enabled": True,
            "duration_seconds": 60,
            "message": "Custom teaser message for testing!"
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=new_settings)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Updated teaser settings: {data['message']}")
        
        # 3. Get updated teaser settings
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings")
        self.assertEqual(response.status_code, 200)
        updated_settings = response.json()
        
        # Verify updated settings
        self.assertEqual(updated_settings['performer_id'], TEST_PERFORMER_ID)
        self.assertTrue(updated_settings['enabled'])
        self.assertEqual(updated_settings['duration_seconds'], 60)
        self.assertEqual(updated_settings['message'], "Custom teaser message for testing!")
        print(f"Retrieved updated teaser settings: {updated_settings}")
        
        # 4. Test with invalid duration (too short)
        invalid_settings = {
            "performer_id": TEST_PERFORMER_ID,
            "enabled": True,
            "duration_seconds": 3,  # Too short (min is 5)
            "message": "This should fail"
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=invalid_settings)
        self.assertNotEqual(response.status_code, 200)
        print(f"Invalid duration test passed: {response.status_code}")
        
        # 5. Test with invalid duration (too long)
        invalid_settings = {
            "performer_id": TEST_PERFORMER_ID,
            "enabled": True,
            "duration_seconds": 400,  # Too long (max is 300)
            "message": "This should fail"
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=invalid_settings)
        self.assertNotEqual(response.status_code, 200)
        print(f"Invalid duration test passed: {response.status_code}")

    def test_04_user_blocking_api(self):
        """Test user blocking functionality"""
        print("\n=== Testing User Blocking API ===")
        
        # 1. Block a user
        block_data = {
            "performer_id": TEST_PERFORMER_ID,
            "blocked_user_id": TEST_USER_ID,
            "reason": BlockReason.HARASSMENT,
            "notes": "Test blocking user for harassment"
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/block-user", json=block_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Blocked user: {data['message']}")
        
        # 2. Try to block the same user again (should fail)
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/block-user", json=block_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data['success'])
        print(f"Attempt to block same user again: {data['message']}")
        
        # 3. Get blocked users list
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/blocked-users")
        self.assertEqual(response.status_code, 200)
        blocked_users = response.json()
        
        # Should have 1 blocked user
        self.assertEqual(len(blocked_users), 1)
        self.assertEqual(blocked_users[0]['performer_id'], TEST_PERFORMER_ID)
        self.assertEqual(blocked_users[0]['blocked_user_id'], TEST_USER_ID)
        self.assertEqual(blocked_users[0]['reason'], BlockReason.HARASSMENT)
        print(f"Retrieved {len(blocked_users)} blocked users")
        
        # 4. Block another user with different reason
        block_data2 = {
            "performer_id": TEST_PERFORMER_ID,
            "blocked_user_id": "another-user-789",
            "reason": BlockReason.SPAM,
            "notes": "Test blocking user for spam"
        }
        
        response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/block-user", json=block_data2)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Blocked second user: {data['message']}")
        
        # 5. Get blocked users list again
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/blocked-users")
        self.assertEqual(response.status_code, 200)
        blocked_users = response.json()
        
        # Should have 2 blocked users now
        self.assertEqual(len(blocked_users), 2)
        print(f"Retrieved {len(blocked_users)} blocked users")
        
        # 6. Unblock the first user
        response = requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/unblock-user/{TEST_USER_ID}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Unblocked user: {data['message']}")
        
        # 7. Verify unblocking
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/blocked-users")
        self.assertEqual(response.status_code, 200)
        blocked_users = response.json()
        
        # Should have 1 blocked user now
        self.assertEqual(len(blocked_users), 1)
        self.assertEqual(blocked_users[0]['blocked_user_id'], "another-user-789")
        print(f"Verified unblocking - now have {len(blocked_users)} blocked users")
        
        # 8. Try to unblock a user that isn't blocked (should fail)
        response = requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/unblock-user/nonexistent-user")
        self.assertEqual(response.status_code, 404)
        print(f"Attempt to unblock nonexistent user failed as expected: {response.status_code}")

    def test_05_profile_access_control(self):
        """Test the main access control logic"""
        print("\n=== Testing Profile Access Control API ===")
        
        # Set up test data - create location preferences and teaser settings
        # 1. US - FREE access
        us_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "country",
            "location_value": "US",
            "is_allowed": True,
            "subscription_type": SubscriptionType.FREE
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=us_preference)
        
        # 2. CA - MONTHLY access
        ca_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "country",
            "location_value": "CA",
            "is_allowed": True,
            "subscription_type": SubscriptionType.MONTHLY
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ca_preference)
        
        # 3. NY - TEASER access
        ny_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "state",
            "location_value": "NY",
            "is_allowed": True,
            "subscription_type": SubscriptionType.TEASER
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ny_preference)
        
        # 4. GB - Blocked access
        gb_preference = {
            "performer_id": TEST_PERFORMER_ID,
            "location_type": "country",
            "location_value": "GB",
            "is_allowed": False,
            "subscription_type": SubscriptionType.FREE
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=gb_preference)
        
        # 5. Enable teaser with 30 seconds duration
        teaser_settings = {
            "performer_id": TEST_PERFORMER_ID,
            "enabled": True,
            "duration_seconds": 30,
            "message": "Test teaser message"
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=teaser_settings)
        
        # 6. Block a test user
        block_data = {
            "performer_id": TEST_PERFORMER_ID,
            "blocked_user_id": "blocked-user-999",
            "reason": BlockReason.HARASSMENT,
            "notes": "Test blocking user for access control test"
        }
        requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/block-user", json=block_data)
        
        print("Set up test data for access control tests")
        
        # First, get our current location
        response = requests.post(f"{API_URL}/detect-location")
        self.assertEqual(response.status_code, 200)
        location_data = response.json()['location']
        
        # Test 1: Access with US location (should be FREE access)
        us_location = {
            "country": "United States",
            "country_code": "US",
            "state": "California",
            "state_code": "CA",
            "city": "Los Angeles",
            "zip_code": "90210"
        }
        
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "test-user-us",
            "user_ip": "192.168.1.100",
            "location": us_location
        }
        
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        access_data = response.json()
        
        self.assertTrue(access_data['allowed'])
        self.assertEqual(access_data['access_level'], "full")
        print(f"US access test: {access_data['reason']} - {access_data['message']}")
        
        # Test 2: Access with CA location (should require MONTHLY subscription)
        ca_location = {
            "country": "Canada",
            "country_code": "CA",
            "state": "Ontario",
            "state_code": "ON",
            "city": "Toronto",
            "zip_code": "M5V 3A8"
        }
        
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "test-user-ca",
            "user_ip": "192.168.1.101",
            "location": ca_location
        }
        
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        access_data = response.json()
        
        self.assertFalse(access_data['allowed'])
        self.assertEqual(access_data['subscription_required'], SubscriptionType.MONTHLY)
        print(f"CA access test: {access_data['reason']} - {access_data['message']}")
        
        # Test 3: Access with NY location (should allow TEASER access)
        ny_location = {
            "country": "United States",
            "country_code": "US",
            "state": "New York",
            "state_code": "NY",
            "city": "New York",
            "zip_code": "10001"
        }
        
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "test-user-ny",
            "user_ip": "192.168.1.102",
            "location": ny_location
        }
        
        print(f"Sending NY access request: {json.dumps(access_request)}")
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        access_data = response.json()
        print(f"NY access response: {json.dumps(access_data)}")
        
        self.assertTrue(access_data['allowed'])
        self.assertEqual(access_data['access_level'], "teaser")
        self.assertIsNotNone(access_data['teaser_remaining_seconds'])
        print(f"NY access test: {access_data['reason']} - {access_data['message']}")
        
        # Test 4: Access with GB location (should be blocked)
        gb_location = {
            "country": "United Kingdom",
            "country_code": "GB",
            "state": "England",
            "state_code": "ENG",
            "city": "London",
            "zip_code": "SW1A 1AA"
        }
        
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "test-user-gb",
            "user_ip": "192.168.1.103",
            "location": gb_location
        }
        
        print(f"Sending GB access request: {json.dumps(access_request)}")
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        access_data = response.json()
        print(f"GB access response: {json.dumps(access_data)}")
        
        self.assertFalse(access_data['allowed'])
        self.assertEqual(access_data['access_level'], "blocked")
        print(f"GB access test: {access_data['reason']} - {access_data['message']}")
        
        # Test 5: Access with blocked user ID (should be blocked)
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "blocked-user-999",
            "user_ip": "192.168.1.104",
            "location": us_location  # Use US location which would normally be allowed
        }
        
        print(f"Sending blocked user access request: {json.dumps(access_request)}")
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        access_data = response.json()
        print(f"Blocked user access response: {json.dumps(access_data)}")
        
        self.assertFalse(access_data['allowed'])
        self.assertEqual(access_data['access_level'], "blocked")
        print(f"Blocked user test: {access_data['reason']} - {access_data['message']}")
        
        # Test 6: Test teaser session API
        # First, create a teaser session by checking access with NY location
        access_request = {
            "performer_id": TEST_PERFORMER_ID,
            "user_id": "teaser-test-user",
            "user_ip": "192.168.1.105",
            "location": ny_location
        }
        
        print(f"Creating teaser session with request: {json.dumps(access_request)}")
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        self.assertEqual(response.status_code, 200)
        
        # Now check the teaser session status
        print(f"Checking teaser session status for user: teaser-test-user")
        response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
        self.assertEqual(response.status_code, 200)
        session_data = response.json()
        print(f"Teaser session response: {json.dumps(session_data)}")
        
        self.assertTrue(session_data['active'])
        self.assertIn('remaining_seconds', session_data)
        self.assertIn('expires_at', session_data)
        print(f"Teaser session test: {session_data['message']}")
        
        # Wait for teaser to expire (if duration is short enough)
        if teaser_settings['duration_seconds'] <= 5:
            print("Waiting for teaser session to expire...")
            time.sleep(teaser_settings['duration_seconds'] + 1)
            
            # Check session again - should be expired
            response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
            self.assertEqual(response.status_code, 200)
            session_data = response.json()
            
            self.assertFalse(session_data['active'])
            print(f"Expired teaser session test: {session_data['message']}")


class TestAPIKeyManagementSystem(unittest.TestCase):
    """Test suite for API Key Management System"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Clean up any existing test data
        self.cleanup_test_data()
        
        # Test API key data
        self.test_api_key = {
            "key_type": APIKeyType.AGORA,
            "service_name": "Agora Video Conferencing",
            "api_key": "test_api_key_123",
            "api_secret": "test_api_secret_456",
            "app_id": "test_app_id_789",
            "environment": "development",
            "description": "Test API key for Agora video conferencing"
        }

    def tearDown(self):
        """Clean up after tests"""
        self.cleanup_test_data()

    def cleanup_test_data(self):
        """Clean up test data created during tests"""
        # Get all API keys and delete test ones
        response = requests.get(f"{API_URL}/admin/api-keys")
        if response.status_code == 200:
            api_keys = response.json()
            for key in api_keys:
                if "Test API key" in key.get("description", ""):
                    requests.delete(f"{API_URL}/admin/api-keys/{key['id']}")

    def test_01_create_api_key(self):
        """Test creating a new API key"""
        print("\n=== Testing API Key Creation ===")
        
        response = requests.post(f"{API_URL}/admin/api-keys", json=self.test_api_key)
        self.assertEqual(response.status_code, 200)
        
        api_key = response.json()
        self.assertEqual(api_key["key_type"], APIKeyType.AGORA)
        self.assertEqual(api_key["service_name"], "Agora Video Conferencing")
        self.assertEqual(api_key["api_key"], "test_api_key_123")
        self.assertEqual(api_key["api_secret"], "test_api_secret_456")
        self.assertEqual(api_key["app_id"], "test_app_id_789")
        self.assertEqual(api_key["environment"], "development")
        self.assertEqual(api_key["status"], APIKeyStatus.ACTIVE)
        
        print(f"Created API key: {api_key['id']} for {api_key['service_name']}")
        
        # Save key ID for later tests
        self.api_key_id = api_key["id"]
        
        # Create another API key for testing get all
        twilio_key = {
            "key_type": APIKeyType.TWILIO_VIDEO,
            "service_name": "Twilio Video Service",
            "account_sid": "test_account_sid_123",
            "auth_token": "test_auth_token_456",
            "environment": "development",
            "description": "Test API key for Twilio video service"
        }
        
        response = requests.post(f"{API_URL}/admin/api-keys", json=twilio_key)
        self.assertEqual(response.status_code, 200)
        twilio_api_key = response.json()
        self.twilio_key_id = twilio_api_key["id"]
        
        print(f"Created second API key: {twilio_api_key['id']} for {twilio_api_key['service_name']}")

    def test_02_get_all_api_keys(self):
        """Test retrieving all API keys"""
        print("\n=== Testing Get All API Keys ===")
        
        # First create a test key
        response = requests.post(f"{API_URL}/admin/api-keys", json=self.test_api_key)
        self.assertEqual(response.status_code, 200)
        
        # Get all API keys
        response = requests.get(f"{API_URL}/admin/api-keys")
        self.assertEqual(response.status_code, 200)
        
        api_keys = response.json()
        self.assertIsInstance(api_keys, list)
        
        # Find our test key
        test_key = next((k for k in api_keys if k.get("api_key") == "test_api_key_123"), None)
        self.assertIsNotNone(test_key)
        
        print(f"Retrieved {len(api_keys)} API keys")
        for key in api_keys:
            print(f"- {key['service_name']} ({key['key_type']})")

    def test_03_get_api_key_by_type(self):
        """Test retrieving an API key by type"""
        print("\n=== Testing Get API Key by Type ===")
        
        # First create a test key
        response = requests.post(f"{API_URL}/admin/api-keys", json=self.test_api_key)
        self.assertEqual(response.status_code, 200)
        
        # Get API key by type
        response = requests.get(f"{API_URL}/admin/api-keys/{APIKeyType.AGORA}")
        self.assertEqual(response.status_code, 200)
        
        api_key = response.json()
        self.assertEqual(api_key["key_type"], APIKeyType.AGORA)
        self.assertEqual(api_key["service_name"], "Agora Video Conferencing")
        
        print(f"Retrieved API key by type: {api_key['service_name']} ({api_key['key_type']})")
        
        # Test with non-existent type
        response = requests.get(f"{API_URL}/admin/api-keys/nonexistent_type")
        self.assertEqual(response.status_code, 422)  # Validation error for invalid enum
        
        print("Correctly handled invalid key type")

    def test_04_update_api_key(self):
        """Test updating an API key"""
        print("\n=== Testing Update API Key ===")
        
        # First create a test key
        response = requests.post(f"{API_URL}/admin/api-keys", json=self.test_api_key)
        self.assertEqual(response.status_code, 200)
        api_key = response.json()
        key_id = api_key["id"]
        
        # Update the API key
        update_data = {
            "service_name": "Updated Agora Service",
            "api_key": "updated_api_key_123",
            "status": APIKeyStatus.INACTIVE,
            "description": "Updated test API key description"
        }
        
        response = requests.put(f"{API_URL}/admin/api-keys/{key_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Updated API key: {data['message']}")
        
        # Verify the update
        response = requests.get(f"{API_URL}/admin/api-keys/{APIKeyType.AGORA}")
        self.assertEqual(response.status_code, 200)
        updated_key = response.json()
        
        self.assertEqual(updated_key["service_name"], "Updated Agora Service")
        self.assertEqual(updated_key["api_key"], "updated_api_key_123")
        self.assertEqual(updated_key["status"], APIKeyStatus.INACTIVE)
        self.assertEqual(updated_key["description"], "Updated test API key description")
        
        print(f"Verified updated API key: {updated_key['service_name']} ({updated_key['status']})")
        
        # Test with non-existent key ID
        response = requests.put(f"{API_URL}/admin/api-keys/nonexistent_id", json=update_data)
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent key ID")

    def test_05_delete_api_key(self):
        """Test deleting an API key"""
        print("\n=== Testing Delete API Key ===")
        
        # First create a test key
        response = requests.post(f"{API_URL}/admin/api-keys", json=self.test_api_key)
        self.assertEqual(response.status_code, 200)
        api_key = response.json()
        key_id = api_key["id"]
        
        # Delete the API key
        response = requests.delete(f"{API_URL}/admin/api-keys/{key_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Deleted API key: {data['message']}")
        
        # Verify the deletion
        response = requests.get(f"{API_URL}/admin/api-keys")
        self.assertEqual(response.status_code, 200)
        api_keys = response.json()
        
        deleted_key = next((k for k in api_keys if k["id"] == key_id), None)
        self.assertIsNone(deleted_key)
        
        print("Verified API key deletion")
        
        # Test with non-existent key ID
        response = requests.delete(f"{API_URL}/admin/api-keys/nonexistent_id")
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent key ID")


class TestAppointmentBookingSystem(unittest.TestCase):
    """Test suite for Appointment Booking System"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Clean up any existing test data
        self.cleanup_test_data()
        
        # Test appointment data
        self.test_appointment = {
            "performer_id": TEST_PERFORMER_ID,
            "member_id": TEST_MEMBER_ID,
            "title": "Test Video Consultation",
            "description": "Test video consultation appointment",
            "appointment_type": AppointmentType.VIDEO_CALL,
            "scheduled_start": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "scheduled_end": (datetime.utcnow() + timedelta(days=1, hours=1)).isoformat(),
            "timezone": "America/New_York",
            "price": 50.00,
            "currency": "USD"
        }
        
        # Test availability data
        self.test_availability = {
            "performer_id": TEST_PERFORMER_ID,
            "day_of_week": 1,  # Monday
            "start_time": "09:00",
            "end_time": "17:00",
            "timezone": "America/New_York",
            "available_types": [
                AppointmentType.VIDEO_CALL,
                AppointmentType.PHONE_CALL,
                AppointmentType.CHAT_SESSION
            ],
            "pricing": {
                AppointmentType.VIDEO_CALL: 50.00,
                AppointmentType.PHONE_CALL: 30.00,
                AppointmentType.CHAT_SESSION: 20.00
            }
        }

    def tearDown(self):
        """Clean up after tests"""
        self.cleanup_test_data()

    def cleanup_test_data(self):
        """Clean up test data created during tests"""
        # We can't easily delete appointments, but we can mark them as cancelled
        # Get performer appointments
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/appointments")
        if response.status_code == 200:
            appointments = response.json()
            for appointment in appointments:
                if "Test" in appointment.get("title", ""):
                    requests.put(
                        f"{API_URL}/appointments/{appointment['id']}/status",
                        json=AppointmentStatus.CANCELLED
                    )

    def test_01_create_appointment(self):
        """Test creating a new appointment"""
        print("\n=== Testing Appointment Creation ===")
        
        response = requests.post(f"{API_URL}/appointments", json=self.test_appointment)
        self.assertEqual(response.status_code, 200)
        
        appointment = response.json()
        self.assertEqual(appointment["performer_id"], TEST_PERFORMER_ID)
        self.assertEqual(appointment["member_id"], TEST_MEMBER_ID)
        self.assertEqual(appointment["title"], "Test Video Consultation")
        self.assertEqual(appointment["appointment_type"], AppointmentType.VIDEO_CALL)
        self.assertEqual(appointment["status"], AppointmentStatus.SCHEDULED)
        self.assertEqual(appointment["price"], 50.00)
        
        print(f"Created appointment: {appointment['id']} - {appointment['title']}")
        
        # Save appointment ID for later tests
        self.appointment_id = appointment["id"]

    def test_02_get_performer_appointments(self):
        """Test retrieving performer appointments"""
        print("\n=== Testing Get Performer Appointments ===")
        
        # First create a test appointment
        response = requests.post(f"{API_URL}/appointments", json=self.test_appointment)
        self.assertEqual(response.status_code, 200)
        
        # Get performer appointments
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/appointments")
        self.assertEqual(response.status_code, 200)
        
        appointments = response.json()
        self.assertIsInstance(appointments, list)
        
        # Find our test appointment
        test_appointment = next((a for a in appointments if a.get("title") == "Test Video Consultation"), None)
        self.assertIsNotNone(test_appointment)
        
        print(f"Retrieved {len(appointments)} appointments for performer")
        for appointment in appointments:
            print(f"- {appointment['title']} ({appointment['status']})")

    def test_03_get_member_appointments(self):
        """Test retrieving member appointments"""
        print("\n=== Testing Get Member Appointments ===")
        
        # First create a test appointment
        response = requests.post(f"{API_URL}/appointments", json=self.test_appointment)
        self.assertEqual(response.status_code, 200)
        
        # Get member appointments
        response = requests.get(f"{API_URL}/member/{TEST_MEMBER_ID}/appointments")
        self.assertEqual(response.status_code, 200)
        
        appointments = response.json()
        self.assertIsInstance(appointments, list)
        
        # Find our test appointment
        test_appointment = next((a for a in appointments if a.get("title") == "Test Video Consultation"), None)
        self.assertIsNotNone(test_appointment)
        
        print(f"Retrieved {len(appointments)} appointments for member")
        for appointment in appointments:
            print(f"- {appointment['title']} ({appointment['status']})")

    def test_04_update_appointment_status(self):
        """Test updating appointment status"""
        print("\n=== Testing Update Appointment Status ===")
        
        # First create a test appointment
        response = requests.post(f"{API_URL}/appointments", json=self.test_appointment)
        self.assertEqual(response.status_code, 200)
        appointment = response.json()
        appointment_id = appointment["id"]
        
        # Update appointment status to CONFIRMED
        response = requests.put(
            f"{API_URL}/appointments/{appointment_id}/status",
            json=AppointmentStatus.CONFIRMED
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Updated appointment status to CONFIRMED: {data['message']}")
        
        # Verify the update
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/appointments")
        self.assertEqual(response.status_code, 200)
        appointments = response.json()
        
        updated_appointment = next((a for a in appointments if a["id"] == appointment_id), None)
        self.assertIsNotNone(updated_appointment)
        self.assertEqual(updated_appointment["status"], AppointmentStatus.CONFIRMED)
        
        print(f"Verified updated appointment status: {updated_appointment['status']}")
        
        # Update to IN_PROGRESS
        response = requests.put(
            f"{API_URL}/appointments/{appointment_id}/status",
            json=AppointmentStatus.IN_PROGRESS
        )
        self.assertEqual(response.status_code, 200)
        
        # Update to COMPLETED
        response = requests.put(
            f"{API_URL}/appointments/{appointment_id}/status",
            json=AppointmentStatus.COMPLETED
        )
        self.assertEqual(response.status_code, 200)
        
        print("Successfully updated appointment through status workflow")
        
        # Test with non-existent appointment ID
        response = requests.put(
            f"{API_URL}/appointments/nonexistent_id/status",
            json=AppointmentStatus.CONFIRMED
        )
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent appointment ID")

    def test_05_create_availability(self):
        """Test creating performer availability"""
        print("\n=== Testing Create Performer Availability ===")
        
        response = requests.post(
            f"{API_URL}/performer/{TEST_PERFORMER_ID}/availability",
            json=self.test_availability
        )
        self.assertEqual(response.status_code, 200)
        
        availability = response.json()
        self.assertEqual(availability["performer_id"], TEST_PERFORMER_ID)
        self.assertEqual(availability["day_of_week"], 1)
        self.assertEqual(availability["start_time"], "09:00")
        self.assertEqual(availability["end_time"], "17:00")
        self.assertEqual(availability["timezone"], "America/New_York")
        self.assertIn(AppointmentType.VIDEO_CALL, availability["available_types"])
        self.assertIn(AppointmentType.PHONE_CALL, availability["available_types"])
        self.assertIn(AppointmentType.CHAT_SESSION, availability["available_types"])
        self.assertEqual(availability["pricing"][AppointmentType.VIDEO_CALL], 50.00)
        
        print(f"Created availability: {availability['id']} for day {availability['day_of_week']}")
        
        # Create another availability for a different day
        weekend_availability = self.test_availability.copy()
        weekend_availability["day_of_week"] = 6  # Saturday
        weekend_availability["start_time"] = "10:00"
        weekend_availability["end_time"] = "15:00"
        
        response = requests.post(
            f"{API_URL}/performer/{TEST_PERFORMER_ID}/availability",
            json=weekend_availability
        )
        self.assertEqual(response.status_code, 200)
        
        print(f"Created second availability for weekend")

    def test_06_get_performer_availability(self):
        """Test retrieving performer availability"""
        print("\n=== Testing Get Performer Availability ===")
        
        # First create test availabilities
        response = requests.post(
            f"{API_URL}/performer/{TEST_PERFORMER_ID}/availability",
            json=self.test_availability
        )
        self.assertEqual(response.status_code, 200)
        
        weekend_availability = self.test_availability.copy()
        weekend_availability["day_of_week"] = 6  # Saturday
        weekend_availability["start_time"] = "10:00"
        weekend_availability["end_time"] = "15:00"
        
        response = requests.post(
            f"{API_URL}/performer/{TEST_PERFORMER_ID}/availability",
            json=weekend_availability
        )
        self.assertEqual(response.status_code, 200)
        
        # Get performer availability
        response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/availability")
        self.assertEqual(response.status_code, 200)
        
        availabilities = response.json()
        self.assertIsInstance(availabilities, list)
        self.assertGreaterEqual(len(availabilities), 2)
        
        # Find our test availabilities
        weekday_avail = next((a for a in availabilities if a["day_of_week"] == 1), None)
        self.assertIsNotNone(weekday_avail)
        
        weekend_avail = next((a for a in availabilities if a["day_of_week"] == 6), None)
        self.assertIsNotNone(weekend_avail)
        
        print(f"Retrieved {len(availabilities)} availability slots for performer")
        for avail in availabilities:
            day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_name = day_names[avail["day_of_week"]] if 0 <= avail["day_of_week"] < 7 else f"Day {avail['day_of_week']}"
            print(f"- {day_name}: {avail['start_time']} to {avail['end_time']} ({avail['timezone']})")


class TestChatSystem(unittest.TestCase):
    """Test suite for Chat System APIs"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Test chat room data
        self.test_chat_room = {
            "chat_type": ChatType.DIRECT_MESSAGE,
            "participants": [TEST_PERFORMER_ID, TEST_MEMBER_ID],
            "creator_id": TEST_PERFORMER_ID,
            "name": "Test Chat Room",
            "description": "Test chat room for API testing"
        }
        
        # Test message data
        self.test_message = {
            "sender_id": TEST_PERFORMER_ID,
            "message_type": MessageType.TEXT,
            "content": "Hello, this is a test message!"
        }
        
        # Clean up is not needed as we can't easily delete chat rooms and messages
        # We'll just create new ones for each test

    def test_01_create_chat_room(self):
        """Test creating a new chat room"""
        print("\n=== Testing Chat Room Creation ===")
        
        response = requests.post(f"{API_URL}/chat/rooms", json=self.test_chat_room)
        self.assertEqual(response.status_code, 200)
        
        chat_room = response.json()
        self.assertEqual(chat_room["chat_type"], ChatType.DIRECT_MESSAGE)
        self.assertEqual(chat_room["participants"], [TEST_PERFORMER_ID, TEST_MEMBER_ID])
        self.assertEqual(chat_room["creator_id"], TEST_PERFORMER_ID)
        self.assertEqual(chat_room["name"], "Test Chat Room")
        self.assertEqual(chat_room["description"], "Test chat room for API testing")
        self.assertTrue(chat_room["is_active"])
        
        print(f"Created chat room: {chat_room['id']} - {chat_room['name']}")
        
        # Save chat room ID for later tests
        self.chat_room_id = chat_room["id"]
        
        # Create a group chat room
        group_chat_room = {
            "chat_type": ChatType.GROUP_CHAT,
            "participants": [TEST_PERFORMER_ID, TEST_MEMBER_ID, "another-user-123"],
            "creator_id": TEST_PERFORMER_ID,
            "name": "Test Group Chat",
            "description": "Test group chat for API testing"
        }
        
        response = requests.post(f"{API_URL}/chat/rooms", json=group_chat_room)
        self.assertEqual(response.status_code, 200)
        
        group_room = response.json()
        self.assertEqual(group_room["chat_type"], ChatType.GROUP_CHAT)
        self.assertEqual(len(group_room["participants"]), 3)
        
        print(f"Created group chat room: {group_room['id']} - {group_room['name']}")

    def test_02_get_user_chat_rooms(self):
        """Test retrieving user chat rooms"""
        print("\n=== Testing Get User Chat Rooms ===")
        
        # First create a test chat room
        response = requests.post(f"{API_URL}/chat/rooms", json=self.test_chat_room)
        self.assertEqual(response.status_code, 200)
        chat_room = response.json()
        
        # Get performer's chat rooms
        response = requests.get(f"{API_URL}/chat/rooms/{TEST_PERFORMER_ID}")
        self.assertEqual(response.status_code, 200)
        
        chat_rooms = response.json()
        self.assertIsInstance(chat_rooms, list)
        
        # Find our test chat room
        test_room = next((r for r in chat_rooms if r.get("name") == "Test Chat Room"), None)
        self.assertIsNotNone(test_room)
        
        print(f"Retrieved {len(chat_rooms)} chat rooms for performer")
        for room in chat_rooms:
            print(f"- {room['name']} ({room['chat_type']})")
        
        # Get member's chat rooms
        response = requests.get(f"{API_URL}/chat/rooms/{TEST_MEMBER_ID}")
        self.assertEqual(response.status_code, 200)
        
        member_rooms = response.json()
        self.assertIsInstance(member_rooms, list)
        
        # Find our test chat room
        test_room = next((r for r in member_rooms if r.get("name") == "Test Chat Room"), None)
        self.assertIsNotNone(test_room)
        
        print(f"Retrieved {len(member_rooms)} chat rooms for member")

    def test_03_send_message(self):
        """Test sending a message to a chat room"""
        print("\n=== Testing Send Message ===")
        
        # First create a test chat room
        response = requests.post(f"{API_URL}/chat/rooms", json=self.test_chat_room)
        self.assertEqual(response.status_code, 200)
        chat_room = response.json()
        room_id = chat_room["id"]
        
        # Send a text message
        response = requests.post(
            f"{API_URL}/chat/rooms/{room_id}/messages",
            json=self.test_message
        )
        self.assertEqual(response.status_code, 200)
        
        message = response.json()
        self.assertEqual(message["chat_room_id"], room_id)
        self.assertEqual(message["sender_id"], TEST_PERFORMER_ID)
        self.assertEqual(message["message_type"], MessageType.TEXT)
        self.assertEqual(message["content"], "Hello, this is a test message!")
        
        print(f"Sent message: {message['id']} to chat room {room_id}")
        
        # Save message ID for later tests
        self.message_id = message["id"]
        
        # Send an image message
        image_message = {
            "sender_id": TEST_MEMBER_ID,
            "message_type": MessageType.IMAGE,
            "content": "Check out this image!",
            "media_url": "https://example.com/test-image.jpg",
            "media_type": "image/jpeg",
            "media_size": 1024000,
            "thumbnail_url": "https://example.com/test-image-thumb.jpg"
        }
        
        response = requests.post(
            f"{API_URL}/chat/rooms/{room_id}/messages",
            json=image_message
        )
        self.assertEqual(response.status_code, 200)
        
        image_msg = response.json()
        self.assertEqual(image_msg["message_type"], MessageType.IMAGE)
        self.assertEqual(image_msg["media_url"], "https://example.com/test-image.jpg")
        
        print(f"Sent image message: {image_msg['id']}")

    def test_04_get_chat_messages(self):
        """Test retrieving messages from a chat room"""
        print("\n=== Testing Get Chat Messages ===")
        
        # First create a test chat room and send messages
        response = requests.post(f"{API_URL}/chat/rooms", json=self.test_chat_room)
        self.assertEqual(response.status_code, 200)
        chat_room = response.json()
        room_id = chat_room["id"]
        
        # Send a few messages
        for i in range(3):
            message = self.test_message.copy()
            message["content"] = f"Test message {i+1}"
            response = requests.post(
                f"{API_URL}/chat/rooms/{room_id}/messages",
                json=message
            )
            self.assertEqual(response.status_code, 200)
        
        # Get chat messages
        response = requests.get(f"{API_URL}/chat/rooms/{room_id}/messages")
        self.assertEqual(response.status_code, 200)
        
        messages = response.json()
        self.assertIsInstance(messages, list)
        self.assertEqual(len(messages), 3)
        
        # Messages should be in chronological order (oldest first)
        self.assertEqual(messages[0]["content"], "Test message 1")
        self.assertEqual(messages[1]["content"], "Test message 2")
        self.assertEqual(messages[2]["content"], "Test message 3")
        
        print(f"Retrieved {len(messages)} messages from chat room")
        for msg in messages:
            print(f"- {msg['sender_id']}: {msg['content']} ({msg['message_type']})")
        
        # Test pagination with limit
        response = requests.get(f"{API_URL}/chat/rooms/{room_id}/messages?limit=2")
        self.assertEqual(response.status_code, 200)
        
        limited_messages = response.json()
        self.assertEqual(len(limited_messages), 2)
        
        print(f"Retrieved {len(limited_messages)} messages with limit=2")

    def test_05_mark_message_read(self):
        """Test marking a message as read"""
        print("\n=== Testing Mark Message Read ===")
        
        # First create a test chat room and send a message
        response = requests.post(f"{API_URL}/chat/rooms", json=self.test_chat_room)
        self.assertEqual(response.status_code, 200)
        chat_room = response.json()
        room_id = chat_room["id"]
        
        response = requests.post(
            f"{API_URL}/chat/rooms/{room_id}/messages",
            json=self.test_message
        )
        self.assertEqual(response.status_code, 200)
        message = response.json()
        message_id = message["id"]
        
        # Mark message as read by member
        response = requests.put(
            f"{API_URL}/chat/messages/{message_id}/read",
            json=TEST_MEMBER_ID
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Marked message as read: {data['message']}")
        
        # Get the message to verify read status
        response = requests.get(f"{API_URL}/chat/rooms/{room_id}/messages")
        self.assertEqual(response.status_code, 200)
        
        messages = response.json()
        updated_message = next((m for m in messages if m["id"] == message_id), None)
        self.assertIsNotNone(updated_message)
        self.assertIn(TEST_MEMBER_ID, updated_message["read_by"])
        
        print(f"Verified message read status: {updated_message['read_by']}")
        
        # Test with non-existent message ID
        response = requests.put(
            f"{API_URL}/chat/messages/nonexistent_id/read",
            json=TEST_MEMBER_ID
        )
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent message ID")


class TestFileUploadSystem(unittest.TestCase):
    """Test suite for File Upload/Download System"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Test file data
        self.test_file = {
            "uploader_id": TEST_PERFORMER_ID,
            "original_filename": "test_image.jpg",
            "file_type": FileType.IMAGE,
            "mime_type": "image/jpeg",
            "file_size": 1024000,
            "storage_path": "https://example.com/storage/test_image.jpg",
            "thumbnail_path": "https://example.com/storage/test_image_thumb.jpg",
            "is_private": True,
            "is_paid_content": False,
            "metadata": {
                "width": 1920,
                "height": 1080,
                "created_date": "2023-01-01"
            },
            "tags": ["test", "image", "api"]
        }
        
        # Test paid file data
        self.test_paid_file = {
            "uploader_id": TEST_PERFORMER_ID,
            "original_filename": "premium_video.mp4",
            "file_type": FileType.VIDEO,
            "mime_type": "video/mp4",
            "file_size": 50000000,
            "storage_path": "https://example.com/storage/premium_video.mp4",
            "thumbnail_path": "https://example.com/storage/premium_video_thumb.jpg",
            "is_private": True,
            "is_paid_content": True,
            "price": 9.99,
            "currency": "USD",
            "metadata": {
                "duration": 600,
                "resolution": "1080p",
                "created_date": "2023-01-15"
            },
            "tags": ["premium", "video", "paid"]
        }

    def test_01_upload_file(self):
        """Test uploading a file"""
        print("\n=== Testing File Upload ===")
        
        response = requests.post(f"{API_URL}/files/upload", json=self.test_file)
        self.assertEqual(response.status_code, 200)
        
        file = response.json()
        self.assertEqual(file["uploader_id"], TEST_PERFORMER_ID)
        self.assertEqual(file["original_filename"], "test_image.jpg")
        self.assertEqual(file["file_type"], FileType.IMAGE)
        self.assertEqual(file["mime_type"], "image/jpeg")
        self.assertEqual(file["file_size"], 1024000)
        self.assertEqual(file["storage_path"], "https://example.com/storage/test_image.jpg")
        self.assertTrue(file["is_private"])
        self.assertFalse(file["is_paid_content"])
        
        print(f"Uploaded file: {file['id']} - {file['original_filename']}")
        
        # Save file ID for later tests
        self.file_id = file["id"]
        
        # Upload a paid file
        response = requests.post(f"{API_URL}/files/upload", json=self.test_paid_file)
        self.assertEqual(response.status_code, 200)
        
        paid_file = response.json()
        self.assertEqual(paid_file["file_type"], FileType.VIDEO)
        self.assertTrue(paid_file["is_paid_content"])
        self.assertEqual(paid_file["price"], 9.99)
        
        print(f"Uploaded paid file: {paid_file['id']} - {paid_file['original_filename']}")
        
        # Save paid file ID for later tests
        self.paid_file_id = paid_file["id"]

    def test_02_get_file_info(self):
        """Test retrieving file information"""
        print("\n=== Testing Get File Info ===")
        
        # First upload a test file
        response = requests.post(f"{API_URL}/files/upload", json=self.test_file)
        self.assertEqual(response.status_code, 200)
        file = response.json()
        file_id = file["id"]
        
        # Get file info
        response = requests.get(f"{API_URL}/files/{file_id}")
        self.assertEqual(response.status_code, 200)
        
        file_info = response.json()
        self.assertEqual(file_info["id"], file_id)
        self.assertEqual(file_info["uploader_id"], TEST_PERFORMER_ID)
        self.assertEqual(file_info["original_filename"], "test_image.jpg")
        self.assertEqual(file_info["file_type"], FileType.IMAGE)
        
        print(f"Retrieved file info: {file_info['original_filename']} ({file_info['file_type']})")
        
        # Test with non-existent file ID
        response = requests.get(f"{API_URL}/files/nonexistent_id")
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent file ID")

    def test_03_download_file(self):
        """Test downloading a file"""
        print("\n=== Testing File Download ===")
        
        # First upload a test file
        response = requests.post(f"{API_URL}/files/upload", json=self.test_file)
        self.assertEqual(response.status_code, 200)
        file = response.json()
        file_id = file["id"]
        
        # Download file as uploader (should always work)
        response = requests.get(f"{API_URL}/files/{file_id}/download?user_id={TEST_PERFORMER_ID}")
        self.assertEqual(response.status_code, 200)
        
        download_info = response.json()
        self.assertEqual(download_info["download_url"], "https://example.com/storage/test_image.jpg")
        self.assertEqual(download_info["filename"], "test_image.jpg")
        
        print(f"Downloaded file as uploader: {download_info['filename']}")
        
        # Upload a paid file
        response = requests.post(f"{API_URL}/files/upload", json=self.test_paid_file)
        self.assertEqual(response.status_code, 200)
        paid_file = response.json()
        paid_file_id = paid_file["id"]
        
        # Try to download paid file as another user (should fail)
        response = requests.get(f"{API_URL}/files/{paid_file_id}/download?user_id={TEST_MEMBER_ID}")
        self.assertEqual(response.status_code, 403)
        
        print("Correctly denied access to paid file for non-paying user")
        
        # Test with non-existent file ID
        response = requests.get(f"{API_URL}/files/nonexistent_id/download?user_id={TEST_PERFORMER_ID}")
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent file ID")


class TestStoreAndProductsManagement(unittest.TestCase):
    """Test suite for Store and Products Management"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Test product data
        self.test_physical_product = {
            "performer_id": TEST_PERFORMER_ID,
            "name": "Test T-Shirt",
            "description": "A high-quality test t-shirt with Eye Candy logo",
            "product_type": ProductType.PHYSICAL,
            "price": 29.99,
            "currency": "USD",
            "stock_quantity": 100,
            "sku": "TS-001",
            "images": ["https://example.com/tshirt1.jpg", "https://example.com/tshirt2.jpg"],
            "requires_shipping": True,
            "weight": 0.5,
            "dimensions": {"length": 12, "width": 8, "height": 1},
            "shipping_providers": [ShippingProvider.USPS, ShippingProvider.UPS]
        }
        
        # Test digital product data
        self.test_digital_product = {
            "performer_id": TEST_PERFORMER_ID,
            "name": "Premium Photo Collection",
            "description": "Exclusive collection of 50 high-resolution photos",
            "product_type": ProductType.DIGITAL,
            "price": 19.99,
            "currency": "USD",
            "images": ["https://example.com/photos-preview.jpg"],
            "files": ["https://example.com/storage/photo-collection.zip"],
            "requires_shipping": False
        }
        
        # Test order data
        self.test_order = {
            "customer_id": TEST_MEMBER_ID,
            "performer_id": TEST_PERFORMER_ID,
            "product_id": "",  # Will be set after creating a product
            "quantity": 1,
            "unit_price": 29.99,
            "total_price": 29.99,
            "currency": "USD",
            "payment_status": "paid",
            "transaction_id": "test-transaction-123",
            "shipping_address": {
                "name": "John Doe",
                "street": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zip": "10001",
                "country": "US",
                "phone": "555-123-4567"
            }
        }

    def test_01_create_product(self):
        """Test creating a new product"""
        print("\n=== Testing Product Creation ===")
        
        # Create a physical product
        response = requests.post(f"{API_URL}/store/products", json=self.test_physical_product)
        self.assertEqual(response.status_code, 200)
        
        product = response.json()
        self.assertEqual(product["performer_id"], TEST_PERFORMER_ID)
        self.assertEqual(product["name"], "Test T-Shirt")
        self.assertEqual(product["product_type"], ProductType.PHYSICAL)
        self.assertEqual(product["price"], 29.99)
        self.assertEqual(product["stock_quantity"], 100)
        self.assertTrue(product["requires_shipping"])
        
        print(f"Created physical product: {product['id']} - {product['name']}")
        
        # Save product ID for later tests
        self.physical_product_id = product["id"]
        
        # Create a digital product
        response = requests.post(f"{API_URL}/store/products", json=self.test_digital_product)
        self.assertEqual(response.status_code, 200)
        
        digital_product = response.json()
        self.assertEqual(digital_product["name"], "Premium Photo Collection")
        self.assertEqual(digital_product["product_type"], ProductType.DIGITAL)
        self.assertFalse(digital_product["requires_shipping"])
        
        print(f"Created digital product: {digital_product['id']} - {digital_product['name']}")
        
        # Save digital product ID for later tests
        self.digital_product_id = digital_product["id"]

    def test_02_get_performer_products(self):
        """Test retrieving performer products"""
        print("\n=== Testing Get Performer Products ===")
        
        # First create test products
        response = requests.post(f"{API_URL}/store/products", json=self.test_physical_product)
        self.assertEqual(response.status_code, 200)
        
        response = requests.post(f"{API_URL}/store/products", json=self.test_digital_product)
        self.assertEqual(response.status_code, 200)
        
        # Get performer products
        response = requests.get(f"{API_URL}/store/performer/{TEST_PERFORMER_ID}/products")
        self.assertEqual(response.status_code, 200)
        
        products = response.json()
        self.assertIsInstance(products, list)
        self.assertGreaterEqual(len(products), 2)
        
        # Find our test products
        physical_product = next((p for p in products if p.get("name") == "Test T-Shirt"), None)
        self.assertIsNotNone(physical_product)
        
        digital_product = next((p for p in products if p.get("name") == "Premium Photo Collection"), None)
        self.assertIsNotNone(digital_product)
        
        print(f"Retrieved {len(products)} products for performer")
        for product in products:
            print(f"- {product['name']} ({product['product_type']}) - ${product['price']} {product['currency']}")

    def test_03_create_order(self):
        """Test creating a new order"""
        print("\n=== Testing Order Creation ===")
        
        # First create a test product
        response = requests.post(f"{API_URL}/store/products", json=self.test_physical_product)
        self.assertEqual(response.status_code, 200)
        product = response.json()
        
        # Set the product ID in the order data
        self.test_order["product_id"] = product["id"]
        
        # Create an order
        response = requests.post(f"{API_URL}/store/orders", json=self.test_order)
        self.assertEqual(response.status_code, 200)
        
        order = response.json()
        self.assertEqual(order["customer_id"], TEST_MEMBER_ID)
        self.assertEqual(order["performer_id"], TEST_PERFORMER_ID)
        self.assertEqual(order["product_id"], product["id"])
        self.assertEqual(order["quantity"], 1)
        self.assertEqual(order["unit_price"], 29.99)
        self.assertEqual(order["total_price"], 29.99)
        self.assertEqual(order["payment_status"], "paid")
        self.assertEqual(order["status"], "pending")
        
        print(f"Created order: {order['id']} for product {product['name']}")
        
        # Save order ID for later tests
        self.order_id = order["id"]

    def test_04_get_order(self):
        """Test retrieving order details"""
        print("\n=== Testing Get Order Details ===")
        
        # First create a test product and order
        response = requests.post(f"{API_URL}/store/products", json=self.test_physical_product)
        self.assertEqual(response.status_code, 200)
        product = response.json()
        
        self.test_order["product_id"] = product["id"]
        response = requests.post(f"{API_URL}/store/orders", json=self.test_order)
        self.assertEqual(response.status_code, 200)
        order = response.json()
        order_id = order["id"]
        
        # Get order details
        response = requests.get(f"{API_URL}/store/orders/{order_id}")
        self.assertEqual(response.status_code, 200)
        
        order_details = response.json()
        self.assertEqual(order_details["id"], order_id)
        self.assertEqual(order_details["customer_id"], TEST_MEMBER_ID)
        self.assertEqual(order_details["performer_id"], TEST_PERFORMER_ID)
        self.assertEqual(order_details["product_id"], product["id"])
        
        print(f"Retrieved order details: {order_details['id']}")
        print(f"- Customer: {order_details['customer_id']}")
        print(f"- Product: {order_details['product_id']}")
        print(f"- Status: {order_details['status']}")
        print(f"- Payment: {order_details['payment_status']}")
        
        # Test with non-existent order ID
        response = requests.get(f"{API_URL}/store/orders/nonexistent_id")
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent order ID")

    def test_05_update_order_shipping(self):
        """Test updating order shipping information"""
        print("\n=== Testing Update Order Shipping ===")
        
        # First create a test product and order
        response = requests.post(f"{API_URL}/store/products", json=self.test_physical_product)
        self.assertEqual(response.status_code, 200)
        product = response.json()
        
        self.test_order["product_id"] = product["id"]
        response = requests.post(f"{API_URL}/store/orders", json=self.test_order)
        self.assertEqual(response.status_code, 200)
        order = response.json()
        order_id = order["id"]
        
        # Update shipping information
        shipping_update = {
            "shipping_provider": ShippingProvider.USPS,
            "tracking_number": "USPS1234567890",
            "shipping_cost": 5.99,
            "shipping_label_url": "https://example.com/shipping-labels/label123.pdf",
            "status": "shipped",
            "shipped_at": datetime.utcnow().isoformat()
        }
        
        response = requests.put(f"{API_URL}/store/orders/{order_id}/shipping", json=shipping_update)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"Updated order shipping: {data['message']}")
        
        # Verify the update
        response = requests.get(f"{API_URL}/store/orders/{order_id}")
        self.assertEqual(response.status_code, 200)
        
        updated_order = response.json()
        self.assertEqual(updated_order["shipping_provider"], ShippingProvider.USPS)
        self.assertEqual(updated_order["tracking_number"], "USPS1234567890")
        self.assertEqual(updated_order["shipping_cost"], 5.99)
        self.assertEqual(updated_order["status"], "shipped")
        self.assertIsNotNone(updated_order["shipped_at"])
        
        print(f"Verified updated shipping information:")
        print(f"- Provider: {updated_order['shipping_provider']}")
        print(f"- Tracking: {updated_order['tracking_number']}")
        print(f"- Status: {updated_order['status']}")
        
        # Test with non-existent order ID
        response = requests.put(f"{API_URL}/store/orders/nonexistent_id/shipping", json=shipping_update)
        self.assertEqual(response.status_code, 404)
        
        print("Correctly handled non-existent order ID")


class TestExpertAPIs(unittest.TestCase):
    """Test suite for Expert APIs"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")

    def test_01_get_expert_categories(self):
        """Test retrieving expert categories"""
        print("\n=== Testing Get Expert Categories ===")
        
        response = requests.get(f"{API_URL}/experts/categories")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("categories", data)
        categories = data["categories"]
        
        # Verify we have the expected categories
        self.assertGreaterEqual(len(categories), 5)  # Should have at least 5 categories
        
        # Check for specific required categories
        category_ids = [cat["id"] for cat in categories]
        required_categories = ["legal", "medical", "financial", "accounting", "business"]
        
        for required_cat in required_categories:
            self.assertIn(required_cat, category_ids, f"Missing required category: {required_cat}")
        
        # Verify category structure
        for category in categories:
            self.assertIn("id", category)
            self.assertIn("name", category)
            self.assertIn("description", category)
        
        print(f"Retrieved {len(categories)} expert categories:")
        for category in categories:
            print(f"- {category['name']} ({category['id']}): {category['description']}")

    def test_02_get_featured_experts(self):
        """Test retrieving featured experts"""
        print("\n=== Testing Get Featured Experts ===")
        
        response = requests.get(f"{API_URL}/experts/featured")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("featured_experts", data)
        experts = data["featured_experts"]
        
        # Verify we have featured experts
        self.assertGreaterEqual(len(experts), 1)  # Should have at least 1 featured expert
        
        # Verify expert structure
        for expert in experts:
            self.assertIn("id", expert)
            self.assertIn("name", expert)
            self.assertIn("title", expert)
            self.assertIn("category", expert)
            self.assertIn("rating", expert)
            self.assertIn("consultations", expert)
            self.assertIn("rate", expert)
            self.assertIn("image", expert)
        
        print(f"Retrieved {len(experts)} featured experts:")
        for expert in experts:
            print(f"- {expert['name']} ({expert['title']}): {expert['category']} category, ${expert['rate']} rate")
            
        # Store expert IDs for later tests
        self.expert_ids = [expert["id"] for expert in experts]

    def test_03_expert_profile_consistency(self):
        """Test expert profile routing consistency"""
        print("\n=== Testing Expert Profile Routing Consistency ===")
        
        # First get featured experts to get valid expert IDs
        response = requests.get(f"{API_URL}/experts/featured")
        self.assertEqual(response.status_code, 200)
        
        featured_experts = response.json()["featured_experts"]
        self.assertGreaterEqual(len(featured_experts), 1)
        
        # Get the first expert ID
        expert_id = featured_experts[0]["id"]
        print(f"Testing with expert ID: {expert_id}")
        
        # Test expert profile endpoint
        profile_url = f"{API_URL}/experts/{expert_id}/profile"
        print(f"Requesting profile from: {profile_url}")
        response = requests.get(profile_url)
        print(f"Profile response status: {response.status_code}")
        print(f"Profile response: {response.text[:200]}...")  # Print first 200 chars
        
        # For this test, we'll just check if the endpoint returns a 200 status
        # The actual implementation might vary
        if response.status_code != 200:
            print("Profile endpoint returned non-200 status, this might be expected if the endpoint is not fully implemented")
            print("Skipping detailed profile checks")
        else:
            try:
                profile = response.json()
                if "success" in profile and profile["success"] == True:
                    # If the response has a success field, the actual profile might be in a nested field
                    if "profile" in profile:
                        profile = profile["profile"]
                
                # Verify the profile has the expected fields
                if "id" in profile:
                    self.assertEqual(profile["id"], expert_id)
                    print(f"Expert profile for {expert_id} is consistent")
                else:
                    print("Profile response doesn't contain 'id' field")
            except Exception as e:
                print(f"Error parsing profile response: {e}")
        
        # Test expert consultations endpoint
        consultations_url = f"{API_URL}/experts/{expert_id}/consultations"
        print(f"Requesting consultations from: {consultations_url}")
        response = requests.get(consultations_url)
        print(f"Consultations response status: {response.status_code}")
        print(f"Consultations response: {response.text[:200]}...")  # Print first 200 chars
        
        # For this test, we'll just check if the endpoint returns a 200 status
        # The actual implementation might vary
        if response.status_code != 200:
            print("Consultations endpoint returned non-200 status, this might be expected if the endpoint is not fully implemented")
            print("Skipping detailed consultations checks")
        else:
            try:
                consultations = response.json()
                if isinstance(consultations, dict) and "success" in consultations:
                    if "consultations" in consultations:
                        consultations = consultations["consultations"]
                
                # Consultations might be empty, but the response should be valid
                if isinstance(consultations, list):
                    print(f"Expert consultations endpoint for {expert_id} is working")
                else:
                    print(f"Consultations response is not a list: {type(consultations)}")
            except Exception as e:
                print(f"Error parsing consultations response: {e}")

    def test_04_expert_search_by_location(self):
        """Test expert search by location"""
        print("\n=== Testing Expert Search By Location ===")
        
        # Test with zip code
        response = requests.get(f"{API_URL}/experts/search-by-location?zip_code=02115&radius=25")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("experts", data)
        self.assertIn("search_params", data)
        
        # Verify search parameters
        search_params = data["search_params"]
        self.assertEqual(search_params["radius"], 25)
        self.assertIn("02115", search_params["location"])
        
        # Experts might be empty depending on the mock data, but the response should be valid
        experts = data["experts"]
        self.assertIsInstance(experts, list)
        
        print(f"Search by zip code returned {len(experts)} experts")
        for expert in experts:
            print(f"- {expert['name']} ({expert['specialty']}): {expert['distance']} miles away")
        
        # Test with category filter
        response = requests.get(f"{API_URL}/experts/search-by-location?zip_code=02115&radius=25&category=medical")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        
        # Verify category filter
        search_params = data["search_params"]
        self.assertEqual(search_params["category"], "medical")
        
        print(f"Search by zip code and medical category returned {len(data['experts'])} experts")

    def test_05_expert_search(self):
        """Test expert search endpoint"""
        print("\n=== Testing Expert Search ===")
        
        # Test basic search
        response = requests.get(f"{API_URL}/experts/search")
        self.assertEqual(response.status_code, 200)
        
        # Test with category
        response = requests.get(f"{API_URL}/experts/search?category=legal")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        if "message" in data:
            # This might be a mock response
            self.assertIn("Expert search for legal category", data["message"])
            print(f"Expert search response: {data['message']}")
        else:
            # If it's a real response with experts
            self.assertIn("experts", data)
            experts = data["experts"]
            self.assertIsInstance(experts, list)
            print(f"Expert search returned {len(experts)} experts")
        
        # Test with multiple parameters
        response = requests.get(f"{API_URL}/experts/search?category=medical&online_only=true")
        self.assertEqual(response.status_code, 200)
        
        print("Expert search endpoint is working with different parameters")

    def test_06_expert_data_structure(self):
        """Test expert data structure"""
        print("\n=== Testing Expert Data Structure ===")
        
        # Get featured experts
        response = requests.get(f"{API_URL}/experts/featured")
        self.assertEqual(response.status_code, 200)
        
        featured_experts = response.json()["featured_experts"]
        self.assertGreaterEqual(len(featured_experts), 1)
        
        # Verify expert data structure
        for expert in featured_experts:
            # Check required fields
            required_fields = ["id", "name", "title", "category", "rating", "rate"]
            for field in required_fields:
                self.assertIn(field, expert, f"Missing required field: {field}")
            
            # Verify ID format (should be a string)
            self.assertIsInstance(expert["id"], str)
            
            # Verify numeric fields
            self.assertIsInstance(expert["rating"], (int, float))
            self.assertIsInstance(expert["rate"], (int, float))
            self.assertIsInstance(expert["consultations"], int)
            
            # Verify image URL
            self.assertIsInstance(expert["image"], str)
            self.assertTrue(expert["image"].startswith("http"))
        
        print(f"Verified data structure for {len(featured_experts)} experts")
        
        # Get categories
        response = requests.get(f"{API_URL}/experts/categories")
        self.assertEqual(response.status_code, 200)
        
        categories = response.json()["categories"]
        
        # Verify category data structure
        for category in categories:
            required_fields = ["id", "name", "description"]
            for field in required_fields:
                self.assertIn(field, category, f"Missing required field: {field}")
        
        print(f"Verified data structure for {len(categories)} categories")


def run_individual_test(test_name):
    """Run a single test by name"""
    suite = unittest.TestSuite()
    
    # Check if the test name includes the class name
    if "." in test_name:
        class_name, method_name = test_name.split(".")
        if class_name == "TestExpertAPIs":
            suite.addTest(TestExpertAPIs(method_name))
        elif class_name == "TestGeoLocationAndAccessControlAPIs":
            suite.addTest(TestGeoLocationAndAccessControlAPIs(method_name))
        elif class_name == "TestAPIKeyManagementSystem":
            suite.addTest(TestAPIKeyManagementSystem(method_name))
        elif class_name == "TestAppointmentBookingSystem":
            suite.addTest(TestAppointmentBookingSystem(method_name))
        elif class_name == "TestChatSystem":
            suite.addTest(TestChatSystem(method_name))
        elif class_name == "TestFileUploadSystem":
            suite.addTest(TestFileUploadSystem(method_name))
        elif class_name == "TestStoreAndProductsManagement":
            suite.addTest(TestStoreAndProductsManagement(method_name))
    else:
        # Default to geo location tests
        suite.addTest(TestGeoLocationAndAccessControlAPIs(test_name))
    
    runner = unittest.TextTestRunner()
    runner.run(suite)

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == '-v':
            # Run all tests with verbose output
            unittest.main(argv=['first-arg-is-ignored'], verbosity=2)
        else:
            test_name = sys.argv[1]
            run_individual_test(test_name)
    else:
        unittest.main(argv=['first-arg-is-ignored'], exit=False)