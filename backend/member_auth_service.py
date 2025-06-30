import uuid
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
import os

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class MemberAuthService:
    def __init__(self, db):
        self.db = db
        
    async def register_member(self, registration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new member with email/password"""
        try:
            email = registration_data.get('email', '').lower().strip()
            password = registration_data.get('password', '')
            first_name = registration_data.get('firstName', '')
            last_name = registration_data.get('lastName', '')
            agrees_to_terms = registration_data.get('agreesToTerms', False)
            
            # Validation
            if not email or not password or not first_name or not last_name:
                return {"success": False, "message": "Missing required fields"}
            
            if not agrees_to_terms:
                return {"success": False, "message": "Must agree to terms of service"}
            
            if len(password) < 8:
                return {"success": False, "message": "Password must be at least 8 characters"}
            
            # Check if user already exists
            existing_user = await self.db.users.find_one({"email": email})
            if existing_user:
                return {"success": False, "message": "User with this email already exists"}
            
            # Generate user ID and verification token
            user_id = str(uuid.uuid4())
            email_verification_token = self._generate_verification_token()
            
            # Hash password
            hashed_password = pwd_context.hash(password)
            
            # Create user document
            user_data = {
                "id": user_id,
                "email": email,
                "password": hashed_password,
                "firstName": first_name,
                "lastName": last_name,
                "displayName": f"{first_name} {last_name}",
                "username": email,  # Use email as username for now
                "userType": "member",
                "isVerified": False,
                "isIdVerified": False,
                "isBankVerified": False,
                "accountStatus": "pending_verification",
                "emailVerificationToken": email_verification_token,
                "emailVerificationExpires": datetime.utcnow() + timedelta(hours=24),
                "agreesToTerms": agrees_to_terms,
                "termsAcceptedAt": datetime.utcnow(),
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "preferences": {
                    "emailNotifications": True,
                    "smsNotifications": False,
                    "marketingEmails": True,
                    "locationSharing": True
                }
            }
            
            # Insert user into database
            await self.db.users.insert_one(user_data)
            
            # Send verification email
            email_sent = await self._send_verification_email(email, first_name, email_verification_token)
            
            # Create affiliate account automatically
            try:
                from affiliate_credits_service import AffiliateService, CreditService
                affiliate_service = AffiliateService(self.db)
                credit_service = CreditService(self.db)
                
                # Create affiliate account
                await affiliate_service.create_affiliate_account(user_id)
                
                # Create credit account
                await credit_service.create_credit_account(user_id)
                
            except Exception as e:
                print(f"Warning: Failed to create affiliate/credit accounts: {str(e)}")
            
            return {
                "success": True,
                "message": "Registration successful. Please check your email to verify your account.",
                "user_id": user_id,
                "email_sent": email_sent,
                "verification_required": True
            }
            
        except Exception as e:
            return {"success": False, "message": f"Registration failed: {str(e)}"}
    
    async def login_member(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate member login"""
        try:
            email = email.lower().strip()
            
            # Find user by email
            user = await self.db.users.find_one({"email": email})
            if not user:
                return {"success": False, "message": "Invalid email or password"}
            
            # Verify password
            if not pwd_context.verify(password, user.get('password', '')):
                return {"success": False, "message": "Invalid email or password"}
            
            # Check account status
            if user.get('accountStatus') == 'suspended':
                return {"success": False, "message": "Account is suspended. Contact support."}
            
            # Generate access token
            token_data = {
                "sub": user['id'],
                "email": user['email'],
                "user_type": user.get('userType', 'member'),
                "verified": user.get('isVerified', False)
            }
            access_token = self._create_access_token(token_data)
            
            # Create session record
            session_id = str(uuid.uuid4())
            session_data = {
                "id": session_id,
                "userId": user['id'],
                "sessionToken": access_token,
                "createdAt": datetime.utcnow(),
                "expiresAt": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
                "isActive": True,
                "deviceInfo": None  # Could be populated from request headers
            }
            await self.db.member_sessions.insert_one(session_data)
            
            # Update last seen
            await self.db.users.update_one(
                {"id": user['id']},
                {"$set": {"lastSeen": datetime.utcnow()}}
            )
            
            # Remove sensitive data from response
            user_response = {
                "id": user['id'],
                "email": user['email'],
                "firstName": user.get('firstName'),
                "lastName": user.get('lastName'),
                "displayName": user.get('displayName'),
                "userType": user.get('userType'),
                "isVerified": user.get('isVerified', False),
                "profileImage": user.get('profileImage'),
                "accountStatus": user.get('accountStatus')
            }
            
            return {
                "success": True,
                "message": "Login successful",
                "user": user_response,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "session_id": session_id
            }
            
        except Exception as e:
            return {"success": False, "message": f"Login failed: {str(e)}"}
    
    async def logout_member(self, session_token: str) -> Dict[str, Any]:
        """Logout member and invalidate session"""
        try:
            # Invalidate session
            result = await self.db.member_sessions.update_one(
                {"sessionToken": session_token, "isActive": True},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                return {"success": True, "message": "Logout successful"}
            else:
                return {"success": False, "message": "Invalid or expired session"}
                
        except Exception as e:
            return {"success": False, "message": f"Logout failed: {str(e)}"}
    
    async def verify_email(self, verification_token: str) -> Dict[str, Any]:
        """Verify member email address"""
        try:
            # Find user by verification token
            user = await self.db.users.find_one({
                "emailVerificationToken": verification_token,
                "emailVerificationExpires": {"$gt": datetime.utcnow()}
            })
            
            if not user:
                return {"success": False, "message": "Invalid or expired verification token"}
            
            # Update user verification status
            await self.db.users.update_one(
                {"id": user['id']},
                {
                    "$set": {
                        "isVerified": True,
                        "accountStatus": "active",
                        "updatedAt": datetime.utcnow()
                    },
                    "$unset": {
                        "emailVerificationToken": "",
                        "emailVerificationExpires": ""
                    }
                }
            )
            
            return {
                "success": True,
                "message": "Email verified successfully. Your account is now active."
            }
            
        except Exception as e:
            return {"success": False, "message": f"Email verification failed: {str(e)}"}
    
    async def forgot_password(self, email: str) -> Dict[str, Any]:
        """Initiate password reset process"""
        try:
            email = email.lower().strip()
            
            # Find user by email
            user = await self.db.users.find_one({"email": email})
            if not user:
                # Don't reveal if email exists or not for security
                return {
                    "success": True,
                    "message": "If an account with this email exists, a password reset link has been sent."
                }
            
            # Generate password reset token
            reset_token = self._generate_verification_token()
            reset_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
            
            # Update user with reset token
            await self.db.users.update_one(
                {"id": user['id']},
                {
                    "$set": {
                        "passwordResetToken": reset_token,
                        "passwordResetExpires": reset_expires,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            # Send password reset email
            email_sent = await self._send_password_reset_email(
                email, 
                user.get('firstName', 'User'), 
                reset_token
            )
            
            return {
                "success": True,
                "message": "If an account with this email exists, a password reset link has been sent.",
                "email_sent": email_sent
            }
            
        except Exception as e:
            return {"success": False, "message": f"Password reset request failed: {str(e)}"}
    
    async def reset_password(self, reset_token: str, new_password: str) -> Dict[str, Any]:
        """Reset member password"""
        try:
            if len(new_password) < 8:
                return {"success": False, "message": "Password must be at least 8 characters"}
            
            # Find user by reset token
            user = await self.db.users.find_one({
                "passwordResetToken": reset_token,
                "passwordResetExpires": {"$gt": datetime.utcnow()}
            })
            
            if not user:
                return {"success": False, "message": "Invalid or expired reset token"}
            
            # Hash new password
            hashed_password = pwd_context.hash(new_password)
            
            # Update user password and remove reset token
            await self.db.users.update_one(
                {"id": user['id']},
                {
                    "$set": {
                        "password": hashed_password,
                        "updatedAt": datetime.utcnow()
                    },
                    "$unset": {
                        "passwordResetToken": "",
                        "passwordResetExpires": ""
                    }
                }
            )
            
            # Invalidate all active sessions for security
            await self.db.member_sessions.update_many(
                {"userId": user['id'], "isActive": True},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            return {
                "success": True,
                "message": "Password reset successful. Please login with your new password."
            }
            
        except Exception as e:
            return {"success": False, "message": f"Password reset failed: {str(e)}"}
    
    async def change_password(self, user_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """Change member password (authenticated)"""
        try:
            if len(new_password) < 8:
                return {"success": False, "message": "Password must be at least 8 characters"}
            
            # Find user
            user = await self.db.users.find_one({"id": user_id})
            if not user:
                return {"success": False, "message": "User not found"}
            
            # Verify old password
            if not pwd_context.verify(old_password, user.get('password', '')):
                return {"success": False, "message": "Current password is incorrect"}
            
            # Hash new password
            hashed_password = pwd_context.hash(new_password)
            
            # Update password
            await self.db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "password": hashed_password,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            return {
                "success": True,
                "message": "Password changed successfully"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Password change failed: {str(e)}"}
    
    def _create_access_token(self, data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def _generate_verification_token(self) -> str:
        """Generate a secure verification token"""
        return secrets.token_urlsafe(32)
    
    async def _send_verification_email(self, email: str, first_name: str, token: str) -> bool:
        """Send email verification email"""
        try:
            subject = "Verify Your Email - The Experts Platform"
            verification_url = f"https://theexperts.com/verify-email?token={token}"
            
            body = f"""
            Hi {first_name},
            
            Welcome to The Experts! Please verify your email address by clicking the link below:
            
            {verification_url}
            
            This link will expire in 24 hours.
            
            If you didn't create an account with us, please ignore this email.
            
            Best regards,
            The Experts Team
            """
            
            # In production, implement actual email sending
            # For now, just log the email content
            print(f"VERIFICATION EMAIL for {email}:")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            
            return True  # Simulate successful email sending
            
        except Exception as e:
            print(f"Failed to send verification email: {str(e)}")
            return False
    
    async def _send_password_reset_email(self, email: str, first_name: str, token: str) -> bool:
        """Send password reset email"""
        try:
            subject = "Reset Your Password - The Experts Platform"
            reset_url = f"https://theexperts.com/reset-password?token={token}"
            
            body = f"""
            Hi {first_name},
            
            You requested to reset your password for The Experts platform. Click the link below to reset your password:
            
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, please ignore this email.
            
            Best regards,
            The Experts Team
            """
            
            # In production, implement actual email sending
            # For now, just log the email content
            print(f"PASSWORD RESET EMAIL for {email}:")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            
            return True  # Simulate successful email sending
            
        except Exception as e:
            print(f"Failed to send password reset email: {str(e)}")
            return False