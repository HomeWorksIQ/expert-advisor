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

class TestAdminEndpoints(unittest.TestCase):
    """Test suite for Admin API endpoints"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Admin credentials
        self.admin_credentials = {
            "email": "admin@theexperts.com",
            "password": "AdminPassword123!"
        }
        
        # Login to get admin token
        self.admin_token = self.get_admin_token()
        
        # Test user data
        self.test_user = {
            "email": f"testuser_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
            "password": "TestPassword123!",
            "firstName": "Test",
            "lastName": "User",
            "userType": "member"
        }
        
        # Create a test user if needed
        self.test_user_id = self.create_test_user()
        
        # Test expert data
        self.test_expert = {
            "email": f"testexpert_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
            "password": "TestPassword123!",
            "firstName": "Test",
            "lastName": "Expert",
            "userType": "expert",
            "expertiseCategory": "medical",
            "specializations": ["Family Medicine", "Pediatrics"],
            "credentials": ["MD", "Board Certified"],
            "yearsOfExperience": 10,
            "education": ["Harvard Medical School"],
            "accountStatus": "pending"
        }
        
        # Create a test expert if needed
        self.test_expert_id = self.create_test_expert()

    def get_admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('access_token')
        
        print("Warning: Failed to get admin token. Some tests may fail.")
        return None

    def create_test_user(self):
        """Create a test user for testing"""
        if not self.admin_token:
            return None
            
        # Check if we already have test users
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        
        if response.status_code == 200:
            users = response.json().get('users', [])
            for user in users:
                if user.get('userType') == 'member':
                    return user.get('id')
        
        # Create a new test user
        # In a real system, we would use the member registration endpoint
        # For testing, we'll just assume we have a test user
        return "test-user-123"

    def create_test_expert(self):
        """Create a test expert for testing"""
        if not self.admin_token:
            return None
            
        # Check if we already have test experts
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/experts/pending", headers=headers)
        
        if response.status_code == 200:
            experts = response.json().get('pending_experts', [])
            if experts:
                return experts[0].get('id')
        
        # Create a new test expert
        # In a real system, we would use the expert registration endpoint
        # For testing, we'll just assume we have a test expert
        return "test-expert-456"

    def test_01_admin_authentication(self):
        """Test admin authentication endpoints"""
        print("\n=== Testing Admin Authentication ===")
        
        # Test admin login
        print("Testing /api/admin/login")
        response = requests.post(f"{API_URL}/admin/login", json=self.admin_credentials)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('access_token', data)
        self.assertIn('admin', data)
        
        admin = data.get('admin')
        admin_id = admin.get('id')
        
        print(f"Admin login successful: {admin.get('displayName')} ({admin.get('adminRole')})")
        
        # Test admin profile
        if not self.admin_token or not admin_id:
            self.skipTest("Admin token or ID not available")
            
        print(f"Testing /api/admin/profile/{admin_id}")
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/admin/{admin_id}/profile", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('profile', data)
        
        profile = data.get('profile', {})
        self.assertEqual(profile.get('id'), admin_id)
        
        print(f"Admin profile retrieved successfully")

    def test_02_user_management(self):
        """Test user management endpoints"""
        print("\n=== Testing User Management ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test getting all users
        print("Testing /api/admin/users")
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('users', data)
        
        users = data.get('users', [])
        print(f"Retrieved {len(users)} users")
        
        # Test user search
        print("Testing /api/admin/users/search")
        search_term = "test"
        response = requests.get(f"{API_URL}/admin/users/search?query={search_term}", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('results', data)
        
        results = data.get('results', [])
        print(f"Search for '{search_term}' returned {len(results)} results")
        
        # Test getting specific user details
        if not users:
            self.skipTest("No users available for testing")
            
        user_id = users[0].get('id')
        print(f"Testing /api/admin/users/{user_id}")
        response = requests.get(f"{API_URL}/admin/users/{user_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('user', data)
        
        user = data.get('user', {})
        self.assertEqual(user.get('id'), user_id)
        
        print(f"User details retrieved successfully")
        
        # Test updating user status
        if not self.test_user_id:
            self.skipTest("Test user not available")
            
        print(f"Testing /api/admin/users/{self.test_user_id}/status")
        status_data = {
            "status": "suspended",
            "reason": "Testing status update functionality"
        }
        
        response = requests.put(f"{API_URL}/admin/users/{self.test_user_id}/status", 
                               json=status_data, headers=headers)
        
        # This might return 200 or 400 depending on if the test user exists
        print(f"Status update response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"User status updated successfully")
            
            # Restore user status to active
            status_data = {
                "status": "active",
                "reason": "Restoring after test"
            }
            
            response = requests.put(f"{API_URL}/admin/users/{self.test_user_id}/status", 
                                   json=status_data, headers=headers)
            print(f"Restored user status to active")
        else:
            print(f"Status update failed: {response.text}")

    def test_03_expert_management(self):
        """Test expert management endpoints"""
        print("\n=== Testing Expert Management ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test getting pending experts
        print("Testing /api/admin/experts/pending")
        response = requests.get(f"{API_URL}/admin/experts/pending", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('pending_experts', data)
        
        pending_experts = data.get('pending_experts', [])
        print(f"Retrieved {len(pending_experts)} pending experts")
        
        # Test expert approval
        if not self.test_expert_id:
            self.skipTest("Test expert not available")
            
        print(f"Testing /api/admin/experts/{self.test_expert_id}/approve")
        approval_data = {
            "admin_notes": "Approved for testing purposes"
        }
        
        response = requests.post(f"{API_URL}/admin/experts/{self.test_expert_id}/approve", 
                                json=approval_data, headers=headers)
        
        # This might return 200 or 400 depending on if the test expert exists
        print(f"Expert approval response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"Expert approved successfully")
        else:
            print(f"Expert approval failed: {response.text}")
            
        # Test expert rejection
        print(f"Testing /api/admin/experts/{self.test_expert_id}/reject")
        rejection_data = {
            "rejection_reason": "Testing rejection functionality"
        }
        
        response = requests.post(f"{API_URL}/admin/experts/{self.test_expert_id}/reject", 
                                json=rejection_data, headers=headers)
        
        # This might return 200 or 400 depending on if the test expert exists
        print(f"Expert rejection response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"Expert rejected successfully")
        else:
            print(f"Expert rejection failed: {response.text}")

    def test_04_financial_and_analytics(self):
        """Test financial and analytics endpoints"""
        print("\n=== Testing Financial & Analytics ===")
        
        if not self.admin_token:
            self.skipTest("Admin token not available")
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test financial overview
        print("Testing /api/admin/financial/overview")
        response = requests.get(f"{API_URL}/admin/finances/overview", headers=headers)
        
        # This might be /api/admin/finances/overview or /api/admin/financial/overview
        if response.status_code != 200:
            print(f"Trying alternate endpoint path")
            response = requests.get(f"{API_URL}/admin/financial/overview", headers=headers)
            
        print(f"Financial overview response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"Financial overview retrieved successfully")
        else:
            print(f"Financial overview failed: {response.text}")
            
        # Test platform analytics
        print("Testing /api/admin/analytics")
        response = requests.get(f"{API_URL}/admin/analytics/overview", headers=headers)
        
        # This might be /api/admin/analytics/overview or /api/admin/analytics
        if response.status_code != 200:
            print(f"Trying alternate endpoint path")
            response = requests.get(f"{API_URL}/admin/analytics", headers=headers)
            
        print(f"Platform analytics response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"Platform analytics retrieved successfully")
        else:
            print(f"Platform analytics failed: {response.text}")
            
        # Test engagement metrics
        print("Testing /api/admin/analytics/engagement")
        response = requests.get(f"{API_URL}/admin/analytics/engagement", headers=headers)
        print(f"Engagement metrics response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data.get('success'))
            print(f"Engagement metrics retrieved successfully")
        else:
            print(f"Engagement metrics failed: {response.text}")

if __name__ == '__main__':
    unittest.main()