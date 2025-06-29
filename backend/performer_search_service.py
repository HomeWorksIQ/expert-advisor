from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import HTTPException
from api_key_models import PerformerProfile, PerformerSearch, Gender, SexualPreference, Ethnicity
import math


class PerformerSearchService:
    def __init__(self, db):
        self.db = db
    
    async def create_performer_profile(self, profile_data: Dict[str, Any]) -> PerformerProfile:
        """Create a new performer profile"""
        profile = PerformerProfile(**profile_data)
        await self.db.performer_profiles.insert_one(profile.dict())
        return profile
    
    async def update_performer_profile(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update performer profile"""
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    async def get_performer_profile(self, user_id: str) -> Optional[PerformerProfile]:
        """Get performer profile by user ID"""
        profile_doc = await self.db.performer_profiles.find_one({"user_id": user_id})
        if profile_doc:
            return PerformerProfile(**profile_doc)
        return None
    
    async def search_performers(self, search_params: PerformerSearch) -> Dict[str, Any]:
        """Advanced performer search with filters"""
        
        # Build MongoDB query
        query = {
            "show_in_search": True,
            "account_status": "active"
        }
        
        # Text search
        if search_params.query:
            query["$or"] = [
                {"stage_name": {"$regex": search_params.query, "$options": "i"}},
                {"bio": {"$regex": search_params.query, "$options": "i"}},
                {"specialties": {"$in": [search_params.query]}}
            ]
        
        # Location filters
        if search_params.country:
            query["country"] = {"$regex": search_params.country, "$options": "i"}
        
        if search_params.state:
            query["state"] = {"$regex": search_params.state, "$options": "i"}
        
        if search_params.city:
            query["city"] = {"$regex": search_params.city, "$options": "i"}
        
        if search_params.zip_code:
            query["zip_code"] = search_params.zip_code
        
        # Age filters
        if search_params.min_age:
            query.setdefault("age", {})["$gte"] = search_params.min_age
        
        if search_params.max_age:
            query.setdefault("age", {})["$lte"] = search_params.max_age
        
        # Gender filter
        if search_params.gender:
            query["gender"] = {"$in": [g.value for g in search_params.gender]}
        
        # Sexual preference filter
        if search_params.sexual_preference:
            query["sexual_preference"] = {"$in": [sp.value for sp in search_params.sexual_preference]}
        
        # Ethnicity filter
        if search_params.ethnicity:
            query["ethnicity"] = {"$in": [e.value for e in search_params.ethnicity]}
        
        # Physical filters
        if search_params.min_height_cm:
            query.setdefault("height_cm", {})["$gte"] = search_params.min_height_cm
        
        if search_params.max_height_cm:
            query.setdefault("height_cm", {})["$lte"] = search_params.max_height_cm
        
        if search_params.body_type:
            query["body_type"] = {"$in": search_params.body_type}
        
        if search_params.hair_color:
            query["hair_color"] = {"$in": search_params.hair_color}
        
        if search_params.eye_color:
            query["eye_color"] = {"$in": search_params.eye_color}
        
        # Status filters
        if search_params.online_only:
            query["online_status"] = "online"
        
        if search_params.verified_only:
            query["is_verified"] = True
        
        # Service filters
        if search_params.accepts_tips is not None:
            query["accepts_tips"] = search_params.accepts_tips
        
        if search_params.languages:
            query["languages"] = {"$in": search_params.languages}
        
        # Build sort options
        sort_options = []
        
        if search_params.sort_by == "popularity":
            sort_field = "total_views"
        elif search_params.sort_by == "rating":
            sort_field = "average_rating"
        elif search_params.sort_by == "newest":
            sort_field = "created_at"
        elif search_params.sort_by == "last_active":
            sort_field = "last_active"
        elif search_params.sort_by == "alphabetical":
            sort_field = "stage_name"
        else:
            sort_field = "total_views"  # Default
        
        sort_direction = -1 if search_params.sort_order == "desc" else 1
        sort_options.append((sort_field, sort_direction))
        
        # Add secondary sort by online status (online first)
        sort_options.append(("online_status", -1))
        
        # Calculate pagination
        skip = (search_params.page - 1) * search_params.limit
        
        # Execute search
        cursor = self.db.performer_profiles.find(query)
        
        # Apply sorting
        for field, direction in sort_options:
            cursor = cursor.sort(field, direction)
        
        # Get total count for pagination
        total_count = await self.db.performer_profiles.count_documents(query)
        
        # Apply pagination
        performers = await cursor.skip(skip).limit(search_params.limit).to_list(search_params.limit)
        
        # Convert to PerformerProfile objects and add computed fields
        result_performers = []
        for performer_doc in performers:
            performer = PerformerProfile(**performer_doc)
            
            # Add computed fields for display
            performer_dict = performer.dict()
            performer_dict["display_location"] = self._format_location(performer)
            performer_dict["is_online"] = performer.online_status == "online"
            performer_dict["distance_km"] = None  # Could calculate if user location provided
            
            result_performers.append(performer_dict)
        
        # Calculate pagination info
        total_pages = math.ceil(total_count / search_params.limit)
        has_next = search_params.page < total_pages
        has_prev = search_params.page > 1
        
        return {
            "performers": result_performers,
            "pagination": {
                "current_page": search_params.page,
                "total_pages": total_pages,
                "total_count": total_count,
                "limit": search_params.limit,
                "has_next": has_next,
                "has_prev": has_prev
            },
            "filters_applied": {
                "location": bool(search_params.country or search_params.state or search_params.city),
                "demographics": bool(search_params.min_age or search_params.max_age or 
                                   search_params.gender or search_params.sexual_preference or search_params.ethnicity),
                "status": bool(search_params.online_only or search_params.verified_only),
                "physical": bool(search_params.min_height_cm or search_params.max_height_cm or 
                               search_params.body_type or search_params.hair_color or search_params.eye_color)
            }
        }
    
    def _format_location(self, performer: PerformerProfile) -> str:
        """Format performer location for display"""
        if performer.show_exact_location:
            parts = [performer.city]
            if performer.state:
                parts.append(performer.state)
            parts.append(performer.country)
            return ", ".join(parts)
        else:
            # Show general area only
            parts = []
            if performer.state:
                parts.append(performer.state)
            parts.append(performer.country)
            return ", ".join(parts)
    
    async def get_location_suggestions(self, query: str, location_type: str = "city") -> List[str]:
        """Get location suggestions for autocomplete"""
        
        if location_type == "country":
            field = "country"
        elif location_type == "state":
            field = "state"
        elif location_type == "city":
            field = "city"
        else:
            field = "city"
        
        pipeline = [
            {"$match": {field: {"$regex": query, "$options": "i"}}},
            {"$group": {"_id": f"${field}"}},
            {"$sort": {"_id": 1}},
            {"$limit": 10}
        ]
        
        results = await self.db.performer_profiles.aggregate(pipeline).to_list(10)
        return [result["_id"] for result in results if result["_id"]]
    
    async def get_filter_options(self) -> Dict[str, List[str]]:
        """Get available filter options"""
        
        # Get unique values for various fields
        pipeline_templates = {
            "body_types": {"$group": {"_id": "$body_type"}, "$sort": {"_id": 1}},
            "hair_colors": {"$group": {"_id": "$hair_color"}, "$sort": {"_id": 1}},
            "eye_colors": {"$group": {"_id": "$eye_color"}, "$sort": {"_id": 1}},
            "languages": {"$unwind": "$languages", "$group": {"_id": "$languages"}, "$sort": {"_id": 1}},
            "specialties": {"$unwind": "$specialties", "$group": {"_id": "$specialties"}, "$sort": {"_id": 1}}
        }
        
        filter_options = {
            "genders": [g.value for g in Gender],
            "sexual_preferences": [sp.value for sp in SexualPreference],
            "ethnicities": [e.value for e in Ethnicity],
            "sort_options": [
                {"value": "popularity", "label": "Most Popular"},
                {"value": "rating", "label": "Highest Rated"},
                {"value": "newest", "label": "Newest"},
                {"value": "last_active", "label": "Recently Active"},
                {"value": "alphabetical", "label": "A-Z"}
            ]
        }
        
        # Get dynamic options from database
        for key, pipeline in pipeline_templates.items():
            if key == "languages" or key == "specialties":
                pipeline = [
                    {"$unwind": f"${key[:-1]}"},  # Remove 's' and unwind
                    {"$group": {"_id": f"${key[:-1]}"}},
                    {"$sort": {"_id": 1}},
                    {"$limit": 20}
                ]
            else:
                pipeline = [
                    {"$group": {"_id": f"${key[:-1]}"}},  # Remove 's'
                    {"$sort": {"_id": 1}},
                    {"$limit": 20}
                ]
            
            try:
                results = await self.db.performer_profiles.aggregate(pipeline).to_list(20)
                filter_options[key] = [result["_id"] for result in results if result["_id"]]
            except:
                filter_options[key] = []
        
        return filter_options
    
    async def increment_view_count(self, user_id: str) -> bool:
        """Increment performer view count"""
        result = await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {
                "$inc": {"total_views": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    async def update_online_status(self, user_id: str, status: str) -> bool:
        """Update performer online status"""
        result = await self.db.performer_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "online_status": status,
                    "last_active": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0