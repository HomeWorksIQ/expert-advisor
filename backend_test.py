#!/usr/bin/env python3
import unittest
import requests
import json
import time
import os
from enum import Enum

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

def run_individual_test(test_name):
    """Run a single test by name"""
    suite = unittest.TestSuite()
    suite.addTest(TestGeoLocationAndAccessControlAPIs(test_name))
    runner = unittest.TextTestRunner()
    runner.run(suite)

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        run_individual_test(test_name)
    else:
        unittest.main(argv=['first-arg-is-ignored'], exit=False)