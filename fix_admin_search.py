#!/usr/bin/env python3
import requests
import json
import os
from typing import Optional, Dict, Any, List
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
    """Fix the admin user search issue by patching the server.py file"""
    print("Checking for issues in the admin user search functionality...")
    
    # First, let's check if we can identify the issue by examining the code
    server_file = "/app/backend/server.py"
    
    # Read the server.py file
    with open(server_file, 'r') as f:
        server_content = f.readlines()
    
    # Look for the admin user search endpoint
    search_endpoint_line = None
    for i, line in enumerate(server_content):
        if '@api_router.get("/admin/users/search")' in line:
            search_endpoint_line = i
            break
    
    if search_endpoint_line is None:
        print("Could not find the admin user search endpoint in server.py")
        return False
    
    print(f"Found admin user search endpoint at line {search_endpoint_line}")
    
    # Extract the function implementation
    search_function_lines = []
    i = search_endpoint_line
    while i < len(server_content) and not server_content[i].strip().startswith('@api_router'):
        search_function_lines.append(server_content[i])
        i += 1
        if i >= len(server_content):
            break
    
    if not search_function_lines:
        print("Could not extract the search function implementation")
        return False
    
    print(f"Extracted search function implementation ({len(search_function_lines)} lines)")
    
    # Check if the function is calling the correct method
    is_calling_search_users = False
    for line in search_function_lines:
        if "await admin_management_service.search_users(query, user_type)" in line:
            is_calling_search_users = True
            break
    
    if not is_calling_search_users:
        print("The search function is not calling admin_management_service.search_users")
        return False
    
    print("The search function is calling the correct method")
    
    # Now let's check the admin_management_service.py file
    admin_service_file = "/app/backend/admin_management_service.py"
    
    # Read the admin_management_service.py file
    with open(admin_service_file, 'r') as f:
        admin_service_content = f.readlines()
    
    # Look for the search_users method
    search_users_line = None
    for i, line in enumerate(admin_service_content):
        if 'async def search_users(' in line:
            search_users_line = i
            break
    
    if search_users_line is None:
        print("Could not find the search_users method in admin_management_service.py")
        return False
    
    print(f"Found search_users method at line {search_users_line}")
    
    # Extract the method implementation
    search_users_method_lines = []
    i = search_users_line
    while i < len(admin_service_content) and not admin_service_content[i].strip().startswith('async def'):
        if i > search_users_line:  # Skip the method definition line
            search_users_method_lines.append(admin_service_content[i])
        i += 1
        if i >= len(admin_service_content):
            break
    
    if not search_users_method_lines:
        print("Could not extract the search_users method implementation")
        return False
    
    print(f"Extracted search_users method implementation ({len(search_users_method_lines)} lines)")
    
    # Check if the method is properly implemented
    is_properly_implemented = False
    for line in search_users_method_lines:
        if "users_cursor = self.db.users.find(mongo_query)" in line:
            is_properly_implemented = True
            break
    
    if not is_properly_implemented:
        print("The search_users method is not properly implemented")
        return False
    
    print("The search_users method appears to be properly implemented")
    
    # Let's check if there's an issue with the route handler in server.py
    route_handler_issue = False
    for line in search_function_lines:
        if "get_user_details" in line:
            route_handler_issue = True
            break
    
    if route_handler_issue:
        print("Found an issue in the route handler: it's calling get_user_details instead of search_users")
        return False
    
    # If we get here, we need to check if there's an issue with the MongoDB query
    print("No obvious issues found in the code. The issue might be with the MongoDB query or database.")
    
    # Let's create a patched version of the search_users method that includes better error handling and debugging
    patched_search_users = """    async def search_users(self, query: str, user_type: Optional[str] = None) -> Dict[str, Any]:
        \"\"\"Search users by name, email, or other criteria\"\"\"
        try:
            # Build search query
            search_conditions = [
                {"email": {"$regex": query, "$options": "i"}},
                {"firstName": {"$regex": query, "$options": "i"}},
                {"lastName": {"$regex": query, "$options": "i"}},
                {"displayName": {"$regex": query, "$options": "i"}}
            ]
            
            mongo_query = {"$or": search_conditions}
            
            if user_type:
                mongo_query["userType"] = user_type
            
            # Execute search
            users_cursor = self.db.users.find(mongo_query).sort("createdAt", -1).limit(50)
            users = await users_cursor.to_list(50)
            
            # Format results
            search_results = []
            for user in users:
                search_results.append({
                    "id": user.get('id', ''),
                    "email": user.get('email', ''),
                    "firstName": user.get('firstName'),
                    "lastName": user.get('lastName'),
                    "displayName": user.get('displayName'),
                    "userType": user.get('userType'),
                    "accountStatus": user.get('accountStatus'),
                    "createdAt": user.get('createdAt')
                })
            
            return {
                "success": True,
                "results": search_results,
                "total": len(search_results),
                "query": query
            }
            
        except Exception as e:
            print(f"Search users error: {str(e)}")
            return {"success": False, "message": f"Search failed: {str(e)}"}
"""
    
    # Replace the search_users method in the admin_management_service.py file
    new_admin_service_content = admin_service_content.copy()
    
    # Find the end of the search_users method
    search_users_end = search_users_line
    for i in range(search_users_line + 1, len(admin_service_content)):
        if admin_service_content[i].strip().startswith('async def'):
            search_users_end = i - 1
            break
        if i == len(admin_service_content) - 1:
            search_users_end = i
    
    # Replace the method
    new_admin_service_content[search_users_line:search_users_end+1] = [
        "    async def search_users(self, query: str, user_type: Optional[str] = None) -> Dict[str, Any]:\n",
        patched_search_users
    ]
    
    # Write the patched file
    with open(admin_service_file, 'w') as f:
        f.writelines(new_admin_service_content)
    
    print("Applied patch to the search_users method in admin_management_service.py")
    
    return True

def test_admin_search():
    """Test the admin user search functionality"""
    print("Testing admin user search functionality...")
    
    # Login as admin
    admin_credentials = {
        "email": "admin@theexperts.com",
        "password": "AdminPassword123!"
    }
    
    response = requests.post(f"{API_URL}/admin/login", json=admin_credentials)
    if response.status_code != 200:
        print(f"Admin login failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    if not data.get('success'):
        print(f"Admin login failed: {data.get('message')}")
        return False
    
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
        return True
    else:
        print(f"Search failed: {response.text}")
        return False

def main():
    """Main function"""
    print("Admin User Search Fix Tool")
    print("=========================")
    
    # Fix the issue
    if fix_admin_search_issue():
        print("Applied potential fix to the admin user search functionality")
        
        # Test the fix
        if test_admin_search():
            print("Fix was successful! Admin user search is now working.")
        else:
            print("Fix was not successful. Admin user search is still not working.")
    else:
        print("Could not apply fix to the admin user search functionality")

if __name__ == "__main__":
    main()