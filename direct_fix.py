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

def fix_admin_search():
    """Fix the admin user search functionality"""
    # Path to the admin_management_service.py file
    admin_service_file = "/app/backend/admin_management_service.py"
    
    # Read the file
    with open(admin_service_file, 'r') as f:
        content = f.read()
    
    # Find the search_users method
    search_users_start = content.find("async def search_users(")
    if search_users_start == -1:
        print("Could not find the search_users method in admin_management_service.py")
        return False
    
    # Find the end of the method
    search_users_end = content.find("async def", search_users_start + 1)
    if search_users_end == -1:
        search_users_end = len(content)
    
    # Extract the method
    search_users_method = content[search_users_start:search_users_end]
    print(f"Found search_users method:\n{search_users_method}")
    
    # Create a fixed version of the method
    fixed_method = """async def search_users(self, query: str, user_type: Optional[str] = None) -> Dict[str, Any]:
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
    
    # Replace the method in the file
    new_content = content.replace(search_users_method, fixed_method)
    
    # Write the fixed content back to the file
    with open(admin_service_file, 'w') as f:
        f.write(new_content)
    
    print("Fixed the search_users method in admin_management_service.py")
    
    # Now let's fix the server.py file
    server_file = "/app/backend/server.py"
    
    # Read the file
    with open(server_file, 'r') as f:
        content = f.read()
    
    # Find the search_users function
    search_users_start = content.find('@api_router.get("/admin/users/search")')
    if search_users_start == -1:
        print("Could not find the search_users function in server.py")
        return False
    
    # Find the end of the function
    search_users_end = content.find('@api_router', search_users_start + 1)
    if search_users_end == -1:
        search_users_end = len(content)
    
    # Extract the function
    search_users_function = content[search_users_start:search_users_end]
    print(f"Found search_users function:\n{search_users_function}")
    
    # Create a fixed version of the function
    fixed_function = """@api_router.get("/admin/users/search")
async def search_users(query: str, user_type: Optional[str] = None):
    \"\"\"Search users by name, email, or other criteria\"\"\"
    try:
        result = await admin_management_service.search_users(query, user_type)
        if result.get('success'):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Search failed'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Search failed: {str(e)}")

"""
    
    # Replace the function in the file
    new_content = content.replace(search_users_function, fixed_function)
    
    # Write the fixed content back to the file
    with open(server_file, 'w') as f:
        f.write(new_content)
    
    print("Fixed the search_users function in server.py")
    
    return True

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

def main():
    """Main function"""
    print("Admin User Search Fix Tool")
    print("=========================")
    
    # Fix the issue
    if fix_admin_search():
        print("Applied fix to the admin user search functionality")
        
        # Test the fix
        if test_admin_search():
            print("Fix was successful! Admin user search is now working.")
        else:
            print("Fix was not successful. Admin user search is still not working.")
    else:
        print("Could not apply fix to the admin user search functionality")

if __name__ == "__main__":
    main()