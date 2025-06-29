#!/usr/bin/env python3
import requests
import json

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

def test_profile_access_control():
    """Test the main access control logic"""
    print("\n=== Testing Profile Access Control API ===")
    
    # Set up test data - create location preferences and teaser settings
    # 1. US - FREE access
    us_preference = {
        "performer_id": TEST_PERFORMER_ID,
        "location_type": "country",
        "location_value": "US",
        "is_allowed": True,
        "subscription_type": "free"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=us_preference)
    print(f"Created US preference: {response.status_code}")
    
    # 2. CA - MONTHLY access
    ca_preference = {
        "performer_id": TEST_PERFORMER_ID,
        "location_type": "country",
        "location_value": "CA",
        "is_allowed": True,
        "subscription_type": "monthly"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ca_preference)
    print(f"Created CA preference: {response.status_code}")
    
    # 3. NY - TEASER access
    ny_preference = {
        "performer_id": TEST_PERFORMER_ID,
        "location_type": "state",
        "location_value": "NY",
        "is_allowed": True,
        "subscription_type": "teaser"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ny_preference)
    print(f"Created NY preference: {response.status_code}")
    
    # 4. GB - Blocked access
    gb_preference = {
        "performer_id": TEST_PERFORMER_ID,
        "location_type": "country",
        "location_value": "GB",
        "is_allowed": False,
        "subscription_type": "free"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=gb_preference)
    print(f"Created GB preference: {response.status_code}")
    
    # 5. Enable teaser with 30 seconds duration
    teaser_settings = {
        "performer_id": TEST_PERFORMER_ID,
        "enabled": True,
        "duration_seconds": 30,
        "message": "Test teaser message"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=teaser_settings)
    print(f"Updated teaser settings: {response.status_code}")
    
    # 6. Block a test user
    block_data = {
        "performer_id": TEST_PERFORMER_ID,
        "blocked_user_id": "blocked-user-999",
        "reason": "harassment",
        "notes": "Test blocking user for access control test"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/block-user", json=block_data)
    print(f"Blocked user: {response.status_code}")
    
    print("Set up test data for access control tests")
    
    # First, get our current location
    response = requests.post(f"{API_URL}/detect-location")
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
    
    print("\nTest 1: US location (FREE access)")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
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
    
    print("\nTest 2: CA location (MONTHLY subscription)")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
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
    
    print("\nTest 3: NY location (TEASER access)")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
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
    
    print("\nTest 4: GB location (blocked)")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
    # Test 5: Access with blocked user ID (should be blocked)
    access_request = {
        "performer_id": TEST_PERFORMER_ID,
        "user_id": "blocked-user-999",
        "user_ip": "192.168.1.104",
        "location": us_location  # Use US location which would normally be allowed
    }
    
    print("\nTest 5: Blocked user (blocked)")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
    # Test 6: Test teaser session API
    # First, create a teaser session by checking access with NY location
    access_request = {
        "performer_id": TEST_PERFORMER_ID,
        "user_id": "teaser-test-user",
        "user_ip": "192.168.1.105",
        "location": ny_location
    }
    
    print("\nTest 6: Creating teaser session")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
    # Now check the teaser session status
    print("\nTest 7: Checking teaser session status")
    response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
    session_data = response.json()
    print(f"Response: {json.dumps(session_data, indent=2)}")

if __name__ == '__main__':
    test_profile_access_control()