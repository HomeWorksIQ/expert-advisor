#!/usr/bin/env python3
import requests
import json
import os
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"')
            break

# Add /api prefix for all API endpoints
API_URL = f"{BACKEND_URL}/api"

def test_admin_search():
    """Test the admin user search functionality"""
    # Login as admin
    admin_credentials = {
        "email": "admin@theexperts.com",
        "password": "AdminPassword123!"
    }
    
    print("Logging in as admin...")
    response = requests.post(f"{API_URL}/admin/login", json=admin_credentials)
    if response.status_code != 200:
        print(f"Admin login failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    if not data.get('success'):
        print(f"Admin login failed: {data.get('message')}")
        return False
    
    token = data.get('access_token')
    print("Admin login successful")
    
    # Test the search endpoint
    headers = {"Authorization": f"Bearer {token}"}
    print("Testing admin user search...")
    response = requests.get(f"{API_URL}/admin/users/search?query=test", headers=headers)
    
    print(f"Search response status: {response.status_code}")
    print(f"Search response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f"Search returned {len(results)} results")
        for i, user in enumerate(results[:3]):  # Print first 3 results
            print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
        return True
    else:
        print(f"Search failed: {response.text}")
        return False

def test_get_all_users():
    """Test getting all users"""
    # Login as admin
    admin_credentials = {
        "email": "admin@theexperts.com",
        "password": "AdminPassword123!"
    }
    
    print("Logging in as admin...")
    response = requests.post(f"{API_URL}/admin/login", json=admin_credentials)
    if response.status_code != 200:
        print(f"Admin login failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    if not data.get('success'):
        print(f"Admin login failed: {data.get('message')}")
        return False
    
    token = data.get('access_token')
    print("Admin login successful")
    
    # Test the get all users endpoint
    headers = {"Authorization": f"Bearer {token}"}
    print("Testing get all users...")
    response = requests.get(f"{API_URL}/admin/users", headers=headers)
    
    print(f"Get all users response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        print(f"Got {len(users)} users")
        for i, user in enumerate(users[:3]):  # Print first 3 users
            print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
        
        # If we have users, test getting user details
        if users:
            user_id = users[0].get('id')
            print(f"Testing get user details for user ID: {user_id}")
            response = requests.get(f"{API_URL}/admin/users/{user_id}", headers=headers)
            print(f"Get user details response status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                user = data.get('user', {})
                print(f"Got details for user: {user.get('email')} - {user.get('userType')}")
            else:
                print(f"Get user details failed: {response.text}")
        
        return True
    else:
        print(f"Get all users failed: {response.text}")
        return False

def main():
    """Main function"""
    print("Admin User Search Test")
    print("====================")
    
    # Test getting all users
    print("\nTesting get all users...")
    test_get_all_users()
    
    # Test admin user search
    print("\nTesting admin user search...")
    test_admin_search()

if __name__ == "__main__":
    main()