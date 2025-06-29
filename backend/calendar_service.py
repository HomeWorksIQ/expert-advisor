import os
import json
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from fastapi import HTTPException
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from cryptography.fernet import Fernet
import httpx
from .api_key_models import APIKeyType


class CalendarIntegrationService:
    def __init__(self, api_key_service, db):
        self.api_key_service = api_key_service
        self.db = db
        self.cipher = self._get_cipher()
    
    def _get_cipher(self):
        """Initialize encryption cipher"""
        # Use a default key for development - should be from environment in production
        key = base64.urlsafe_b64encode(b'default_calendar_key_32_chars_1234')
        return Fernet(key)
    
    async def get_google_credentials(self) -> Optional[Dict[str, str]]:
        """Get Google Calendar API credentials"""
        google_key = await self.api_key_service.get_api_key(APIKeyType.GOOGLE_CALENDAR)
        if google_key:
            return {
                "client_id": google_key.client_id,
                "client_secret": google_key.client_secret,
                "redirect_uri": google_key.config.get("redirect_uri") if google_key.config else None
            }
        return None
    
    async def get_microsoft_credentials(self) -> Optional[Dict[str, str]]:
        """Get Microsoft Outlook API credentials"""
        outlook_key = await self.api_key_service.get_api_key(APIKeyType.MICROSOFT_OUTLOOK)
        if outlook_key:
            return {
                "client_id": outlook_key.client_id,
                "client_secret": outlook_key.client_secret,
                "tenant_id": outlook_key.config.get("tenant_id") if outlook_key.config else "common"
            }
        return None
    
    async def initiate_google_oauth(self, user_id: str) -> Dict[str, str]:
        """Initiate Google OAuth flow"""
        credentials = await self.get_google_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Google Calendar credentials not configured")
        
        flow = Flow.from_client_config(
            client_config={
                "web": {
                    "client_id": credentials["client_id"],
                    "client_secret": credentials["client_secret"],
                    "redirect_uris": [credentials["redirect_uri"]],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        
        flow.redirect_uri = credentials["redirect_uri"]
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        # Store state for verification
        await self.db.oauth_states.insert_one({
            "user_id": user_id,
            "state": state,
            "provider": "google",
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        })
        
        return {
            "authorization_url": authorization_url,
            "state": state
        }
    
    async def handle_google_callback(self, code: str, state: str) -> Dict[str, str]:
        """Handle Google OAuth callback"""
        # Verify state
        oauth_state = await self.db.oauth_states.find_one({
            "state": state,
            "provider": "google"
        })
        
        if not oauth_state or oauth_state["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")
        
        user_id = oauth_state["user_id"]
        
        credentials = await self.get_google_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Google Calendar credentials not configured")
        
        flow = Flow.from_client_config(
            client_config={
                "web": {
                    "client_id": credentials["client_id"],
                    "client_secret": credentials["client_secret"],
                    "redirect_uris": [credentials["redirect_uri"]],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        
        flow.redirect_uri = credentials["redirect_uri"]
        flow.fetch_token(code=code)
        
        oauth_credentials = flow.credentials
        
        # Encrypt and store tokens
        encrypted_token = self.cipher.encrypt(oauth_credentials.token.encode())
        encrypted_refresh_token = self.cipher.encrypt(oauth_credentials.refresh_token.encode()) if oauth_credentials.refresh_token else None
        
        # Store user calendar integration
        calendar_integration = {
            "user_id": user_id,
            "provider": "google",
            "encrypted_access_token": encrypted_token,
            "encrypted_refresh_token": encrypted_refresh_token,
            "token_expiry": oauth_credentials.expiry,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Update or insert calendar integration
        await self.db.calendar_integrations.update_one(
            {"user_id": user_id, "provider": "google"},
            {"$set": calendar_integration},
            upsert=True
        )
        
        # Clean up OAuth state
        await self.db.oauth_states.delete_one({"_id": oauth_state["_id"]})
        
        return {
            "message": "Google Calendar integration successful",
            "user_id": user_id,
            "provider": "google"
        }
    
    async def get_user_google_credentials(self, user_id: str) -> Optional[Credentials]:
        """Retrieve and decrypt user's Google credentials"""
        integration = await self.db.calendar_integrations.find_one({
            "user_id": user_id,
            "provider": "google",
            "is_active": True
        })
        
        if not integration:
            return None
        
        google_creds = await self.get_google_credentials()
        if not google_creds:
            return None
        
        # Decrypt tokens
        decrypted_token = self.cipher.decrypt(integration["encrypted_access_token"]).decode()
        decrypted_refresh_token = None
        if integration.get("encrypted_refresh_token"):
            decrypted_refresh_token = self.cipher.decrypt(integration["encrypted_refresh_token"]).decode()
        
        return Credentials(
            token=decrypted_token,
            refresh_token=decrypted_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=google_creds["client_id"],
            client_secret=google_creds["client_secret"],
            expiry=integration.get("token_expiry")
        )
    
    async def create_google_calendar_event(self, user_id: str, appointment_data: Dict[str, Any]) -> Optional[str]:
        """Create event in Google Calendar"""
        try:
            credentials = await self.get_user_google_credentials(user_id)
            if not credentials:
                return None
            
            service = build('calendar', 'v3', credentials=credentials)
            
            event = {
                'summary': appointment_data['title'],
                'description': appointment_data.get('description', ''),
                'start': {
                    'dateTime': appointment_data['scheduled_start'],
                    'timeZone': appointment_data.get('timezone', 'UTC'),
                },
                'end': {
                    'dateTime': appointment_data['scheduled_end'],
                    'timeZone': appointment_data.get('timezone', 'UTC'),
                },
            }
            
            if appointment_data.get('location'):
                event['location'] = appointment_data['location']
            
            if appointment_data.get('attendee_emails'):
                event['attendees'] = [{'email': email} for email in appointment_data['attendee_emails']]
            
            created_event = service.events().insert(calendarId='primary', body=event).execute()
            return created_event['id']
            
        except HttpError as error:
            print(f"Google Calendar API error: {error}")
            return None
        except Exception as error:
            print(f"Error creating Google Calendar event: {error}")
            return None
    
    async def update_google_calendar_event(self, user_id: str, event_id: str, appointment_data: Dict[str, Any]) -> bool:
        """Update existing Google Calendar event"""
        try:
            credentials = await self.get_user_google_credentials(user_id)
            if not credentials:
                return False
            
            service = build('calendar', 'v3', credentials=credentials)
            
            event = {
                'summary': appointment_data['title'],
                'description': appointment_data.get('description', ''),
                'start': {
                    'dateTime': appointment_data['scheduled_start'],
                    'timeZone': appointment_data.get('timezone', 'UTC'),
                },
                'end': {
                    'dateTime': appointment_data['scheduled_end'],
                    'timeZone': appointment_data.get('timezone', 'UTC'),
                },
            }
            
            if appointment_data.get('location'):
                event['location'] = appointment_data['location']
            
            service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event
            ).execute()
            
            return True
            
        except HttpError as error:
            print(f"Google Calendar API error: {error}")
            return False
        except Exception as error:
            print(f"Error updating Google Calendar event: {error}")
            return False
    
    async def delete_google_calendar_event(self, user_id: str, event_id: str) -> bool:
        """Delete Google Calendar event"""
        try:
            credentials = await self.get_user_google_credentials(user_id)
            if not credentials:
                return False
            
            service = build('calendar', 'v3', credentials=credentials)
            service.events().delete(calendarId='primary', eventId=event_id).execute()
            
            return True
            
        except HttpError as error:
            print(f"Google Calendar API error: {error}")
            return False
        except Exception as error:
            print(f"Error deleting Google Calendar event: {error}")
            return False
    
    async def sync_appointment_to_calendars(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync appointment to all connected calendar services"""
        sync_results = {}
        
        performer_id = appointment_data.get("performer_id")
        member_id = appointment_data.get("member_id")
        
        # Sync to performer's calendar
        if performer_id:
            google_event_id = await self.create_google_calendar_event(performer_id, appointment_data)
            if google_event_id:
                sync_results["performer_google"] = google_event_id
        
        # Sync to member's calendar if requested
        if member_id and appointment_data.get("sync_to_member", False):
            google_event_id = await self.create_google_calendar_event(member_id, appointment_data)
            if google_event_id:
                sync_results["member_google"] = google_event_id
        
        return sync_results
    
    async def get_user_calendar_integrations(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all calendar integrations for a user"""
        integrations = await self.db.calendar_integrations.find({
            "user_id": user_id,
            "is_active": True
        }).to_list(100)
        
        # Remove sensitive data before returning
        for integration in integrations:
            integration.pop("encrypted_access_token", None)
            integration.pop("encrypted_refresh_token", None)
            integration["_id"] = str(integration["_id"])
        
        return integrations
    
    async def disconnect_calendar_integration(self, user_id: str, provider: str) -> bool:
        """Disconnect a calendar integration"""
        result = await self.db.calendar_integrations.update_one(
            {"user_id": user_id, "provider": provider},
            {"$set": {"is_active": False, "disconnected_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0


class MicrosoftCalendarService:
    def __init__(self, api_key_service, db, cipher):
        self.api_key_service = api_key_service
        self.db = db
        self.cipher = cipher
    
    async def get_access_token(self, user_id: str) -> Optional[str]:
        """Get Microsoft Graph access token for user"""
        integration = await self.db.calendar_integrations.find_one({
            "user_id": user_id,
            "provider": "microsoft",
            "is_active": True
        })
        
        if not integration:
            return None
        
        # Decrypt and return access token
        return self.cipher.decrypt(integration["encrypted_access_token"]).decode()
    
    async def create_outlook_event(self, user_id: str, appointment_data: Dict[str, Any]) -> Optional[str]:
        """Create event in Outlook Calendar using Microsoft Graph API"""
        try:
            access_token = await self.get_access_token(user_id)
            if not access_token:
                return None
            
            event_data = {
                "subject": appointment_data['title'],
                "body": {
                    "contentType": "Text",
                    "content": appointment_data.get('description', '')
                },
                "start": {
                    "dateTime": appointment_data['scheduled_start'],
                    "timeZone": appointment_data.get('timezone', 'UTC')
                },
                "end": {
                    "dateTime": appointment_data['scheduled_end'],
                    "timeZone": appointment_data.get('timezone', 'UTC')
                }
            }
            
            if appointment_data.get('location'):
                event_data['location'] = {
                    "displayName": appointment_data['location']
                }
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://graph.microsoft.com/v1.0/me/events",
                    json=event_data,
                    headers=headers
                )
                
                if response.status_code == 201:
                    event = response.json()
                    return event['id']
                else:
                    print(f"Microsoft Graph API error: {response.text}")
                    return None
            
        except Exception as error:
            print(f"Error creating Outlook event: {error}")
            return None