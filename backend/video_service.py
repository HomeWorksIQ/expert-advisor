import os
import uuid
import base64
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from twilio.rest import Client
import httpx
import aiofiles
from .api_key_models import APIKeyType


class VideoConferencingService:
    def __init__(self, api_key_service):
        self.api_key_service = api_key_service
    
    async def get_agora_credentials(self) -> Optional[Dict[str, str]]:
        """Get Agora API credentials"""
        agora_key = await self.api_key_service.get_api_key(APIKeyType.AGORA)
        if agora_key:
            return {
                "app_id": agora_key.app_id,
                "app_certificate": agora_key.api_secret,
                "customer_key": agora_key.api_key,
                "customer_secret": agora_key.client_secret
            }
        return None
    
    async def get_twilio_credentials(self) -> Optional[Dict[str, str]]:
        """Get Twilio API credentials"""
        twilio_key = await self.api_key_service.get_api_key(APIKeyType.TWILIO_VIDEO)
        if twilio_key:
            return {
                "account_sid": twilio_key.account_sid,
                "api_key_sid": twilio_key.api_key,
                "api_key_secret": twilio_key.api_secret,
                "auth_token": twilio_key.auth_token
            }
        return None
    
    async def generate_agora_token(self, channel: str, uid: int = 0, role: int = 1) -> str:
        """Generate Agora RTC token"""
        from agora_token_builder import RtcTokenBuilder
        
        credentials = await self.get_agora_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Agora credentials not configured")
        
        token = RtcTokenBuilder.buildTokenWithUid(
            credentials["app_id"], 
            credentials["app_certificate"], 
            channel, 
            uid, 
            role, 
            3600  # 1-hour validity
        )
        return token
    
    async def generate_twilio_token(self, identity: str, room: str) -> str:
        """Generate Twilio Video token"""
        credentials = await self.get_twilio_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Twilio credentials not configured")
        
        token = AccessToken(
            credentials["account_sid"],
            credentials["api_key_sid"],
            credentials["api_key_secret"],
            identity=identity
        )
        video_grant = VideoGrant(room=room)
        token.add_grant(video_grant)
        return token.to_jwt()
    
    async def start_agora_recording(self, channel: str, uid: str) -> Dict[str, Any]:
        """Start Agora cloud recording"""
        credentials = await self.get_agora_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Agora credentials not configured")
        
        # Create authorization header
        auth_string = f"{credentials['customer_key']}:{credentials['customer_secret']}"
        auth_header = base64.b64encode(auth_string.encode()).decode()
        
        # 1. Acquire resource
        acquire_url = f"https://api.agora.io/v1/apps/{credentials['app_id']}/cloud_recording/acquire"
        acquire_payload = {
            "cname": channel,
            "uid": uid,
            "clientRequest": {}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                acquire_url,
                json=acquire_payload,
                headers={"Authorization": f"Basic {auth_header}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Agora acquire failed: {response.text}")
            
            acquire_result = response.json()
            resource_id = acquire_result["resourceId"]
        
        # 2. Start recording
        start_url = f"https://api.agora.io/v1/apps/{credentials['app_id']}/cloud_recording/resourceid/{resource_id}/mode/mix/start"
        start_payload = {
            "cname": channel,
            "uid": uid,
            "clientRequest": {
                "recordingConfig": {
                    "streamTypes": 2,  # Audio + Video
                    "channelType": 0,  # Communication
                    "videoStreamType": 0,  # High stream
                    "maxIdleTime": 30,
                    "transcodingConfig": {
                        "width": 1280,
                        "height": 720,
                        "fps": 15,
                        "bitrate": 2000,
                        "maxResolutionUid": uid
                    }
                },
                "storageConfig": {
                    "vendor": 0,  # Agora Cloud Storage
                    "region": 0,  # US East
                    "bucket": "agora-recordings",
                    "accessKey": "agora_storage_key",
                    "secretKey": "agora_storage_secret"
                }
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                start_url,
                json=start_payload,
                headers={"Authorization": f"Basic {auth_header}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Agora recording start failed: {response.text}")
            
            start_result = response.json()
            
            return {
                "resource_id": resource_id,
                "sid": start_result["sid"],
                "recording_id": start_result.get("recordingId"),
                "status": "recording"
            }
    
    async def stop_agora_recording(self, channel: str, uid: str, resource_id: str, sid: str) -> Dict[str, Any]:
        """Stop Agora cloud recording"""
        credentials = await self.get_agora_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Agora credentials not configured")
        
        auth_string = f"{credentials['customer_key']}:{credentials['customer_secret']}"
        auth_header = base64.b64encode(auth_string.encode()).decode()
        
        stop_url = f"https://api.agora.io/v1/apps/{credentials['app_id']}/cloud_recording/resourceid/{resource_id}/sid/{sid}/mode/mix/stop"
        stop_payload = {
            "cname": channel,
            "uid": uid,
            "clientRequest": {}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                stop_url,
                json=stop_payload,
                headers={"Authorization": f"Basic {auth_header}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Agora recording stop failed: {response.text}")
            
            stop_result = response.json()
            
            return {
                "recording_id": stop_result.get("recordingId"),
                "file_list": stop_result.get("serverResponse", {}).get("fileList", []),
                "status": "stopped"
            }
    
    async def start_twilio_recording(self, room_sid: str) -> Dict[str, Any]:
        """Start Twilio recording"""
        credentials = await self.get_twilio_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Twilio credentials not configured")
        
        client = Client(credentials["account_sid"], credentials["auth_token"])
        
        recording = client.video.recordings.create(
            grouping_sid=[room_sid],
            audio_sources='*',
            video_sources='*',
            format='mp4'
        )
        
        return {
            "recording_sid": recording.sid,
            "room_sid": room_sid,
            "status": recording.status
        }
    
    async def stop_twilio_recording(self, recording_sid: str) -> Dict[str, Any]:
        """Stop Twilio recording"""
        credentials = await self.get_twilio_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Twilio credentials not configured")
        
        client = Client(credentials["account_sid"], credentials["auth_token"])
        
        recording = client.video.recordings(recording_sid).update(status='stopped')
        
        return {
            "recording_sid": recording.sid,
            "status": recording.status,
            "duration": recording.duration
        }
    
    async def get_twilio_recordings(self, room_sid: str) -> list:
        """Get Twilio recordings for a room"""
        credentials = await self.get_twilio_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="Twilio credentials not configured")
        
        client = Client(credentials["account_sid"], credentials["auth_token"])
        
        recordings = client.video.recordings.list(grouping_sid=[room_sid])
        
        return [
            {
                "recording_sid": recording.sid,
                "room_sid": room_sid,
                "duration": recording.duration,
                "status": recording.status,
                "media_url": f"https://video.twilio.com/v1/Recordings/{recording.sid}/Media",
                "created_at": recording.date_created.isoformat() if recording.date_created else None
            }
            for recording in recordings
        ]
    
    async def create_jitsi_room(self, room_name: str, user_name: str) -> Dict[str, Any]:
        """Create Jitsi Meet room configuration"""
        # Jitsi Meet doesn't require API keys for basic usage
        # This generates the meeting URL and configuration
        
        jitsi_domain = "meet.jit.si"  # Can be customized to self-hosted instance
        meeting_url = f"https://{jitsi_domain}/{room_name}"
        
        # Configuration for Jitsi features
        config = {
            "room_name": room_name,
            "meeting_url": meeting_url,
            "user_name": user_name,
            "config": {
                "startWithAudioMuted": False,
                "startWithVideoMuted": False,
                "enableWelcomePage": False,
                "prejoinPageEnabled": False,
                "enableUserRolesBasedOnToken": False,
                "toolbarButtons": [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 
                    'fullscreen', 'fodeviceselection', 'hangup', 'profile', 
                    'recording', 'livestreaming', 'etherpad', 'sharedvideo', 
                    'settings', 'raisehand', 'videoquality', 'filmstrip',
                    'invite', 'feedback', 'stats', 'shortcuts', 'tileview'
                ]
            },
            "interface_config": {
                "SHOW_JITSI_WATERMARK": False,
                "SHOW_WATERMARK_FOR_GUESTS": False,
                "SHOW_BRAND_WATERMARK": False,
                "BRAND_WATERMARK_LINK": "",
                "SHOW_POWERED_BY": False,
                "DISPLAY_WELCOME_PAGE_CONTENT": False,
                "SETTINGS_SECTIONS": ['devices', 'language', 'moderator', 'profile', 'calendar'],
                "TOOLBAR_BUTTONS": [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 
                    'fullscreen', 'fodeviceselection', 'hangup', 'profile', 
                    'recording', 'livestreaming', 'etherpad', 'sharedvideo', 
                    'settings', 'raisehand', 'videoquality', 'filmstrip',
                    'invite', 'feedback', 'stats', 'shortcuts', 'tileview'
                ]
            }
        }
        
        return config


class VideoRecordingService:
    def __init__(self, db):
        self.db = db
    
    async def save_recording_metadata(self, recording_data: Dict[str, Any]) -> str:
        """Save recording metadata to database"""
        recording_id = str(uuid.uuid4())
        recording_record = {
            "recording_id": recording_id,
            "provider": recording_data.get("provider"),
            "room_id": recording_data.get("room_id"),
            "session_id": recording_data.get("session_id"),
            "performer_id": recording_data.get("performer_id"),
            "participants": recording_data.get("participants", []),
            "recording_sid": recording_data.get("recording_sid"),
            "resource_id": recording_data.get("resource_id"),
            "file_urls": recording_data.get("file_urls", []),
            "duration": recording_data.get("duration"),
            "status": recording_data.get("status", "active"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.db.video_recordings.insert_one(recording_record)
        return recording_id
    
    async def update_recording_status(self, recording_id: str, status: str, additional_data: Dict[str, Any] = None) -> bool:
        """Update recording status and metadata"""
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if additional_data:
            update_data.update(additional_data)
        
        result = await self.db.video_recordings.update_one(
            {"recording_id": recording_id},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    
    async def get_recording_by_id(self, recording_id: str) -> Optional[Dict[str, Any]]:
        """Get recording by ID"""
        recording = await self.db.video_recordings.find_one({"recording_id": recording_id})
        return recording
    
    async def get_recordings_by_performer(self, performer_id: str) -> list:
        """Get all recordings for a performer"""
        recordings = await self.db.video_recordings.find({"performer_id": performer_id}).to_list(1000)
        return recordings
    
    async def download_recording_file(self, recording_id: str, file_url: str) -> Optional[str]:
        """Download recording file and return local path"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(file_url)
                response.raise_for_status()
                
                # Create downloads directory if it doesn't exist
                downloads_dir = "/app/downloads/recordings"
                os.makedirs(downloads_dir, exist_ok=True)
                
                # Generate filename
                file_extension = file_url.split('.')[-1] if '.' in file_url else 'mp4'
                filename = f"{recording_id}_{datetime.utcnow().isoformat()}.{file_extension}"
                file_path = os.path.join(downloads_dir, filename)
                
                # Save file
                async with aiofiles.open(file_path, 'wb') as f:
                    await f.write(response.content)
                
                return file_path
                
        except Exception as e:
            print(f"Error downloading recording file: {str(e)}")
            return None