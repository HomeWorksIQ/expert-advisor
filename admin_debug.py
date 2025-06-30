#!/usr/bin/env python3
import unittest
import requests
import json
import time
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

def test_admin_login():
    """Test admin login and get token"""
    admin_credentials = {
        "email": "admin@theexperts.com",
        "password": "AdminPassword123!"
    }
    
    print(f"Attempting admin login with {admin_credentials['email']}")
    response = requests.post(f"{API_URL}/admin/login", json=admin_credentials)
    print(f"Login response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            token = data.get('access_token')
            print(f"Login successful, got token: {token[:10]}...")
            return token
    
    print(f"Login failed: {response.text}")
    return None

def test_get_all_users(token):
    """Test getting all users"""
    if not token:
        print("No token available, skipping get users test")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Getting all users with token: {token[:10]}...")
    
    response = requests.get(f"{API_URL}/admin/users", headers=headers)
    print(f"Get users response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        print(f"Got {len(users)} users")
        for i, user in enumerate(users[:3]):  # Print first 3 users
            print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
        return users
    
    print(f"Get users failed: {response.text}")
    return []

def test_user_search(token, query):
    """Test user search functionality"""
    if not token:
        print("No token available, skipping search test")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Searching for users with query: '{query}'")
    
    response = requests.get(f"{API_URL}/admin/users/search?query={query}", headers=headers)
    print(f"Search response status: {response.status_code}")
    print(f"Search response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f"Search returned {len(results)} results")
        for i, user in enumerate(results[:3]):  # Print first 3 results
            print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
    else:
        print(f"Search failed: {response.text}")

def test_user_details(token, user_id):
    """Test getting user details"""
    if not token or not user_id:
        print("No token or user ID available, skipping details test")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Getting details for user ID: {user_id}")
    
    response = requests.get(f"{API_URL}/admin/users/{user_id}", headers=headers)
    print(f"User details response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        user = data.get('user', {})
        print(f"Got details for user: {user.get('email')} - {user.get('userType')}")
        print(f"User details: {json.dumps(user, indent=2)}")
    else:
        print(f"Get user details failed: {response.text}")

def main():
    """Run all tests"""
    print(f"Testing admin functionality against {API_URL}")
    
    # Test admin login
    token = test_admin_login()
    
    # Test get all users
    users = test_get_all_users(token)
    
    # Test user search
    if users:
        # Try to search for the first user's email
        search_term = users[0].get('email', '')
        if search_term:
            test_user_search(token, search_term)
        
        # Try a generic search term
        test_user_search(token, "test")
        
        # Get user details for the first user
        user_id = users[0].get('id')
        if user_id:
            test_user_details(token, user_id)

if __name__ == "__main__":
    main()