#!/usr/bin/env python3
import unittest
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

class TestAdminUserSearch(unittest.TestCase):
    """Test suite for Admin User Search functionality"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Admin credentials
        self.admin_credentials = {
            "email": "admin@theexperts.com",
            "password": "AdminPassword123!"
        }
        
        # Login and get access token
        self.admin_token = self.login_admin()
        
    def login_admin(self):
        """Login as admin and return access token"""
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"Admin login successful: {data.get('admin', {}).get('email')}")
                return data.get('access_token')
        
        print(f"Admin login failed with status code: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
        return None
    
    def test_01_admin_login(self):
        """Test admin login functionality"""
        print("\n=== Testing Admin Login ===")
        
        # Test with valid credentials
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('admin', data)
        self.assertIn('access_token', data)
        
        admin_data = data.get('admin', {})
        self.assertEqual(admin_data.get('email'), self.admin_credentials['email'])
        
        print(f"Admin login successful: {admin_data.get('email')}")
        
        # Test with invalid credentials
        invalid_credentials = {
            "email": "admin@theexperts.com",
            "password": "WrongPassword123!"
        }
        
        response = requests.post(f"{API_URL}/admin/login", json=invalid_credentials)
        if response.status_code == 200:
            data = response.json()
            self.assertFalse(data.get('success'))
            print(f"Invalid login correctly rejected: {data.get('message')}")
        else:
            print(f"Invalid login returned status code: {response.status_code}")
    
    def test_02_get_all_users(self):
        """Test getting all users as admin"""
        print("\n=== Testing Get All Users ===")
        
        if not self.admin_token:
            self.skipTest("Admin login failed, skipping test")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('users', data)
        
        users = data.get('users', [])
        self.assertIsInstance(users, list)
        
        print(f"Retrieved {len(users)} users")
        for i, user in enumerate(users[:5]):  # Print first 5 users
            print(f"{i+1}. {user.get('email')} - {user.get('userType')} - {user.get('accountStatus')}")
        
        if len(users) > 5:
            print(f"... and {len(users) - 5} more users")
        
        # Save user data for later tests
        self.users = users
    
    def test_03_user_search(self):
        """Test searching for users as admin"""
        print("\n=== Testing User Search ===")
        
        if not self.admin_token:
            self.skipTest("Admin login failed, skipping test")
        
        # First get all users to find search terms
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        
        if response.status_code != 200:
            self.skipTest(f"Failed to get users, status code: {response.status_code}")
        
        all_users = response.json().get('users', [])
        if not all_users:
            self.skipTest("No users found to search for")
        
        # Test 1: Search with the term "test"
        search_term = "test"
        response = requests.get(f"{API_URL}/admin/users/search?query={search_term}", headers=headers)
        
        print(f"Search response status code: {response.status_code}")
        print(f"Search response: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('results', data)
        
        results = data.get('results', [])
        self.assertIsInstance(results, list)
        
        print(f"Search for '{search_term}' returned {len(results)} results")
        for i, user in enumerate(results[:5]):  # Print first 5 results
            print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
        
        if len(results) > 5:
            print(f"... and {len(results) - 5} more results")
        
        # Test 2: Search with a specific email from the users list
        if all_users:
            # Get a partial email to search for
            sample_email = all_users[0].get('email', '')
            if '@' in sample_email:
                email_search = sample_email.split('@')[0]  # Use the part before @
            else:
                email_search = sample_email[:4]  # Use first few characters
                
            if email_search:
                response = requests.get(f"{API_URL}/admin/users/search?query={email_search}", headers=headers)
                
                self.assertEqual(response.status_code, 200)
                
                data = response.json()
                self.assertTrue(data.get('success'))
                
                results = data.get('results', [])
                
                print(f"Search for email '{email_search}' returned {len(results)} results")
                for i, user in enumerate(results[:5]):
                    print(f"{i+1}. {user.get('email')} - {user.get('userType')}")
    
    def test_04_get_user_details(self):
        """Test getting user details as admin"""
        print("\n=== Testing Get User Details ===")
        
        if not self.admin_token:
            self.skipTest("Admin login failed, skipping test")
        
        # First get all users to find a user ID
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        
        if response.status_code != 200:
            self.skipTest(f"Failed to get users, status code: {response.status_code}")
        
        all_users = response.json().get('users', [])
        if not all_users:
            self.skipTest("No users found to get details for")
        
        # Get details for the first user
        user_id = all_users[0].get('id')
        response = requests.get(f"{API_URL}/admin/users/{user_id}", headers=headers)
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('user', data)
        
        user_details = data.get('user', {})
        self.assertEqual(user_details.get('id'), user_id)
        
        print(f"Retrieved details for user: {user_details.get('email')}")
        print(f"User type: {user_details.get('userType')}")
        print(f"Account status: {user_details.get('accountStatus')}")
        
        # Test with non-existent user ID
        response = requests.get(f"{API_URL}/admin/users/nonexistent_id", headers=headers)
        
        if response.status_code == 404:
            print("Correctly returned 404 for non-existent user ID")
        else:
            print(f"Unexpected status code for non-existent user ID: {response.status_code}")

if __name__ == "__main__":
    unittest.main()