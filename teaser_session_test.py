#!/usr/bin/env python3
import requests
import json
import time

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

def test_teaser_session():
    """Test teaser session functionality"""
    print("\n=== Testing Teaser Session API ===")
    
    # 0. Clean up existing preferences
    response = requests.get(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences")
    if response.status_code == 200:
        preferences = response.json()
        for pref in preferences:
            requests.delete(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences/{pref['id']}")
    print("Cleaned up existing preferences")
    
    # 1. Set up teaser settings with short duration for testing
    teaser_settings = {
        "performer_id": TEST_PERFORMER_ID,
        "enabled": True,
        "duration_seconds": 10,  # Short duration for testing
        "message": "Test teaser message"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/teaser-settings", json=teaser_settings)
    print(f"Updated teaser settings: {response.status_code}")
    
    # 2. Set up location preference for NY with TEASER access (only this preference)
    ny_preference = {
        "performer_id": TEST_PERFORMER_ID,
        "location_type": "state",
        "location_value": "NY",
        "is_allowed": True,
        "subscription_type": "teaser"
    }
    response = requests.post(f"{API_URL}/performer/{TEST_PERFORMER_ID}/location-preferences", json=ny_preference)
    print(f"Created NY preference with TEASER access: {response.status_code}")
    
    # 3. First, get our actual IP address
    response = requests.post(f"{API_URL}/detect-location")
    actual_ip = response.json()['ip']
    print(f"Actual IP address: {actual_ip}")
    
    # Create access request with NY location and actual IP
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
        "user_id": "teaser-test-user",
        "user_ip": actual_ip,
        "location": ny_location
    }
    
    print("\nCreating teaser session")
    response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
    access_data = response.json()
    print(f"Response: {json.dumps(access_data, indent=2)}")
    
    # 4. Check teaser session status
    print("\nChecking teaser session status")
    response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
    session_data = response.json()
    print(f"Response: {json.dumps(session_data, indent=2)}")
    
    # Try again with a small delay
    print("\nWaiting 1 second and checking again...")
    time.sleep(1)
    response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
    session_data = response.json()
    print(f"Response after delay: {json.dumps(session_data, indent=2)}")
    
    # 5. Wait for teaser to expire
    if session_data.get('active', False):
        remaining_seconds = session_data.get('remaining_seconds', 0)
        print(f"\nWaiting {remaining_seconds + 1} seconds for teaser to expire...")
        time.sleep(remaining_seconds + 1)
        
        # 6. Check session again - should be expired
        print("\nChecking teaser session status after expiration")
        response = requests.get(f"{API_URL}/teaser-session/{TEST_PERFORMER_ID}?user_id=teaser-test-user")
        session_data = response.json()
        print(f"Response: {json.dumps(session_data, indent=2)}")
        
        # 7. Try to access profile again - should be blocked
        print("\nTrying to access profile after teaser expiration")
        response = requests.post(f"{API_URL}/check-profile-access", json=access_request)
        access_data = response.json()
        print(f"Response: {json.dumps(access_data, indent=2)}")

if __name__ == '__main__':
    test_teaser_session()