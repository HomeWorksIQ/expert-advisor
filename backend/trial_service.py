from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException
from api_key_models import Trial, TrialCreate, TrialUpdate, TrialStatus


class TrialService:
    def __init__(self, db):
        self.db = db
    
    async def create_trial(self, user_id: str, trial_type: str, trial_duration_days: int = None) -> Trial:
        """Create a new trial for a user"""
        
        # Check if user already has a trial
        existing_trial = await self.db.trials.find_one({"user_id": user_id})
        if existing_trial:
            raise HTTPException(status_code=400, detail="User already has a trial")
        
        # Get trial settings from database if duration not specified
        if trial_duration_days is None:
            settings = await self.db.trial_settings.find_one({"setting_type": "global"})
            if settings:
                if trial_type == "performer":
                    trial_duration_days = settings.get("performer_trial_days", 7)
                else:
                    trial_duration_days = settings.get("member_trial_days", 7)
            else:
                trial_duration_days = 7  # Default fallback
        
        # Define trial benefits based on user type
        benefits = self._get_trial_benefits(trial_type)
        
        # Create trial
        now = datetime.utcnow()
        trial_data = {
            "user_id": user_id,
            "trial_type": trial_type,
            "trial_start_date": now,
            "trial_end_date": now + timedelta(days=trial_duration_days),
            "trial_duration_days": trial_duration_days,
            "benefits_unlocked": benefits,
            "access_level": "premium",
            "status": TrialStatus.ACTIVE,
            "is_active": True,
            "has_used_trial": True,
            "days_remaining": trial_duration_days,
            "days_used": 0
        }
        
        trial = Trial(**trial_data)
        await self.db.trials.insert_one(trial.dict())
        
        # Update user record to mark trial as active
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {
                "has_active_trial": True,
                "trial_start_date": now,
                "trial_end_date": trial.trial_end_date,
                "access_level": "premium"
            }}
        )
        
        return trial
    
    async def get_user_trial(self, user_id: str) -> Optional[Trial]:
        """Get user's current trial"""
        trial_doc = await self.db.trials.find_one({"user_id": user_id})
        if trial_doc:
            trial = Trial(**trial_doc)
            # Update status before returning
            trial.update_status()
            
            # Save updated status to database
            await self.db.trials.update_one(
                {"user_id": user_id},
                {"$set": trial.dict()}
            )
            
            return trial
        return None
    
    async def check_trial_access(self, user_id: str, feature: str = None) -> Dict[str, Any]:
        """Check if user has trial access to a feature"""
        trial = await self.get_user_trial(user_id)
        
        if not trial:
            return {
                "has_trial": False,
                "has_access": False,
                "days_remaining": 0,
                "status": "no_trial"
            }
        
        # Check if trial is still active
        has_access = trial.is_active and trial.status == TrialStatus.ACTIVE
        
        # Check feature-specific access
        if feature and has_access:
            has_access = feature in trial.benefits_unlocked or "all_features" in trial.benefits_unlocked
        
        return {
            "has_trial": True,
            "has_access": has_access,
            "days_remaining": trial.days_remaining,
            "days_used": trial.days_used,
            "status": trial.status,
            "trial_end_date": trial.trial_end_date,
            "benefits": trial.benefits_unlocked
        }
    
    async def convert_trial_to_paid(self, user_id: str, subscription_type: str) -> bool:
        """Convert trial to paid subscription"""
        trial = await self.get_user_trial(user_id)
        
        if not trial:
            raise HTTPException(status_code=404, detail="No trial found for user")
        
        # Update trial record
        now = datetime.utcnow()
        await self.db.trials.update_one(
            {"user_id": user_id},
            {"$set": {
                "converted_to_paid": True,
                "conversion_date": now,
                "status": TrialStatus.USED,
                "updated_at": now
            }}
        )
        
        # Update user record
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {
                "has_active_trial": False,
                "subscription_type": subscription_type,
                "subscription_start_date": now,
                "converted_from_trial": True
            }}
        )
        
        return True
    
    async def expire_trial(self, user_id: str) -> bool:
        """Manually expire a trial"""
        trial = await self.get_user_trial(user_id)
        
        if not trial:
            raise HTTPException(status_code=404, detail="No trial found for user")
        
        now = datetime.utcnow()
        await self.db.trials.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": TrialStatus.EXPIRED,
                "is_active": False,
                "expired_at": now,
                "updated_at": now
            }}
        )
        
        # Update user record
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {
                "has_active_trial": False,
                "access_level": "basic"
            }}
        )
        
        return True
    
    async def extend_trial(self, user_id: str, additional_days: int) -> Trial:
        """Extend a trial by additional days"""
        trial = await self.get_user_trial(user_id)
        
        if not trial:
            raise HTTPException(status_code=404, detail="No trial found for user")
        
        # Extend trial end date
        new_end_date = trial.trial_end_date + timedelta(days=additional_days)
        new_duration = trial.trial_duration_days + additional_days
        
        await self.db.trials.update_one(
            {"user_id": user_id},
            {"$set": {
                "trial_end_date": new_end_date,
                "trial_duration_days": new_duration,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Update user record
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"trial_end_date": new_end_date}}
        )
        
        return await self.get_user_trial(user_id)
    
    async def get_trial_statistics(self, trial_type: str = None) -> Dict[str, Any]:
        """Get trial statistics"""
        match_filter = {}
        if trial_type:
            match_filter["trial_type"] = trial_type
        
        pipeline = [
            {"$match": match_filter},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "avg_days_used": {"$avg": "$days_used"}
            }}
        ]
        
        stats = await self.db.trials.aggregate(pipeline).to_list(1000)
        
        # Calculate conversion rate
        total_trials = await self.db.trials.count_documents(match_filter)
        converted_trials = await self.db.trials.count_documents({
            **match_filter,
            "converted_to_paid": True
        })
        
        conversion_rate = (converted_trials / total_trials * 100) if total_trials > 0 else 0
        
        return {
            "total_trials": total_trials,
            "converted_trials": converted_trials,
            "conversion_rate": round(conversion_rate, 2),
            "status_breakdown": stats,
            "trial_type": trial_type or "all"
        }
    
    async def get_expiring_trials(self, days_threshold: int = 1) -> List[Trial]:
        """Get trials expiring within specified days"""
        threshold_date = datetime.utcnow() + timedelta(days=days_threshold)
        
        trials = await self.db.trials.find({
            "trial_end_date": {"$lte": threshold_date},
            "status": TrialStatus.ACTIVE,
            "is_active": True
        }).to_list(1000)
        
        return [Trial(**trial) for trial in trials]
    
    async def send_trial_reminder(self, user_id: str, reminder_type: str) -> bool:
        """Send trial reminder notification"""
        trial = await self.get_user_trial(user_id)
        
        if not trial:
            return False
        
        # Create notification record
        notification = {
            "user_id": user_id,
            "type": "trial_reminder",
            "subtype": reminder_type,
            "title": self._get_reminder_title(reminder_type, trial.days_remaining),
            "message": self._get_reminder_message(reminder_type, trial.days_remaining),
            "data": {
                "trial_id": trial.id,
                "days_remaining": trial.days_remaining,
                "trial_end_date": trial.trial_end_date
            },
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        
        await self.db.notifications.insert_one(notification)
        return True
    
    def _get_trial_benefits(self, trial_type: str) -> List[str]:
        """Get trial benefits based on user type"""
        if trial_type == "performer":
            return [
                "premium_analytics",
                "advanced_messaging",
                "live_streaming",
                "video_calls",
                "content_monetization",
                "priority_support",
                "custom_branding",
                "unlimited_uploads"
            ]
        elif trial_type == "member":
            return [
                "premium_content_access",
                "hd_streaming",
                "download_content",
                "advanced_search",
                "priority_messaging",
                "exclusive_events",
                "ad_free_experience",
                "early_access"
            ]
        else:
            return ["basic_features"]
    
    def _get_reminder_title(self, reminder_type: str, days_remaining: int) -> str:
        """Get reminder notification title"""
        if reminder_type == "expiring_soon":
            return f"Trial expires in {days_remaining} day{'s' if days_remaining != 1 else ''}"
        elif reminder_type == "last_day":
            return "Last day of your free trial!"
        elif reminder_type == "expired":
            return "Your free trial has expired"
        else:
            return "Trial Reminder"
    
    def _get_reminder_message(self, reminder_type: str, days_remaining: int) -> str:
        """Get reminder notification message"""
        if reminder_type == "expiring_soon":
            return f"Your free trial expires in {days_remaining} day{'s' if days_remaining != 1 else ''}. Upgrade now to continue enjoying premium features!"
        elif reminder_type == "last_day":
            return "This is your last day to enjoy premium features for free. Upgrade now to continue without interruption!"
        elif reminder_type == "expired":
            return "Your free trial has ended. Upgrade to a paid plan to restore access to premium features."
        else:
            return "Don't forget about your trial benefits!"
    
    async def cleanup_expired_trials(self) -> int:
        """Clean up expired trials and update user access"""
        expired_trials = await self.db.trials.find({
            "trial_end_date": {"$lt": datetime.utcnow()},
            "status": {"$ne": TrialStatus.EXPIRED}
        }).to_list(1000)
        
        count = 0
        for trial_doc in expired_trials:
            trial = Trial(**trial_doc)
            await self.expire_trial(trial.user_id)
            count += 1
        
        return count