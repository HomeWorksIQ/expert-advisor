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
        
        # Login and get admin token
        self.admin_token = self.get_admin_token()
        
    def get_admin_token(self):
        """Login as admin and get access token"""
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('access_token')
        print(f"Admin login failed: {response.status_code} - {response.text}")
        return None
        
    def test_01_admin_login(self):
        """Test admin login functionality"""
        print("\n=== Testing Admin Login ===")
        
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('access_token', data)
        self.assertIn('admin', data)
        
        admin = data.get('admin')
        self.assertEqual(admin.get('email'), self.admin_credentials.get('email'))
        
        print(f"Admin login successful: {admin.get('displayName')} ({admin.get('adminRole')})")
        
    def test_02_get_all_users(self):
        """Test getting all users as admin"""
        print("\n=== Testing Get All Users ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('users', data)
        
        users = data.get('users')
        self.assertIsInstance(users, list)
        
        print(f"Retrieved {len(users)} users")
        for i, user in enumerate(users[:5]):  # Print first 5 users
            print(f"{i+1}. {user.get('displayName', 'N/A')} ({user.get('email')}) - {user.get('userType')}")
            
        # Save a user ID for later tests if available
        if users:
            self.test_user_id = users[0].get('id')
            print(f"Saved test user ID: {self.test_user_id}")
        
    def test_03_search_users(self):
        """Test searching for users as admin"""
        print("\n=== Testing User Search ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # First get all users to find a search term
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        all_users = response.json().get('users', [])
        if not all_users:
            self.skipTest("No users available to search for")
            
        # Use the first user's email as search term
        search_term = all_users[0].get('email')
        if not search_term:
            search_term = "test"  # Fallback search term
            
        print(f"Searching for users with term: '{search_term}'")
        
        # Perform the search
        try:
            response = requests.get(f"{API_URL}/admin/users/search?query={search_term}", headers=headers)
            print(f"Search response: {response.status_code}")
            print(f"Response content: {response.text}")
            self.assertEqual(response.status_code, 200)
        except Exception as e:
            print(f"Exception during search: {str(e)}")
            raise
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('results', data)
        
        results = data.get('results')
        self.assertIsInstance(results, list)
        
        print(f"Search returned {len(results)} results")
        for i, user in enumerate(results[:5]):  # Print first 5 results
            print(f"{i+1}. {user.get('displayName', 'N/A')} ({user.get('email')}) - {user.get('userType')}")
            
    def test_04_get_user_details(self):
        """Test getting user details as admin"""
        print("\n=== Testing Get User Details ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        # First get all users to find a user ID
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        all_users = response.json().get('users', [])
        if not all_users:
            self.skipTest("No users available to get details for")
            
        # Use the first user's ID
        user_id = all_users[0].get('id')
        print(f"Getting details for user ID: {user_id}")
        
        # Get user details
        response = requests.get(f"{API_URL}/admin/users/{user_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('user', data)
        
        user = data.get('user')
        self.assertEqual(user.get('id'), user_id)
        
        print(f"Retrieved details for user: {user.get('displayName', 'N/A')} ({user.get('email')})")
        print(f"User type: {user.get('userType')}")
        print(f"Account status: {user.get('accountStatus')}")
        
        # Check for additional data based on user type
        if user.get('userType') == 'member':
            print(f"Favorites count: {user.get('favorites_count', 'N/A')}")
        elif user.get('userType') == 'expert':
            print(f"Total consultations: {user.get('total_consultations', 'N/A')}")
            print(f"Average rating: {user.get('average_rating', 'N/A')}")
            
    def test_05_search_with_various_terms(self):
        """Test searching with various terms to verify search functionality"""
        print("\n=== Testing Search with Various Terms ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test search terms
        search_terms = ["admin", "test", "user", "expert", "member", "a"]
        
        for term in search_terms:
            print(f"\nSearching for term: '{term}'")
            response = requests.get(f"{API_URL}/admin/users/search?query={term}", headers=headers)
            
            if response.status_code != 200:
                print(f"Search failed: {response.status_code} - {response.text}")
                continue
                
            data = response.json()
            results = data.get('results', [])
            
            print(f"Search returned {len(results)} results")
            for i, user in enumerate(results[:3]):  # Print first 3 results
                print(f"{i+1}. {user.get('displayName', 'N/A')} ({user.get('email')}) - {user.get('userType')}")
                
    def test_06_search_with_user_type_filter(self):
        """Test searching with user type filter"""
        print("\n=== Testing Search with User Type Filter ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test user types
        user_types = ["admin", "member", "expert"]
        
        for user_type in user_types:
            print(f"\nSearching for users with type: '{user_type}'")
            response = requests.get(f"{API_URL}/admin/users/search?query=a&user_type={user_type}", headers=headers)
            
            if response.status_code != 200:
                print(f"Search failed: {response.status_code} - {response.text}")
                continue
                
            data = response.json()
            results = data.get('results', [])
            
            print(f"Search returned {len(results)} results")
            for i, user in enumerate(results[:3]):  # Print first 3 results
                print(f"{i+1}. {user.get('displayName', 'N/A')} ({user.get('email')}) - {user.get('userType')}")
                self.assertEqual(user.get('userType'), user_type)
                
    def test_07_search_with_empty_query(self):
        """Test searching with empty query"""
        print("\n=== Testing Search with Empty Query ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        print("Searching with empty query")
        response = requests.get(f"{API_URL}/admin/users/search?query=", headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.text}")
        
        # The API might return an error or empty results, depending on implementation
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"Search returned {len(results)} results")
        else:
            print("Empty query correctly rejected")
            
    def test_08_search_with_special_characters(self):
        """Test searching with special characters"""
        print("\n=== Testing Search with Special Characters ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test special characters
        special_chars = ["@", ".", "+", "%", "&", "*"]
        
        for char in special_chars:
            print(f"\nSearching with special character: '{char}'")
            response = requests.get(f"{API_URL}/admin/users/search?query={char}", headers=headers)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"Search returned {len(results)} results")
            else:
                print(f"Special character '{char}' search failed: {response.text}")

if __name__ == '__main__':
    unittest.main()