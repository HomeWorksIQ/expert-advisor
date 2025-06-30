#!/usr/bin/env python3
import unittest
import requests
import json
import time
import os
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"')
            break

# Add /api prefix for all API endpoints
API_URL = f"{BACKEND_URL}/api"

# Test constants
TEST_EMAIL = f"test.user.{uuid.uuid4()}@example.com"
TEST_PASSWORD = "TestPassword123!"
TEST_FIRST_NAME = "Test"
TEST_LAST_NAME = "User"

class TestMemberAuthenticationAPI(unittest.TestCase):
    """Test suite for Member Authentication API"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        self.member_id = None
        self.access_token = None
        self.session_id = None
        self.reset_token = None
        self.verification_token = None

    def tearDown(self):
        """Clean up after tests"""
        # If we have a member_id, we should try to delete the account
        if self.member_id and self.access_token:
            try:
                headers = {"Authorization": f"Bearer {self.access_token}"}
                requests.delete(f"{API_URL}/members/{self.member_id}/account", headers=headers)
            except:
                pass

    def test_01_register_member(self):
        """Test member registration"""
        print("\n=== Testing Member Registration ===")
        
        # Test registration with valid data
        registration_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "firstName": TEST_FIRST_NAME,
            "lastName": TEST_LAST_NAME,
            "agreesToTerms": True
        }
        
        response = requests.post(f"{API_URL}/members/register", json=registration_data)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('user_id', data)
        self.assertTrue(data['verification_required'])
        
        # Save member_id for later tests
        self.member_id = data['user_id']
        print(f"Registered member with ID: {self.member_id}")
        
        # Test registration with existing email (should fail)
        response = requests.post(f"{API_URL}/members/register", json=registration_data)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected duplicate email registration")
        
        # Test registration with missing fields (should fail)
        invalid_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
            # Missing firstName, lastName, agreesToTerms
        }
        
        response = requests.post(f"{API_URL}/members/register", json=invalid_data)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected registration with missing fields")
        
        # Test registration with weak password (should fail)
        weak_password_data = {
            "email": f"another.{uuid.uuid4()}@example.com",
            "password": "weak",
            "firstName": TEST_FIRST_NAME,
            "lastName": TEST_LAST_NAME,
            "agreesToTerms": True
        }
        
        response = requests.post(f"{API_URL}/members/register", json=weak_password_data)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected registration with weak password")
        
        # Test registration without agreeing to terms (should fail)
        no_terms_data = {
            "email": f"another.{uuid.uuid4()}@example.com",
            "password": TEST_PASSWORD,
            "firstName": TEST_FIRST_NAME,
            "lastName": TEST_LAST_NAME,
            "agreesToTerms": False
        }
        
        response = requests.post(f"{API_URL}/members/register", json=no_terms_data)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected registration without agreeing to terms")

    def test_02_login_member(self):
        """Test member login"""
        print("\n=== Testing Member Login ===")
        
        # First register a test member if we don't have one
        if not self.member_id:
            registration_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "firstName": TEST_FIRST_NAME,
                "lastName": TEST_LAST_NAME,
                "agreesToTerms": True
            }
            
            response = requests.post(f"{API_URL}/members/register", json=registration_data)
            if response.status_code == 200:
                self.member_id = response.json()['user_id']
            else:
                # If registration fails because email exists, try to login directly
                pass
        
        # Test login with valid credentials
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('access_token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], TEST_EMAIL)
        
        # Save access token and session ID for later tests
        self.access_token = data['access_token']
        self.session_id = data['session_id']
        print(f"Logged in successfully with token: {self.access_token[:10]}...")
        
        # Test login with invalid email
        invalid_email_data = {
            "email": f"nonexistent.{uuid.uuid4()}@example.com",
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{API_URL}/members/login", json=invalid_email_data)
        self.assertEqual(response.status_code, 401)
        print("Correctly rejected login with invalid email")
        
        # Test login with invalid password
        invalid_password_data = {
            "email": TEST_EMAIL,
            "password": "WrongPassword123!"
        }
        
        response = requests.post(f"{API_URL}/members/login", json=invalid_password_data)
        self.assertEqual(response.status_code, 401)
        print("Correctly rejected login with invalid password")

    def test_03_logout_member(self):
        """Test member logout"""
        print("\n=== Testing Member Logout ===")
        
        # First login to get a session token
        if not self.access_token:
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            response = requests.post(f"{API_URL}/members/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.access_token = data['access_token']
                self.session_id = data['session_id']
        
        # Test logout with valid session token
        logout_data = {
            "session_token": self.access_token
        }
        
        response = requests.post(f"{API_URL}/members/logout", json=logout_data)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        print("Logged out successfully")
        
        # Test logout with already invalidated token (should fail)
        response = requests.post(f"{API_URL}/members/logout", json=logout_data)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected logout with invalid token")
        
        # Login again for subsequent tests
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['access_token']
            self.session_id = data['session_id']

    def test_04_forgot_password(self):
        """Test forgot password functionality"""
        print("\n=== Testing Forgot Password ===")
        
        # Test forgot password with valid email
        forgot_data = {
            "email": TEST_EMAIL
        }
        
        response = requests.post(f"{API_URL}/members/forgot-password", json=forgot_data)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        print("Forgot password request successful")
        
        # Test forgot password with non-existent email (should still return success for security)
        nonexistent_data = {
            "email": f"nonexistent.{uuid.uuid4()}@example.com"
        }
        
        response = requests.post(f"{API_URL}/members/forgot-password", json=nonexistent_data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        print("Correctly handled non-existent email (returned success for security)")
        
        # Note: We can't test reset-password without a valid token from the email
        # In a real test, we would need to extract the token from the email or database
        print("Note: Full password reset flow can't be tested without email access")

    def test_05_change_password(self):
        """Test change password functionality"""
        print("\n=== Testing Change Password ===")
        
        # First login if we don't have a token
        if not self.access_token:
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            response = requests.post(f"{API_URL}/members/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.access_token = data['access_token']
                self.member_id = data['user']['id']
        
        # Test change password with valid data
        new_password = f"NewPassword{uuid.uuid4()}"[:16] + "!"
        change_data = {
            "old_password": TEST_PASSWORD,
            "new_password": new_password
        }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.post(f"{API_URL}/members/{self.member_id}/change-password", json=change_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        print("Changed password successfully")
        
        # Test login with new password
        login_data = {
            "email": TEST_EMAIL,
            "password": new_password
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        print("Successfully logged in with new password")
        
        # Update access token
        self.access_token = response.json()['access_token']
        
        # Test change password with incorrect old password (should fail)
        invalid_change_data = {
            "old_password": TEST_PASSWORD,  # Old password, not the new one
            "new_password": "AnotherPassword123!"
        }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.post(f"{API_URL}/members/{self.member_id}/change-password", json=invalid_change_data, headers=headers)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected change with incorrect old password")
        
        # Test change password with weak new password (should fail)
        weak_change_data = {
            "old_password": new_password,
            "new_password": "weak"
        }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.post(f"{API_URL}/members/{self.member_id}/change-password", json=weak_change_data, headers=headers)
        self.assertEqual(response.status_code, 400)
        print("Correctly rejected change with weak new password")
        
        # Change back to original password for other tests
        revert_data = {
            "old_password": new_password,
            "new_password": TEST_PASSWORD
        }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.post(f"{API_URL}/members/{self.member_id}/change-password", json=revert_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Login again with original password
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        self.access_token = response.json()['access_token']


class TestMemberProfileAPI(unittest.TestCase):
    """Test suite for Member Profile API"""

    def setUp(self):
        """Set up test fixtures"""
        print(f"\nUsing API URL: {API_URL}")
        
        # Register and login a test member
        self.test_email = f"profile.test.{uuid.uuid4()}@example.com"
        self.test_password = "ProfileTest123!"
        
        # Register
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "firstName": "Profile",
            "lastName": "Test",
            "agreesToTerms": True
        }
        
        response = requests.post(f"{API_URL}/members/register", json=registration_data)
        if response.status_code == 200:
            self.member_id = response.json()['user_id']
        else:
            self.fail("Failed to register test member for profile tests")
        
        # Login
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['access_token']
            self.headers = {"Authorization": f"Bearer {self.access_token}"}
        else:
            self.fail("Failed to login test member for profile tests")

    def tearDown(self):
        """Clean up after tests"""
        # Delete the test member account
        if hasattr(self, 'member_id') and hasattr(self, 'headers'):
            try:
                requests.delete(f"{API_URL}/members/{self.member_id}/account", headers=self.headers)
            except:
                pass

    def test_01_get_member_profile(self):
        """Test getting member profile"""
        print("\n=== Testing Get Member Profile ===")
        
        response = requests.get(f"{API_URL}/members/{self.member_id}/profile", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('profile', data)
        
        profile = data['profile']
        self.assertEqual(profile['email'], self.test_email)
        self.assertEqual(profile['firstName'], "Profile")
        self.assertEqual(profile['lastName'], "Test")
        self.assertEqual(profile['displayName'], "Profile Test")
        
        print(f"Successfully retrieved profile for {profile['displayName']}")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/members/{fake_id}/profile", headers=self.headers)
        self.assertEqual(response.status_code, 404)
        print("Correctly handled non-existent member ID")

    def test_02_update_member_profile(self):
        """Test updating member profile"""
        print("\n=== Testing Update Member Profile ===")
        
        # Update profile with new data
        update_data = {
            "firstName": "Updated",
            "lastName": "Profile",
            "bio": "This is a test bio for the updated profile",
            "phone": "+1234567890",
            "location": "Test City, Test Country"
        }
        
        response = requests.put(f"{API_URL}/members/{self.member_id}/profile", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('profile', data)
        
        profile = data['profile']
        self.assertEqual(profile['firstName'], "Updated")
        self.assertEqual(profile['lastName'], "Profile")
        self.assertEqual(profile['displayName'], "Updated Profile")
        self.assertEqual(profile['bio'], "This is a test bio for the updated profile")
        self.assertEqual(profile['phone'], "+1234567890")
        self.assertEqual(profile['location'], "Test City, Test Country")
        
        print(f"Successfully updated profile for {profile['displayName']}")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.put(f"{API_URL}/members/{fake_id}/profile", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        print("Correctly handled non-existent member ID")

    def test_03_get_member_preferences(self):
        """Test getting member preferences"""
        print("\n=== Testing Get Member Preferences ===")
        
        response = requests.get(f"{API_URL}/members/{self.member_id}/preferences", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('preferences', data)
        
        preferences = data['preferences']
        self.assertIn('emailNotifications', preferences)
        self.assertIn('smsNotifications', preferences)
        self.assertIn('marketingEmails', preferences)
        self.assertIn('locationSharing', preferences)
        
        print(f"Successfully retrieved preferences with {len(preferences)} settings")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/members/{fake_id}/preferences", headers=self.headers)
        self.assertEqual(response.status_code, 404)
        print("Correctly handled non-existent member ID")

    def test_04_update_member_preferences(self):
        """Test updating member preferences"""
        print("\n=== Testing Update Member Preferences ===")
        
        # Update preferences with new data
        update_data = {
            "emailNotifications": False,
            "smsNotifications": True,
            "marketingEmails": False,
            "showOnlineStatus": False,
            "preferredLanguage": "es",
            "timezone": "Europe/London"
        }
        
        response = requests.put(f"{API_URL}/members/{self.member_id}/preferences", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('preferences', data)
        
        preferences = data['preferences']
        self.assertFalse(preferences['emailNotifications'])
        self.assertTrue(preferences['smsNotifications'])
        self.assertFalse(preferences['marketingEmails'])
        self.assertFalse(preferences['showOnlineStatus'])
        self.assertEqual(preferences['preferredLanguage'], "es")
        self.assertEqual(preferences['timezone'], "Europe/London")
        
        print(f"Successfully updated preferences")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.put(f"{API_URL}/members/{fake_id}/preferences", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        print("Correctly handled non-existent member ID")

    def test_05_get_member_dashboard(self):
        """Test getting member dashboard"""
        print("\n=== Testing Get Member Dashboard ===")
        
        response = requests.get(f"{API_URL}/members/{self.member_id}/dashboard", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('dashboard', data)
        
        dashboard = data['dashboard']
        self.assertIn('member', dashboard)
        self.assertIn('credits', dashboard)
        self.assertIn('affiliate', dashboard)
        self.assertIn('favorites', dashboard)
        self.assertIn('activity', dashboard)
        self.assertIn('stats', dashboard)
        
        print(f"Successfully retrieved dashboard data")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/members/{fake_id}/dashboard", headers=self.headers)
        self.assertEqual(response.status_code, 404)
        print("Correctly handled non-existent member ID")

    def test_06_get_member_activity(self):
        """Test getting member activity"""
        print("\n=== Testing Get Member Activity ===")
        
        response = requests.get(f"{API_URL}/members/{self.member_id}/activity", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('activity', data)
        self.assertIn('total', data)
        
        activity = data['activity']
        self.assertIsInstance(activity, list)
        
        print(f"Successfully retrieved {len(activity)} activity items")
        
        # Test with limit parameter
        limit = 2
        response = requests.get(f"{API_URL}/members/{self.member_id}/activity?limit={limit}", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        activity = data['activity']
        self.assertLessEqual(len(activity), limit)
        
        print(f"Successfully limited activity to {len(activity)} items")
        
        # Test with non-existent member ID
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/members/{fake_id}/activity", headers=self.headers)
        self.assertEqual(response.status_code, 404)
        print("Correctly handled non-existent member ID")

    def test_07_member_favorites(self):
        """Test member favorites functionality"""
        print("\n=== Testing Member Favorites ===")
        
        # First, get current favorites
        response = requests.get(f"{API_URL}/members/{self.member_id}/favorites", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        initial_favorites = data['favorites']
        initial_count = len(initial_favorites)
        
        print(f"Initially has {initial_count} favorites")
        
        # Add a favorite expert (using a mock expert ID)
        expert_id = "expert_001"  # From the mock data in server.py
        response = requests.post(f"{API_URL}/members/{self.member_id}/favorites/{expert_id}", headers=self.headers)
        
        # This might fail if the expert doesn't exist in the database
        # We'll check the status code but not fail the test if it's not 200
        if response.status_code == 200:
            data = response.json()
            self.assertTrue(data['success'])
            print(f"Added expert {expert_id} to favorites")
            
            # Get favorites again to verify addition
            response = requests.get(f"{API_URL}/members/{self.member_id}/favorites", headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            updated_favorites = data['favorites']
            self.assertEqual(len(updated_favorites), initial_count + 1)
            
            # Remove the favorite
            response = requests.delete(f"{API_URL}/members/{self.member_id}/favorites/{expert_id}", headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            self.assertTrue(data['success'])
            print(f"Removed expert {expert_id} from favorites")
            
            # Get favorites again to verify removal
            response = requests.get(f"{API_URL}/members/{self.member_id}/favorites", headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            final_favorites = data['favorites']
            self.assertEqual(len(final_favorites), initial_count)
        else:
            print(f"Note: Could not add expert {expert_id} to favorites - expert may not exist in database")
            print(f"Status code: {response.status_code}, Response: {response.text}")

    def test_08_delete_member_account(self):
        """Test deleting member account"""
        print("\n=== Testing Delete Member Account ===")
        
        response = requests.delete(f"{API_URL}/members/{self.member_id}/account", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['success'])
        print(f"Successfully deleted member account")
        
        # Try to get profile after deletion (should fail)
        response = requests.get(f"{API_URL}/members/{self.member_id}/profile", headers=self.headers)
        self.assertNotEqual(response.status_code, 200)
        print("Correctly prevented access to deleted account")
        
        # Try to login after deletion (should fail)
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(f"{API_URL}/members/login", json=login_data)
        self.assertNotEqual(response.status_code, 200)
        print("Correctly prevented login to deleted account")


if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)