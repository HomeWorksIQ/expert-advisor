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

def fix_admin_search_issue():
    """Fix the admin user search issue"""
    # Check the server.py file
    server_file = "/app/backend/server.py"
    
    # Read the file
    with open(server_file, 'r') as f:
        content = f.read()
    
    # Check if the issue is present
    if "@api_router.get(\"/admin/users/search\")" in content:
        print("Found admin user search endpoint in server.py")
        
        # Find the search_users function
        search_users_start = content.find("@api_router.get(\"/admin/users/search\")")
        if search_users_start != -1:
            # Extract the function
            search_users_end = content.find("@api_router", search_users_start + 1)
            if search_users_end == -1:
                search_users_end = len(content)
            
            search_users_code = content[search_users_start:search_users_end]
            print(f"Current search_users code:\n{search_users_code}")
            
            # Check if the function is calling the correct method
            if "await admin_management_service.search_users(query, user_type)" in search_users_code:
                print("The search_users function is calling the correct method")
                
                # Check if there's an issue with the error handling
                if "raise HTTPException(status_code=400, detail=result.get('message', 'Search failed'))" in search_users_code:
                    print("Found potential issue with error handling")
                    
                    # Fix the function
                    fixed_code = '''@api_router.get("/admin/users/search")
async def search_users(query: str, user_type: Optional[str] = None):
    """Search users by name, email, or other criteria"""
    try:
        result = await admin_management_service.search_users(query, user_type)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Search failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Search failed: {str(e)}")
'''
                    
                    # Replace the function in the file
                    new_content = content.replace(search_users_code, fixed_code)
                    
                    # Write the fixed content back to the file
                    with open(server_file, 'w') as f:
                        f.write(new_content)
                    
                    print("Fixed the search_users function")
                    return True
    
    # If we get here, we couldn't fix the issue
    print("Could not identify or fix the issue")
    return False

def main():
    """Run the fix"""
    print("Attempting to fix admin user search issue")
    
    # Fix the issue
    if fix_admin_search_issue():
        print("Fix applied, testing the fix...")
        
        # Test the fix
        # Login as admin
        admin_credentials = {
            "email": "admin@theexperts.com",
            "password": "AdminPassword123!"
        }
        
        response = requests.post(f"{API_URL}/admin/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                token = data.get('access_token')
                print(f"Admin login successful")
                
                # Test the search endpoint
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"{API_URL}/admin/users/search?query=test", headers=headers)
                
                print(f"Search response status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    print(f"Search returned {len(results)} results")
                    print("Fix was successful!")
                else:
                    print(f"Search still failing: {response.text}")
            else:
                print(f"Admin login failed: {data.get('message')}")
        else:
            print(f"Admin login failed: {response.status_code}")
    else:
        print("Could not apply fix")

if __name__ == "__main__":
    main()