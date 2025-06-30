import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from passlib.context import CryptContext
from jose import JWTError, jwt
import os

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Longer session for admins

class AdminAuthService:
    def __init__(self, db):
        self.db = db
        
    async def create_admin_user(self, admin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new admin user (super admin only)"""
        try:
            email = admin_data.get('email', '').lower().strip()
            password = admin_data.get('password', '')
            first_name = admin_data.get('firstName', '')
            last_name = admin_data.get('lastName', '')
            role = admin_data.get('role', 'admin')
            created_by = admin_data.get('createdBy', 'system')
            
            # Validation
            if not email or not password or not first_name or not last_name:
                return {"success": False, "message": "Missing required fields"}
            
            if len(password) < 10:
                return {"success": False, "message": "Admin password must be at least 10 characters"}
            
            # Check if admin already exists
            existing_admin = await self.db.users.find_one({"email": email, "userType": "admin"})
            if existing_admin:
                return {"success": False, "message": "Admin with this email already exists"}
            
            # Generate admin ID
            admin_id = str(uuid.uuid4())
            
            # Hash password
            hashed_password = pwd_context.hash(password)
            
            # Create admin user document
            admin_user_data = {
                "id": admin_id,
                "email": email,
                "password": hashed_password,
                "firstName": first_name,
                "lastName": last_name,
                "displayName": f"{first_name} {last_name}",
                "username": email,
                "userType": "admin",
                "adminRole": role,
                "permissions": self._get_default_permissions(role),
                "isVerified": True,  # Admins are pre-verified
                "isIdVerified": True,
                "accountStatus": "active",
                "createdBy": created_by,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "lastSeen": None,
                "preferences": {
                    "emailNotifications": True,
                    "securityAlerts": True,
                    "systemUpdates": True
                }
            }
            
            # Insert admin into database
            await self.db.users.insert_one(admin_user_data)
            
            return {
                "success": True,
                "message": "Admin user created successfully",
                "admin_id": admin_id,
                "role": role
            }
            
        except Exception as e:
            return {"success": False, "message": f"Admin creation failed: {str(e)}"}
    
    async def login_admin(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate admin login"""
        try:
            email = email.lower().strip()
            
            # Find admin by email
            admin = await self.db.users.find_one({"email": email, "userType": "admin"})
            if not admin:
                return {"success": False, "message": "Invalid admin credentials"}
            
            # Verify password
            if not pwd_context.verify(password, admin.get('password', '')):
                return {"success": False, "message": "Invalid admin credentials"}
            
            # Check account status
            if admin.get('accountStatus') != 'active':
                return {"success": False, "message": "Admin account is not active"}
            
            # Generate access token
            token_data = {
                "sub": admin['id'],
                "email": admin['email'],
                "user_type": "admin",
                "admin_role": admin.get('adminRole', 'admin'),
                "permissions": admin.get('permissions', [])
            }
            access_token = self._create_admin_access_token(token_data)
            
            # Create admin session record
            session_id = str(uuid.uuid4())
            session_data = {
                "id": session_id,
                "userId": admin['id'],
                "sessionToken": access_token,
                "sessionType": "admin",
                "createdAt": datetime.utcnow(),
                "expiresAt": datetime.utcnow() + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES),
                "isActive": True,
                "ipAddress": None,  # Could be populated from request
                "userAgent": None
            }
            await self.db.admin_sessions.insert_one(session_data)
            
            # Update last seen
            await self.db.users.update_one(
                {"id": admin['id']},
                {"$set": {"lastSeen": datetime.utcnow()}}
            )
            
            # Create admin response (remove sensitive data)
            admin_response = {
                "id": admin['id'],
                "email": admin['email'],
                "firstName": admin.get('firstName'),
                "lastName": admin.get('lastName'),
                "displayName": admin.get('displayName'),
                "adminRole": admin.get('adminRole'),
                "permissions": admin.get('permissions', []),
                "accountStatus": admin.get('accountStatus')
            }
            
            return {
                "success": True,
                "message": "Admin login successful",
                "admin": admin_response,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "session_id": session_id
            }
            
        except Exception as e:
            return {"success": False, "message": f"Admin login failed: {str(e)}"}
    
    async def logout_admin(self, session_token: str) -> Dict[str, Any]:
        """Logout admin and invalidate session"""
        try:
            # Invalidate admin session
            result = await self.db.admin_sessions.update_one(
                {"sessionToken": session_token, "isActive": True},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                return {"success": True, "message": "Admin logout successful"}
            else:
                return {"success": False, "message": "Invalid or expired admin session"}
                
        except Exception as e:
            return {"success": False, "message": f"Admin logout failed: {str(e)}"}
    
    async def change_admin_password(self, admin_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """Change admin password"""
        try:
            if len(new_password) < 10:
                return {"success": False, "message": "Admin password must be at least 10 characters"}
            
            # Find admin
            admin = await self.db.users.find_one({"id": admin_id, "userType": "admin"})
            if not admin:
                return {"success": False, "message": "Admin not found"}
            
            # Verify old password
            if not pwd_context.verify(old_password, admin.get('password', '')):
                return {"success": False, "message": "Current password is incorrect"}
            
            # Hash new password
            hashed_password = pwd_context.hash(new_password)
            
            # Update password
            await self.db.users.update_one(
                {"id": admin_id},
                {
                    "$set": {
                        "password": hashed_password,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            # Invalidate all admin sessions for security
            await self.db.admin_sessions.update_many(
                {"userId": admin_id, "isActive": True},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            return {
                "success": True,
                "message": "Admin password changed successfully. Please login again."
            }
            
        except Exception as e:
            return {"success": False, "message": f"Password change failed: {str(e)}"}
    
    async def get_admin_profile(self, admin_id: str) -> Dict[str, Any]:
        """Get admin profile"""
        try:
            admin = await self.db.users.find_one({"id": admin_id, "userType": "admin"})
            if not admin:
                return {"success": False, "message": "Admin not found"}
            
            # Remove sensitive data
            profile_data = {
                "id": admin['id'],
                "email": admin['email'],
                "firstName": admin.get('firstName'),
                "lastName": admin.get('lastName'),
                "displayName": admin.get('displayName'),
                "adminRole": admin.get('adminRole'),
                "permissions": admin.get('permissions', []),
                "accountStatus": admin.get('accountStatus'),
                "createdAt": admin.get('createdAt'),
                "lastSeen": admin.get('lastSeen'),
                "createdBy": admin.get('createdBy')
            }
            
            return {
                "success": True,
                "profile": profile_data
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get admin profile: {str(e)}"}
    
    async def list_admin_users(self) -> Dict[str, Any]:
        """List all admin users"""
        try:
            admins_cursor = self.db.users.find({"userType": "admin"}).sort("createdAt", -1)
            admins = await admins_cursor.to_list(100)
            
            # Remove sensitive data
            admin_list = []
            for admin in admins:
                admin_list.append({
                    "id": admin['id'],
                    "email": admin['email'],
                    "firstName": admin.get('firstName'),
                    "lastName": admin.get('lastName'),
                    "displayName": admin.get('displayName'),
                    "adminRole": admin.get('adminRole'),
                    "accountStatus": admin.get('accountStatus'),
                    "createdAt": admin.get('createdAt'),
                    "lastSeen": admin.get('lastSeen'),
                    "createdBy": admin.get('createdBy')
                })
            
            return {
                "success": True,
                "admins": admin_list,
                "total": len(admin_list)
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to list admins: {str(e)}"}
    
    def _create_admin_access_token(self, data: dict) -> str:
        """Create JWT access token for admin"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def _get_default_permissions(self, role: str) -> List[str]:
        """Get default permissions for admin role"""
        permissions_map = {
            "super_admin": [
                "user_management", "expert_management", "financial_management",
                "analytics_access", "system_settings", "admin_management",
                "content_management", "security_management"
            ],
            "admin": [
                "user_management", "expert_management", "financial_management",
                "analytics_access", "content_management"
            ],
            "moderator": [
                "user_management", "expert_management", "content_management"
            ],
            "support": [
                "user_management", "expert_management"
            ]
        }
        
        return permissions_map.get(role, permissions_map["admin"])
    
    async def create_default_admin(self) -> Dict[str, Any]:
        """Create default admin user if none exists"""
        try:
            # Check if any admin exists
            existing_admin = await self.db.users.find_one({"userType": "admin"})
            if existing_admin:
                return {"success": False, "message": "Admin user already exists"}
            
            # Create default admin
            default_admin_data = {
                "email": "admin@theexperts.com",
                "password": "AdminPassword123!",
                "firstName": "Super",
                "lastName": "Admin",
                "role": "super_admin",
                "createdBy": "system"
            }
            
            result = await self.create_admin_user(default_admin_data)
            
            if result.get('success'):
                return {
                    "success": True,
                    "message": "Default admin created successfully",
                    "email": "admin@theexperts.com",
                    "password": "AdminPassword123!",
                    "note": "Please change the default password immediately"
                }
            else:
                return result
                
        except Exception as e:
            return {"success": False, "message": f"Failed to create default admin: {str(e)}"}