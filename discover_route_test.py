#!/usr/bin/env python3
import unittest
import requests
import os
import re

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"')
            break

# Frontend URL is the same as backend URL but without the /api
FRONTEND_URL = BACKEND_URL

class TestDiscoverPageRoute(unittest.TestCase):
    """Test suite for Discover Page Frontend Route"""

    def test_discover_page_route(self):
        """Test if the Discover page frontend route is accessible and working correctly"""
        print("\n=== Testing Discover Page Frontend Route ===")
        
        # Make a curl request to the frontend at the /discover route
        response = requests.get(f"{FRONTEND_URL}/discover", allow_redirects=True)
        
        # Print response details for debugging
        print(f"Response Status Code: {response.status_code}")
        print(f"Response URL (after redirects): {response.url}")
        print(f"Response Headers: {response.headers}")
        
        # Check if the response contains HTML content
        content_type = response.headers.get('Content-Type', '')
        print(f"Content-Type: {content_type}")
        
        # Check if the response contains React app markers
        html_content = response.text
        contains_react = 'react' in html_content.lower() or 'root' in html_content.lower()
        print(f"Contains React markers: {contains_react}")
        
        # Check for common React bundle patterns
        has_bundle = bool(re.search(r'(static\/js\/|bundle\.js|chunk\.js|main\.js)', html_content))
        print(f"Contains JS bundle references: {has_bundle}")
        
        # Check if the page has the Discover page title or content
        has_discover_content = 'discover' in html_content.lower() or 'creators' in html_content.lower()
        print(f"Contains Discover page content: {has_discover_content}")
        
        # Assertions
        self.assertTrue(response.status_code in [200, 304], "Response status code should be 200 or 304")
        self.assertTrue('text/html' in content_type.lower(), "Response should be HTML")
        self.assertTrue(contains_react or has_bundle, "Response should contain React app markers")
        
        # Print summary
        if response.status_code in [200, 304] and ('text/html' in content_type.lower()) and (contains_react or has_bundle):
            print("\nSUCCESS: The Discover page is being served correctly by the React app")
        else:
            print("\nFAILURE: The Discover page is not being served correctly")
            
        # Additional check for redirects
        if response.history:
            print(f"\nRedirect history: {len(response.history)} redirects occurred")
            for hist in response.history:
                print(f"  {hist.status_code} : {hist.url} -> {response.url}")
            
            # Check if we were redirected to the homepage
            if FRONTEND_URL + '/' == response.url or FRONTEND_URL == response.url:
                print("WARNING: The request was redirected to the homepage, which may indicate a routing issue")
                print("This could be due to the React Router configuration or a server-side routing issue")

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)