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

def fix_indentation_issue():
    """Fix the indentation issue in admin_management_service.py"""
    admin_service_file = "/app/backend/admin_management_service.py"
    
    # Read the file
    with open(admin_service_file, 'r') as f:
        content = f.read()
    
    # Fix the indentation issue
    fixed_content = content.replace(
        """    async def approve_expert(self, expert_id: str, admin_notes: str = None) -> Dict[str, Any]:
        \"\"\"Approve expert application\"\"\"
        try:
            update_data = {
                "accountStatus": "active",""",
        """    async def approve_expert(self, expert_id: str, admin_notes: str = None) -> Dict[str, Any]:
        \"\"\"Approve expert application\"\"\"
        try:
            update_data = {
                "accountStatus": "active","""
    )
    
    # Write the fixed content back to the file
    with open(admin_service_file, 'w') as f:
        f.write(fixed_content)
    
    print("Fixed indentation issue in admin_management_service.py")
    
    return True

def main():
    """Main function"""
    print("Fixing indentation issue in admin_management_service.py")
    fix_indentation_issue()
    
    # Restart the backend service
    print("Restarting backend service...")
    os.system("sudo supervisorctl restart backend")
    
    # Wait for the backend to start
    print("Waiting for backend to start...")
    os.system("sleep 5")
    
    print("Done!")

if __name__ == "__main__":
    main()