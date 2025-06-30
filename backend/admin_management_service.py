import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from collections import defaultdict

class AdminManagementService:
    def __init__(self, db):
        self.db = db
    
    # =============================================================================
    # USER MANAGEMENT
    # =============================================================================
    
    async def get_all_users(self, user_type: Optional[str] = None, page: int = 1, limit: int = 50) -> Dict[str, Any]:
        """Get all users with pagination and filtering"""
        try:
            # Build query
            query = {}
            if user_type:
                query["userType"] = user_type
            
            # Calculate pagination
            skip = (page - 1) * limit
            
            # Get users
            users_cursor = self.db.users.find(query).sort("createdAt", -1).skip(skip).limit(limit)
            users = await users_cursor.to_list(limit)
            
            # Get total count
            total_count = await self.db.users.count_documents(query)
            
            # Format user data (remove sensitive info)
            user_list = []
            for user in users:
                user_data = {
                    "id": user['id'],
                    "email": user['email'],
                    "firstName": user.get('firstName'),
                    "lastName": user.get('lastName'),
                    "displayName": user.get('displayName'),
                    "userType": user.get('userType'),
                    "accountStatus": user.get('accountStatus'),
                    "isVerified": user.get('isVerified', False),
                    "createdAt": user.get('createdAt'),
                    "lastSeen": user.get('lastSeen'),
                    "expertiseCategory": user.get('expertiseCategory'),
                    "yearsOfExperience": user.get('yearsOfExperience')
                }
                user_list.append(user_data)
            
            return {
                "success": True,
                "users": user_list,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_count,
                    "pages": (total_count + limit - 1) // limit
                }
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get users: {str(e)}"}
    
    async def get_user_details(self, user_id: str) -> Dict[str, Any]:
        """Get detailed user information"""
        try:
            user = await self.db.users.find_one({"id": user_id})
            if not user:
                return {"success": False, "message": "User not found"}
            
            # Get additional data based on user type
            additional_data = {}
            
            if user.get('userType') == 'member':
                # Get member-specific data
                favorites_count = await self.db.member_favorites.count_documents({"memberId": user_id})
                additional_data["favorites_count"] = favorites_count
            
            elif user.get('userType') == 'expert':
                # Get expert-specific data
                # Mock data for now - in real implementation would get from bookings/reviews
                additional_data["total_consultations"] = 25
                additional_data["average_rating"] = 4.7
                additional_data["total_earnings"] = 2500.0
            
            # Get affiliate data if exists
            try:
                from affiliate_credits_service import AffiliateService, CreditService
                affiliate_service = AffiliateService(self.db)
                credit_service = CreditService(self.db)
                
                affiliate_stats = await affiliate_service.get_referral_stats(user_id)
                credit_balance = await credit_service.get_credit_balance(user_id)
                
                additional_data["affiliate_stats"] = affiliate_stats
                additional_data["credit_balance"] = credit_balance
            except:
                pass
            
            # Remove sensitive data
            user_details = {
                "id": user['id'],
                "email": user['email'],
                "firstName": user.get('firstName'),
                "lastName": user.get('lastName'),
                "displayName": user.get('displayName'),
                "username": user.get('username'),
                "userType": user.get('userType'),
                "profileImage": user.get('profileImage'),
                "bio": user.get('bio'),
                "location": user.get('location'),
                "phone": user.get('phone'),
                "accountStatus": user.get('accountStatus'),
                "isVerified": user.get('isVerified', False),
                "isIdVerified": user.get('isIdVerified', False),
                "createdAt": user.get('createdAt'),
                "updatedAt": user.get('updatedAt'),
                "lastSeen": user.get('lastSeen'),
                "preferences": user.get('preferences'),
                
                # Expert-specific fields
                "expertiseCategory": user.get('expertiseCategory'),
                "expertiseLevel": user.get('expertiseLevel'),
                "specializations": user.get('specializations'),
                "credentials": user.get('credentials'),
                "yearsOfExperience": user.get('yearsOfExperience'),
                "education": user.get('education'),
                "licenses": user.get('licenses'),
                
                # Additional computed data
                **additional_data
            }
            
            return {
                "success": True,
                "user": user_details
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get user details: {str(e)}"}
    
    async def update_user_status(self, user_id: str, status: str, reason: str = None) -> Dict[str, Any]:
        """Update user account status"""
        try:
            valid_statuses = ["active", "suspended", "pending", "deleted", "pending_verification"]
            if status not in valid_statuses:
                return {"success": False, "message": f"Invalid status. Must be one of: {valid_statuses}"}
            
            update_data = {
                "accountStatus": status,
                "updatedAt": datetime.utcnow()
            }
            
            if reason:
                update_data["statusReason"] = reason
            
            result = await self.db.users.update_one(
                {"id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # If suspending user, invalidate their sessions
                if status == "suspended":
                    await self.db.member_sessions.update_many(
                        {"userId": user_id},
                        {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
                    )
                
                return {
                    "success": True,
                    "message": f"User status updated to {status}"
                }
            else:
                return {"success": False, "message": "User not found or no changes made"}
                
        except Exception as e:
            return {"success": False, "message": f"Failed to update user status: {str(e)}"}
    
    async def verify_user_account(self, user_id: str, verification_type: str) -> Dict[str, Any]:
        """Verify user account (email, ID, bank)"""
        try:
            valid_types = ["email", "id", "bank"]
            if verification_type not in valid_types:
                return {"success": False, "message": f"Invalid verification type. Must be one of: {valid_types}"}
            
            update_field = f"is{verification_type.title()}Verified"
            
            result = await self.db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        update_field: True,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                return {
                    "success": True,
                    "message": f"User {verification_type} verification completed"
                }
            else:
                return {"success": False, "message": "User not found"}
                
        except Exception as e:
            return {"success": False, "message": f"Failed to verify user: {str(e)}"}
    
    async def search_users(self, query: str, user_type: Optional[str] = None) -> Dict[str, Any]:
        """Search users by name, email, or other criteria"""
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
async def get_pending_experts(self) -> Dict[str, Any]:
        """Get experts pending approval"""
        try:
            experts_cursor = self.db.users.find({
                "userType": "expert",
                "accountStatus": {"$in": ["pending", "pending_verification"]}
            }).sort("createdAt", -1)
            
            experts = await experts_cursor.to_list(100)
            
            pending_experts = []
            for expert in experts:
                pending_experts.append({
                    "id": expert['id'],
                    "email": expert['email'],
                    "firstName": expert.get('firstName'),
                    "lastName": expert.get('lastName'),
                    "displayName": expert.get('displayName'),
                    "expertiseCategory": expert.get('expertiseCategory'),
                    "specializations": expert.get('specializations'),
                    "credentials": expert.get('credentials'),
                    "yearsOfExperience": expert.get('yearsOfExperience'),
                    "education": expert.get('education'),
                    "accountStatus": expert.get('accountStatus'),
                    "createdAt": expert.get('createdAt')
                })
            
            return {
                "success": True,
                "pending_experts": pending_experts,
                "total": len(pending_experts)
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get pending experts: {str(e)}"}
    
    async def approve_expert(self, expert_id: str, admin_notes: str = None) -> Dict[str, Any]:
        """Approve expert application"""
        try:
            update_data = {
                "accountStatus": "active",
                "isVerified": True,
                "approvedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["approvalNotes"] = admin_notes
            
            result = await self.db.users.update_one(
                {"id": expert_id, "userType": "expert"},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return {
                    "success": True,
                    "message": "Expert approved successfully"
                }
            else:
                return {"success": False, "message": "Expert not found"}
                
        except Exception as e:
            return {"success": False, "message": f"Failed to approve expert: {str(e)}"}
    
    async def reject_expert(self, expert_id: str, rejection_reason: str) -> Dict[str, Any]:
        """Reject expert application"""
        try:
            update_data = {
                "accountStatus": "rejected",
                "rejectedAt": datetime.utcnow(),
                "rejectionReason": rejection_reason,
                "updatedAt": datetime.utcnow()
            }
            
            result = await self.db.users.update_one(
                {"id": expert_id, "userType": "expert"},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return {
                    "success": True,
                    "message": "Expert application rejected"
                }
            else:
                return {"success": False, "message": "Expert not found"}
                
        except Exception as e:
            return {"success": False, "message": f"Failed to reject expert: {str(e)}"}
    
    # =============================================================================
    # FINANCIAL MANAGEMENT
    # =============================================================================
    
    async def get_financial_overview(self) -> Dict[str, Any]:
        """Get financial dashboard overview"""
        try:
            # Get credit transactions summary
            credit_pipeline = [
                {"$group": {
                    "_id": "$transactionType",
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }}
            ]
            
            credit_stats = await self.db.credit_transactions.aggregate(credit_pipeline).to_list(100)
            
            # Get payout requests summary
            payout_pipeline = [
                {"$group": {
                    "_id": "$status",
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }}
            ]
            
            payout_stats = await self.db.payout_requests.aggregate(payout_pipeline).to_list(100)
            
            # Calculate totals
            total_credits_issued = sum(stat["total_amount"] for stat in credit_stats if stat["_id"] in ["earned_referral", "earned_signup_bonus"])
            total_credits_spent = abs(sum(stat["total_amount"] for stat in credit_stats if stat["_id"] == "spent_purchase"))
            total_payouts_requested = sum(stat["total_amount"] for stat in payout_stats)
            total_payouts_completed = sum(stat["total_amount"] for stat in payout_stats if stat["_id"] == "completed")
            
            # Get user counts
            total_members = await self.db.users.count_documents({"userType": "member"})
            total_experts = await self.db.users.count_documents({"userType": "expert"})
            active_members = await self.db.users.count_documents({"userType": "member", "accountStatus": "active"})
            active_experts = await self.db.users.count_documents({"userType": "expert", "accountStatus": "active"})
            
            return {
                "success": True,
                "financial_overview": {
                    "credits": {
                        "total_issued": total_credits_issued,
                        "total_spent": total_credits_spent,
                        "outstanding_balance": total_credits_issued - total_credits_spent
                    },
                    "payouts": {
                        "total_requested": total_payouts_requested,
                        "total_completed": total_payouts_completed,
                        "pending_amount": total_payouts_requested - total_payouts_completed
                    },
                    "users": {
                        "total_members": total_members,
                        "active_members": active_members,
                        "total_experts": total_experts,
                        "active_experts": active_experts
                    },
                    "metrics": {
                        "member_conversion_rate": (active_members / max(total_members, 1)) * 100,
                        "expert_approval_rate": (active_experts / max(total_experts, 1)) * 100
                    }
                }
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get financial overview: {str(e)}"}
    
    async def get_transaction_history(self, transaction_type: str = "all", limit: int = 100) -> Dict[str, Any]:
        """Get transaction history"""
        try:
            transactions = []
            
            # Get credit transactions
            if transaction_type in ["all", "credits"]:
                credit_cursor = self.db.credit_transactions.find({}).sort("createdAt", -1).limit(limit)
                credit_transactions = await credit_cursor.to_list(limit)
                
                for txn in credit_transactions:
                    transactions.append({
                        "id": txn['id'],
                        "type": "credit",
                        "user_id": txn['userId'],
                        "amount": txn['amount'],
                        "description": txn['description'],
                        "status": txn.get('status', 'completed'),
                        "created_at": txn['createdAt']
                    })
            
            # Get payout requests
            if transaction_type in ["all", "payouts"]:
                payout_cursor = self.db.payout_requests.find({}).sort("createdAt", -1).limit(limit)
                payout_requests = await payout_cursor.to_list(limit)
                
                for payout in payout_requests:
                    transactions.append({
                        "id": payout['id'],
                        "type": "payout",
                        "user_id": payout['expertId'],
                        "amount": -payout['amount'],  # Negative for outgoing
                        "description": f"Payout request - {payout.get('description', 'Expert earnings')}",
                        "status": payout['status'],
                        "created_at": payout['createdAt']
                    })
            
            # Sort by created_at
            transactions.sort(key=lambda x: x['created_at'], reverse=True)
            
            return {
                "success": True,
                "transactions": transactions[:limit],
                "total": len(transactions)
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get transaction history: {str(e)}"}
    
    # =============================================================================
    # ANALYTICS
    # =============================================================================
    
    async def get_platform_analytics(self, period: str = "30d") -> Dict[str, Any]:
        """Get platform analytics and metrics"""
        try:
            # Calculate date range
            if period == "7d":
                start_date = datetime.utcnow() - timedelta(days=7)
            elif period == "30d":
                start_date = datetime.utcnow() - timedelta(days=30)
            elif period == "90d":
                start_date = datetime.utcnow() - timedelta(days=90)
            else:
                start_date = datetime.utcnow() - timedelta(days=30)
            
            # User growth metrics
            total_users = await self.db.users.count_documents({})
            new_users = await self.db.users.count_documents({"createdAt": {"$gte": start_date}})
            
            # User breakdown by type
            member_count = await self.db.users.count_documents({"userType": "member"})
            expert_count = await self.db.users.count_documents({"userType": "expert"})
            admin_count = await self.db.users.count_documents({"userType": "admin"})
            
            # Active users (seen in last 30 days)
            active_users = await self.db.users.count_documents({
                "lastSeen": {"$gte": datetime.utcnow() - timedelta(days=30)}
            })
            
            # Expert categories breakdown
            category_pipeline = [
                {"$match": {"userType": "expert"}},
                {"$group": {"_id": "$expertiseCategory", "count": {"$sum": 1}}}
            ]
            category_stats = await self.db.users.aggregate(category_pipeline).to_list(100)
            
            # Daily user registrations (last 30 days)
            daily_pipeline = [
                {"$match": {"createdAt": {"$gte": start_date}}},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$createdAt"},
                        "month": {"$month": "$createdAt"},
                        "day": {"$dayOfMonth": "$createdAt"}
                    },
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
            daily_registrations = await self.db.users.aggregate(daily_pipeline).to_list(100)
            
            return {
                "success": True,
                "analytics": {
                    "overview": {
                        "total_users": total_users,
                        "new_users": new_users,
                        "active_users": active_users,
                        "growth_rate": (new_users / max(total_users - new_users, 1)) * 100
                    },
                    "user_breakdown": {
                        "members": member_count,
                        "experts": expert_count,
                        "admins": admin_count
                    },
                    "expert_categories": category_stats,
                    "daily_registrations": daily_registrations,
                    "period": period
                }
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get analytics: {str(e)}"}
    
    async def get_user_engagement_metrics(self) -> Dict[str, Any]:
        """Get user engagement metrics"""
        try:
            # Mock engagement data - in a real system this would track actual user actions
            now = datetime.utcnow()
            
            # Calculate activity periods
            last_24h = now - timedelta(hours=24)
            last_7d = now - timedelta(days=7)
            last_30d = now - timedelta(days=30)
            
            # Users active in different periods
            active_24h = await self.db.users.count_documents({"lastSeen": {"$gte": last_24h}})
            active_7d = await self.db.users.count_documents({"lastSeen": {"$gte": last_7d}})
            active_30d = await self.db.users.count_documents({"lastSeen": {"$gte": last_30d}})
            
            # Total users for retention calculation
            total_users = await self.db.users.count_documents({})
            
            return {
                "success": True,
                "engagement": {
                    "daily_active_users": active_24h,
                    "weekly_active_users": active_7d,
                    "monthly_active_users": active_30d,
                    "retention_rates": {
                        "daily": (active_24h / max(total_users, 1)) * 100,
                        "weekly": (active_7d / max(total_users, 1)) * 100,
                        "monthly": (active_30d / max(total_users, 1)) * 100
                    }
                }
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to get engagement metrics: {str(e)}"}