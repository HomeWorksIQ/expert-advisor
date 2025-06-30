import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

class MemberProfileService:
    def __init__(self, db):
        self.db = db
    
    async def get_member_profile(self, member_id: str) -> Dict[str, Any]:
        """Get complete member profile"""
        try:
            # Get user data
            user = await self.db.users.find_one({"id": member_id})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            # Remove sensitive data
            profile_data = {
                "id": user['id'],
                "email": user['email'],
                "firstName": user.get('firstName'),
                "lastName": user.get('lastName'),
                "displayName": user.get('displayName'),
                "username": user.get('username'),
                "profileImage": user.get('profileImage'),
                "coverImage": user.get('coverImage'),
                "bio": user.get('bio'),
                "location": user.get('location'),
                "phone": user.get('phone'),
                "websiteUrl": user.get('websiteUrl'),
                "socialAccounts": user.get('socialAccounts'),
                "isVerified": user.get('isVerified', False),
                "accountStatus": user.get('accountStatus'),
                "preferences": user.get('preferences', {}),
                "createdAt": user.get('createdAt'),
                "lastSeen": user.get('lastSeen')
            }
            
            return {
                "success": True,
                "profile": profile_data
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get profile: {str(e)}"}
    
    async def update_member_profile(self, member_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update member profile"""
        try:
            # Check if user exists
            user = await self.db.users.find_one({"id": member_id})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            # Prepare update data
            update_fields = {}
            allowed_fields = [
                'firstName', 'lastName', 'displayName', 'bio', 'phone',
                'profileImage', 'coverImage', 'websiteUrl', 'location'
            ]
            
            for field in allowed_fields:
                if field in profile_data:
                    update_fields[field] = profile_data[field]
            
            # Update display name if first/last name changed
            if 'firstName' in update_fields or 'lastName' in update_fields:
                first_name = update_fields.get('firstName', user.get('firstName', ''))
                last_name = update_fields.get('lastName', user.get('lastName', ''))
                update_fields['displayName'] = f"{first_name} {last_name}".strip()
            
            update_fields['updatedAt'] = datetime.utcnow()
            
            # Update user document
            await self.db.users.update_one(
                {"id": member_id},
                {"$set": update_fields}
            )
            
            # Get updated profile
            updated_profile = await self.get_member_profile(member_id)
            
            return {
                "success": True,
                "message": "Profile updated successfully",
                "profile": updated_profile.get('profile')
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to update profile: {str(e)}"}
    
    async def get_member_preferences(self, member_id: str) -> Dict[str, Any]:
        """Get member preferences"""
        try:
            user = await self.db.users.find_one({"id": member_id}, {"preferences": 1})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            preferences = user.get('preferences', {})
            
            # Set default preferences if not exist
            default_preferences = {
                "emailNotifications": True,
                "smsNotifications": False,
                "marketingEmails": True,
                "locationSharing": True,
                "profileVisibility": "public",
                "showOnlineStatus": True,
                "allowDirectMessages": True,
                "preferredLanguage": "en",
                "timezone": "UTC",
                "currency": "USD"
            }
            
            # Merge with defaults
            for key, value in default_preferences.items():
                if key not in preferences:
                    preferences[key] = value
            
            return {
                "success": True,
                "preferences": preferences
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get preferences: {str(e)}"}
    
    async def update_member_preferences(self, member_id: str, preferences_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update member preferences"""
        try:
            # Check if user exists
            user = await self.db.users.find_one({"id": member_id})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            # Get current preferences
            current_preferences = user.get('preferences', {})
            
            # Update with new preferences
            current_preferences.update(preferences_data)
            
            # Update user document
            await self.db.users.update_one(
                {"id": member_id},
                {
                    "$set": {
                        "preferences": current_preferences,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            return {
                "success": True,
                "message": "Preferences updated successfully",
                "preferences": current_preferences
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to update preferences: {str(e)}"}
    
    async def get_member_dashboard(self, member_id: str) -> Dict[str, Any]:
        """Get member dashboard data"""
        try:
            # Get basic member info
            user = await self.db.users.find_one({"id": member_id})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            # Get credit balance
            try:
                from affiliate_credits_service import CreditService, AffiliateService
                credit_service = CreditService(self.db)
                affiliate_service = AffiliateService(self.db)
                
                credit_balance = await credit_service.get_credit_balance(member_id)
                affiliate_stats = await affiliate_service.get_referral_stats(member_id)
                
                # Get recent credit transactions
                recent_transactions = await credit_service.get_credit_history(member_id, 10)
                
            except Exception as e:
                print(f"Warning: Failed to get credit/affiliate data: {str(e)}")
                credit_balance = 0.0
                affiliate_stats = {}
                recent_transactions = []
            
            # Get member favorites count
            favorites_count = await self.db.member_favorites.count_documents({"memberId": member_id})
            
            # Get recent activity (mock for now)
            recent_activity = [
                {
                    "id": str(uuid.uuid4()),
                    "type": "profile_view",
                    "description": "Viewed Dr. Sarah Chen's profile",
                    "timestamp": datetime.utcnow() - timedelta(hours=2),
                    "expert": {"name": "Dr. Sarah Chen", "specialty": "Family Medicine"}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "search",
                    "description": "Searched for medical experts in Boston",
                    "timestamp": datetime.utcnow() - timedelta(hours=5),
                    "metadata": {"category": "medical", "location": "Boston"}
                }
            ]
            
            dashboard_data = {
                "member": {
                    "id": user['id'],
                    "firstName": user.get('firstName'),
                    "lastName": user.get('lastName'),
                    "displayName": user.get('displayName'),
                    "profileImage": user.get('profileImage'),
                    "memberSince": user.get('createdAt'),
                    "accountStatus": user.get('accountStatus'),
                    "isVerified": user.get('isVerified', False)
                },
                "credits": {
                    "balance": credit_balance,
                    "recent_transactions": [t.dict() if hasattr(t, 'dict') else t for t in recent_transactions]
                },
                "affiliate": affiliate_stats,
                "favorites": {
                    "count": favorites_count
                },
                "activity": {
                    "recent": recent_activity
                },
                "stats": {
                    "profile_views": favorites_count * 3,  # Mock calculation
                    "searches_this_month": 12,  # Mock data
                    "experts_contacted": 5  # Mock data
                }
            }
            
            return {
                "success": True,
                "dashboard": dashboard_data
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get dashboard: {str(e)}"}
    
    async def get_member_favorites(self, member_id: str) -> Dict[str, Any]:
        """Get member's favorite experts"""
        try:
            # Get favorites
            favorites_cursor = self.db.member_favorites.find({"memberId": member_id}).sort("createdAt", -1)
            favorites = await favorites_cursor.to_list(100)
            
            # Get expert details for each favorite
            expert_ids = [fav['expertId'] for fav in favorites]
            experts_cursor = self.db.users.find({"id": {"$in": expert_ids}, "userType": "expert"})
            experts = await experts_cursor.to_list(100)
            
            # Create expert lookup
            expert_lookup = {expert['id']: expert for expert in experts}
            
            # Combine favorites with expert data
            favorites_with_experts = []
            for favorite in favorites:
                expert = expert_lookup.get(favorite['expertId'])
                if expert:
                    favorites_with_experts.append({
                        "favorite_id": favorite['id'],
                        "expert": {
                            "id": expert['id'],
                            "firstName": expert.get('firstName'),
                            "lastName": expert.get('lastName'),
                            "displayName": expert.get('displayName'),
                            "profileImage": expert.get('profileImage'),
                            "expertiseCategory": expert.get('expertiseCategory'),
                            "specializations": expert.get('specializations', []),
                            "credentials": expert.get('credentials', []),
                            "yearsOfExperience": expert.get('yearsOfExperience'),
                            "bio": expert.get('bio')
                        },
                        "added_at": favorite['createdAt']
                    })
            
            return {
                "success": True,
                "favorites": favorites_with_experts,
                "total": len(favorites_with_experts)
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get favorites: {str(e)}"}
    
    async def add_favorite_expert(self, member_id: str, expert_id: str) -> Dict[str, Any]:
        """Add expert to member's favorites"""
        try:
            # Check if expert exists
            expert = await self.db.users.find_one({"id": expert_id, "userType": "expert"})
            if not expert:
                return {"success": False, "message": "Expert not found"}
            
            # Check if already favorited
            existing = await self.db.member_favorites.find_one({
                "memberId": member_id,
                "expertId": expert_id
            })
            if existing:
                return {"success": False, "message": "Expert already in favorites"}
            
            # Add favorite
            favorite_data = {
                "id": str(uuid.uuid4()),
                "memberId": member_id,
                "expertId": expert_id,
                "createdAt": datetime.utcnow()
            }
            
            await self.db.member_favorites.insert_one(favorite_data)
            
            return {
                "success": True,
                "message": "Expert added to favorites",
                "favorite_id": favorite_data['id']
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to add favorite: {str(e)}"}
    
    async def remove_favorite_expert(self, member_id: str, expert_id: str) -> Dict[str, Any]:
        """Remove expert from member's favorites"""
        try:
            result = await self.db.member_favorites.delete_one({
                "memberId": member_id,
                "expertId": expert_id
            })
            
            if result.deleted_count > 0:
                return {
                    "success": True,
                    "message": "Expert removed from favorites"
                }
            else:
                return {"success": False, "message": "Favorite not found"}
                
        except Exception as e:
            return {"success": False, "message": f"Failed to remove favorite: {str(e)}"}
    
    async def get_member_activity(self, member_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get member activity history"""
        try:
            # In a real implementation, this would track actual user activity
            # For now, return mock activity data
            
            mock_activities = [
                {
                    "id": str(uuid.uuid4()),
                    "type": "profile_view",
                    "description": "Viewed Dr. Sarah Chen's profile",
                    "timestamp": datetime.utcnow() - timedelta(hours=2),
                    "metadata": {"expert_id": "1", "expert_name": "Dr. Sarah Chen"}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "search",
                    "description": "Searched for medical experts in Boston",
                    "timestamp": datetime.utcnow() - timedelta(hours=5),
                    "metadata": {"category": "medical", "location": "Boston", "results": 8}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "favorite_added",
                    "description": "Added Dr. Michael Rodriguez to favorites",
                    "timestamp": datetime.utcnow() - timedelta(hours=8),
                    "metadata": {"expert_id": "2", "expert_name": "Dr. Michael Rodriguez"}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "credit_earned",
                    "description": "Earned $10 credits from referral",
                    "timestamp": datetime.utcnow() - timedelta(days=1),
                    "metadata": {"amount": 10.0, "source": "referral"}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "profile_update",
                    "description": "Updated profile information",
                    "timestamp": datetime.utcnow() - timedelta(days=3),
                    "metadata": {"fields_updated": ["bio", "location"]}
                }
            ]
            
            return {
                "success": True,
                "activity": mock_activities[:limit],
                "total": len(mock_activities)
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get activity: {str(e)}"}
    
    async def delete_member_account(self, member_id: str) -> Dict[str, Any]:
        """Delete member account (soft delete)"""
        try:
            # Check if user exists
            user = await self.db.users.find_one({"id": member_id})
            if not user:
                return {"success": False, "message": "Member not found"}
            
            # Soft delete - mark as deleted instead of removing
            await self.db.users.update_one(
                {"id": member_id},
                {
                    "$set": {
                        "accountStatus": "deleted",
                        "deletedAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            # Invalidate all sessions
            await self.db.member_sessions.update_many(
                {"userId": member_id},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            # Note: In a production system, you might also want to:
            # - Remove or anonymize personal data according to GDPR
            # - Handle affiliate/credit account cleanup
            # - Cancel any active subscriptions
            # - Notify relevant services
            
            return {
                "success": True,
                "message": "Account deleted successfully"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to delete account: {str(e)}"}