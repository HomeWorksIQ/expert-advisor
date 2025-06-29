from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException
from api_key_models import PerformerProfile
import calendar


class PerformerOfTheMonthService:
    def __init__(self, db):
        self.db = db
    
    async def set_performer_of_month(self, user_id: str, month: int, year: int, admin_notes: str = "") -> Dict[str, Any]:
        """Set a performer as performer of the month"""
        
        # Verify performer exists
        performer = await self.db.performer_profiles.find_one({"user_id": user_id})
        if not performer:
            raise HTTPException(status_code=404, detail="Performer not found")
        
        # Check if there's already a performer of the month for this period
        existing = await self.db.performer_of_month.find_one({
            "month": month,
            "year": year
        })
        
        if existing:
            # Update existing record
            await self.db.performer_of_month.update_one(
                {"month": month, "year": year},
                {
                    "$set": {
                        "user_id": user_id,
                        "performer_name": performer["stage_name"],
                        "admin_notes": admin_notes,
                        "updated_at": datetime.utcnow(),
                        "updated_by": "admin"
                    }
                }
            )
        else:
            # Create new record
            performer_of_month = {
                "user_id": user_id,
                "performer_name": performer["stage_name"],
                "month": month,
                "year": year,
                "admin_notes": admin_notes,
                "views_gained": 0,
                "spotlight_clicks": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by": "admin"
            }
            await self.db.performer_of_month.insert_one(performer_of_month)
        
        # Update performer profile with featured status
        await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "is_featured": True,
                    "featured_month": month,
                    "featured_year": year,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "performer_name": performer["stage_name"],
            "month": month,
            "year": year
        }
    
    async def get_current_performer_of_month(self) -> Optional[Dict[str, Any]]:
        """Get current performer of the month"""
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year
        
        performer_record = await self.db.performer_of_month.find_one({
            "month": current_month,
            "year": current_year
        })
        
        if not performer_record:
            return None
        
        # Get full performer profile
        performer_profile = await self.db.performer_profiles.find_one({
            "user_id": performer_record["user_id"]
        })
        
        if not performer_profile:
            return None
        
        return {
            "performer": PerformerProfile(**performer_profile).dict(),
            "month_info": {
                "month": current_month,
                "year": current_year,
                "month_name": calendar.month_name[current_month],
                "views_gained": performer_record.get("views_gained", 0),
                "spotlight_clicks": performer_record.get("spotlight_clicks", 0),
                "admin_notes": performer_record.get("admin_notes", "")
            }
        }
    
    async def get_performer_of_month_history(self, limit: int = 12) -> list:
        """Get history of performers of the month"""
        performers = await self.db.performer_of_month.find().sort([
            ("year", -1), ("month", -1)
        ]).limit(limit).to_list(limit)
        
        result = []
        for record in performers:
            performer_profile = await self.db.performer_profiles.find_one({
                "user_id": record["user_id"]
            })
            
            if performer_profile:
                result.append({
                    "performer": PerformerProfile(**performer_profile).dict(),
                    "month_info": {
                        "month": record["month"],
                        "year": record["year"],
                        "month_name": calendar.month_name[record["month"]],
                        "views_gained": record.get("views_gained", 0),
                        "spotlight_clicks": record.get("spotlight_clicks", 0),
                        "admin_notes": record.get("admin_notes", "")
                    }
                })
        
        return result
    
    async def increment_spotlight_click(self, user_id: str, month: int, year: int) -> bool:
        """Increment spotlight click count for performer of the month"""
        result = await self.db.performer_of_month.update_one(
            {"user_id": user_id, "month": month, "year": year},
            {"$inc": {"spotlight_clicks": 1}}
        )
        
        # Also increment performer profile views
        await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {"$inc": {"total_views": 1}}
        )
        
        return result.modified_count > 0
    
    async def get_suggested_performers(self, limit: int = 10) -> list:
        """Get suggested performers for featuring (high ratings, verified, etc.)"""
        pipeline = [
            {
                "$match": {
                    "is_verified": True,
                    "average_rating": {"$gte": 4.5},
                    "total_shows": {"$gte": 50},
                    "account_status": "active",
                    "show_in_search": True
                }
            },
            {
                "$addFields": {
                    "score": {
                        "$add": [
                            {"$multiply": ["$average_rating", 20]},
                            {"$multiply": ["$total_shows", 0.1]},
                            {"$multiply": ["$total_views", 0.001]},
                            {"$cond": [{"$eq": ["$is_verified", True]}, 10, 0]}
                        ]
                    }
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        
        performers = await self.db.performer_profiles.aggregate(pipeline).to_list(limit)
        
        return [PerformerProfile(**p).dict() for p in performers]
    
    async def remove_featured_status(self, user_id: str) -> bool:
        """Remove featured status from a performer"""
        result = await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "is_featured": False,
                    "updated_at": datetime.utcnow()
                },
                "$unset": {
                    "featured_month": "",
                    "featured_year": ""
                }
            }
        )
        
        return result.modified_count > 0
    
    async def get_performer_spotlight_stats(self, user_id: str) -> Dict[str, Any]:
        """Get spotlight statistics for a performer"""
        stats = await self.db.performer_of_month.find({
            "user_id": user_id
        }).to_list(1000)
        
        total_spotlights = len(stats)
        total_clicks = sum(s.get("spotlight_clicks", 0) for s in stats)
        total_views_gained = sum(s.get("views_gained", 0) for s in stats)
        
        # Get recent month stats
        recent_stats = sorted(stats, key=lambda x: (x["year"], x["month"]), reverse=True)[:3]
        
        return {
            "total_spotlights": total_spotlights,
            "total_spotlight_clicks": total_clicks,
            "total_views_gained": total_views_gained,
            "average_clicks_per_spotlight": total_clicks / total_spotlights if total_spotlights > 0 else 0,
            "recent_spotlights": [
                {
                    "month_name": calendar.month_name[s["month"]],
                    "year": s["year"],
                    "clicks": s.get("spotlight_clicks", 0),
                    "views_gained": s.get("views_gained", 0)
                }
                for s in recent_stats
            ]
        }
    
    async def auto_select_performer_of_month(self, month: int, year: int) -> Optional[Dict[str, Any]]:
        """Auto-select a performer of the month based on performance metrics"""
        
        # Check if already set
        existing = await self.db.performer_of_month.find_one({
            "month": month,
            "year": year
        })
        
        if existing:
            return None
        
        # Get top performers who haven't been featured recently
        recent_featured = await self.db.performer_of_month.find({
            "$or": [
                {"year": year, "month": {"$gte": month - 3}},
                {"year": year - 1, "month": {"$gte": 10}}
            ]
        }).to_list(1000)
        
        recent_featured_ids = [r["user_id"] for r in recent_featured]
        
        # Find top candidates
        pipeline = [
            {
                "$match": {
                    "user_id": {"$nin": recent_featured_ids},
                    "is_verified": True,
                    "average_rating": {"$gte": 4.7},
                    "total_shows": {"$gte": 100},
                    "account_status": "active",
                    "show_in_search": True,
                    "online_status": {"$in": ["online", "offline"]}  # Active users
                }
            },
            {
                "$addFields": {
                    "score": {
                        "$add": [
                            {"$multiply": ["$average_rating", 25]},
                            {"$multiply": ["$total_shows", 0.15]},
                            {"$multiply": ["$total_views", 0.002]},
                            {"$multiply": ["$total_likes", 0.01]},
                            {"$cond": [{"$eq": ["$online_status", "online"]}, 5, 0]}
                        ]
                    }
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": 1}
        ]
        
        candidates = await self.db.performer_profiles.aggregate(pipeline).to_list(1)
        
        if candidates:
            selected_performer = candidates[0]
            await self.set_performer_of_month(
                selected_performer["user_id"],
                month,
                year,
                "Auto-selected based on performance metrics"
            )
            
            return {
                "performer": PerformerProfile(**selected_performer).dict(),
                "selection_reason": "auto-selected",
                "score": selected_performer.get("score", 0)
            }
        
        return None