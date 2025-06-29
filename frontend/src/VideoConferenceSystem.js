import React, { useState, useRef, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { connect } from 'twilio-video';
import axios from 'axios';
import { useUser } from './App';

const VideoConferenceSystem = () => {
  const { user, API } = useUser();
  const [activeProvider, setActiveProvider] = useState('agora');
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Agora specific states
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());

  // Twilio specific states
  const [twilioRoom, setTwilioRoom] = useState(null);
  
  // Jitsi specific states
  const [jitsiConfig, setJitsiConfig] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    if (user?.userType === 'performer') {
      fetchRecordings();
    }
  }, [user]);

  const fetchRecordings = async () => {
    try {
      const response = await axios.get(`${API}/video/recordings/${user.id}`);
      setRecordings(response.data.recordings);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  };

  // Agora Functions
  const initializeAgora = async () => {
    try {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // Get token from backend
      const tokenResponse = await axios.post(`${API}/video/agora/token`, {
        channel: roomName,
        uid: 0,
        role: 1
      });
      
      const { token } = tokenResponse.data;
      
      // Create local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      // Join channel
      await client.join(process.env.REACT_APP_AGORA_APP_ID, roomName, token, 0);
      
      // Publish tracks
      await client.publish([audioTrack, videoTrack]);
      
      // Play local video
      videoTrack.play(localVideoRef.current);
      
      // Handle remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          const remoteVideoContainer = document.createElement('div');
          remoteVideoContainer.style.width = '320px';
          remoteVideoContainer.style.height = '240px';
          remoteVideoRef.current.appendChild(remoteVideoContainer);
          user.videoTrack.play(remoteVideoContainer);
        }
        
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
        
        setRemoteUsers(prev => new Map(prev.set(user.uid, user)));
      });
      
      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(user.uid);
          return newMap;
        });
      });
      
      setAgoraClient(client);
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      setIsInMeeting(true);
      
    } catch (error) {
      console.error('Agora initialization failed:', error);
      alert('Failed to join Agora meeting');
    }
  };

  const startAgoraScreenShare = async () => {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      
      await agoraClient.unpublish(localVideoTrack);
      await agoraClient.publish(screenTrack);
      
      screenTrack.play(screenShareRef.current);
      setScreenTrack(screenTrack);
      
      screenTrack.on('track-ended', () => {
        stopAgoraScreenShare();
      });
      
    } catch (error) {
      console.error('Screen sharing failed:', error);
    }
  };

  const stopAgoraScreenShare = async () => {
    if (screenTrack) {
      await agoraClient.unpublish(screenTrack);
      screenTrack.close();
      await agoraClient.publish(localVideoTrack);
      localVideoTrack.play(localVideoRef.current);
      setScreenTrack(null);
    }
  };

  const leaveAgoraRoom = async () => {
    if (agoraClient) {
      await agoraClient.leave();
      localAudioTrack?.close();
      localVideoTrack?.close();
      screenTrack?.close();
      setAgoraClient(null);
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setScreenTrack(null);
      setRemoteUsers(new Map());
    }
    setIsInMeeting(false);
  };

  // Twilio Functions
  const initializeTwilio = async () => {
    try {
      // Get token from backend
      const tokenResponse = await axios.post(`${API}/video/twilio/token`, {
        identity: user.username || user.id,
        room: roomName
      });
      
      const { token } = tokenResponse.data;
      
      // Connect to room
      const room = await connect(token, {
        audio: true,
        video: { width: 640 }
      });
      
      // Display local video
      room.localParticipant.tracks.forEach(publication => {
        if (publication.track) {
          const element = publication.track.attach();
          localVideoRef.current.appendChild(element);
        }
      });
      
      // Handle remote participants
      room.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          if (publication.track) {
            const element = publication.track.attach();
            remoteVideoRef.current.appendChild(element);
          }
        });
      });
      
      room.on('participantConnected', participant => {
        participant.tracks.forEach(publication => {
          if (publication.track) {
            const element = publication.track.attach();
            remoteVideoRef.current.appendChild(element);
          }
        });
      });
      
      setTwilioRoom(room);
      setIsInMeeting(true);
      
    } catch (error) {
      console.error('Twilio initialization failed:', error);
      alert('Failed to join Twilio meeting');
    }
  };

  const startTwilioScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 }
      });
      
      const screenTrack = new window.Twilio.Video.LocalVideoTrack(
        stream.getVideoTracks()[0],
        { name: 'screen' }
      );
      
      await twilioRoom.localParticipant.publishTrack(screenTrack);
      screenTrack.attach(screenShareRef.current);
      
      screenTrack.on('stopped', () => {
        twilioRoom.localParticipant.unpublishTrack(screenTrack);
      });
      
    } catch (error) {
      console.error('Twilio screen sharing failed:', error);
    }
  };

  const leaveTwilioRoom = () => {
    if (twilioRoom) {
      twilioRoom.disconnect();
      setTwilioRoom(null);
    }
    setIsInMeeting(false);
  };

  // Jitsi Functions
  const initializeJitsi = async () => {
    try {
      // Get room configuration from backend
      const configResponse = await axios.post(`${API}/video/jitsi/room`, {
        room_name: roomName,
        user_name: user.username || user.firstName
      });
      
      const config = configResponse.data.config;
      setJitsiConfig(config);
      
      // Load Jitsi Meet API
      if (window.JitsiMeetExternalAPI) {
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: config.room_name,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: config.user_name
          },
          configOverwrite: config.config,
          interfaceConfigOverwrite: config.interface_config
        });
        
        api.addEventListener('videoConferenceJoined', () => {
          setIsInMeeting(true);
        });
        
        api.addEventListener('videoConferenceLeft', () => {
          setIsInMeeting(false);
        });
        
        return api;
      } else {
        // Load Jitsi Meet API script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.onload = () => {
          initializeJitsi();
        };
        document.head.appendChild(script);
      }
      
    } catch (error) {
      console.error('Jitsi initialization failed:', error);
      alert('Failed to initialize Jitsi meeting');
    }
  };

  // Recording Functions
  const startRecording = async () => {
    try {
      setLoading(true);
      
      const sessionData = {
        session_id: `session_${Date.now()}`,
        performer_id: user.id,
        participants: [user.id],
        channel: roomName,
        room_sid: twilioRoom?.sid,
        uid: 0
      };
      
      const response = await axios.post(`${API}/video/recording/start`, {
        provider: activeProvider,
        session_data: sessionData
      });
      
      setRecordingId(response.data.recording_id);
      setIsRecording(true);
      alert('Recording started successfully!');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording');
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      setLoading(true);
      
      await axios.post(`${API}/video/recording/stop/${recordingId}`);
      
      setIsRecording(false);
      setRecordingId(null);
      await fetchRecordings();
      alert('Recording stopped successfully!');
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording');
    } finally {
      setLoading(false);
    }
  };

  const downloadRecording = async (recordingId) => {
    try {
      const response = await axios.get(`${API}/video/recordings/${recordingId}/download`);
      alert(`Recording downloaded to: ${response.data.download_path}`);
    } catch (error) {
      console.error('Failed to download recording:', error);
      alert('Failed to download recording');
    }
  };

  // Main control functions
  const joinMeeting = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    
    switch (activeProvider) {
      case 'agora':
        await initializeAgora();
        break;
      case 'twilio':
        await initializeTwilio();
        break;
      case 'jitsi':
        await initializeJitsi();
        break;
      default:
        alert('Unknown provider');
    }
  };

  const leaveMeeting = async () => {
    if (isRecording) {
      await stopRecording();
    }
    
    switch (activeProvider) {
      case 'agora':
        await leaveAgoraRoom();
        break;
      case 'twilio':
        leaveTwilioRoom();
        break;
      case 'jitsi':
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = '';
        }
        setIsInMeeting(false);
        break;
    }
  };

  const shareScreen = async () => {
    switch (activeProvider) {
      case 'agora':
        if (screenTrack) {
          await stopAgoraScreenShare();
        } else {
          await startAgoraScreenShare();
        }
        break;
      case 'twilio':
        await startTwilioScreenShare();
        break;
      case 'jitsi':
        // Jitsi handles screen sharing through its own UI
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Live Video Conferencing
          </h1>
          <p className="text-gray-400 mt-2">
            Multi-provider video conferencing with recording capabilities
          </p>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {['agora', 'twilio', 'jitsi'].map(provider => (
              <button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeProvider === provider
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={isInMeeting}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Room Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={isInMeeting}
            />
            {!isInMeeting ? (
              <button
                onClick={joinMeeting}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium"
                disabled={!roomName.trim()}
              >
                Join Meeting
              </button>
            ) : (
              <button
                onClick={leaveMeeting}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium"
              >
                Leave Meeting
              </button>
            )}
          </div>

          {/* Meeting Controls */}
          {isInMeeting && (
            <div className="flex space-x-4">
              {activeProvider !== 'jitsi' && (
                <button
                  onClick={shareScreen}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  {screenTrack ? 'Stop Screen Share' : 'Share Screen'}
                </button>
              )}
              
              {user?.userType === 'performer' && (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                      disabled={loading}
                    >
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-red-800 hover:bg-red-900 px-4 py-2 rounded-lg"
                      disabled={loading}
                    >
                      Stop Recording
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Video Container */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {activeProvider === 'jitsi' ? (
            <div
              ref={jitsiContainerRef}
              className="w-full h-96 bg-gray-900 rounded-lg"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Video */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-700">
                  <h3 className="text-sm font-medium">Local Video</h3>
                </div>
                <div
                  ref={localVideoRef}
                  className="w-full h-64 bg-gray-900 flex items-center justify-center"
                >
                  {!isInMeeting && (
                    <span className="text-gray-500">Join a meeting to see your video</span>
                  )}
                </div>
              </div>

              {/* Remote Video */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-700">
                  <h3 className="text-sm font-medium">Remote Participants</h3>
                </div>
                <div
                  ref={remoteVideoRef}
                  className="w-full h-64 bg-gray-900 flex items-center justify-center"
                >
                  {!isInMeeting && (
                    <span className="text-gray-500">Waiting for participants...</span>
                  )}
                </div>
              </div>

              {/* Screen Share */}
              {screenTrack && (
                <div className="md:col-span-2 bg-gray-900 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-700">
                    <h3 className="text-sm font-medium">Screen Share</h3>
                  </div>
                  <div
                    ref={screenShareRef}
                    className="w-full h-64 bg-gray-900"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recordings List */}
        {user?.userType === 'performer' && recordings.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Recordings</h3>
            <div className="space-y-4">
              {recordings.map(recording => (
                <div key={recording.recording_id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{recording.room_id}</h4>
                      <p className="text-sm text-gray-400">
                        Provider: {recording.provider} | Status: {recording.status}
                      </p>
                      <p className="text-sm text-gray-400">
                        Created: {new Date(recording.created_at).toLocaleString()}
                      </p>
                      {recording.duration && (
                        <p className="text-sm text-gray-400">
                          Duration: {recording.duration}s
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => downloadRecording(recording.recording_id)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      disabled={recording.status !== 'stopped'}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConferenceSystem;