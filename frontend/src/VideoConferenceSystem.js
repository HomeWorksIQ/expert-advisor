import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from './UserContext';

const VideoConferenceSystem = () => {
  const { user, API } = useUser();
  const [conferences, setConferences] = useState([]);
  const [activeConference, setActiveConference] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [mediaDevices, setMediaDevices] = useState({ cameras: [], microphones: [], speakers: [] });
  const [selectedDevices, setSelectedDevices] = useState({ camera: '', microphone: '', speaker: '' });
  const [conferenceSettings, setConferenceSettings] = useState({
    video: true,
    audio: true,
    screenShare: false,
    recording: false,
    backgroundBlur: false
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize media devices
  useEffect(() => {
    initializeMediaDevices();
    return () => {
      cleanupMedia();
    };
  }, []);

  // Load conferences
  useEffect(() => {
    if (user) {
      loadConferences();
    }
  }, [user]);

  // Update call duration
  useEffect(() => {
    if (isInCall && callStartTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInCall]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const initializeMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      
      setMediaDevices({ cameras, microphones, speakers });
      
      // Set default devices
      if (cameras.length > 0) setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      if (microphones.length > 0) setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      if (speakers.length > 0) setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));
    } catch (error) {
      console.error('Error initializing media devices:', error);
    }
  };

  const loadConferences = async () => {
    try {
      const response = await axios.get(`${API}/video-conferences/user/${user.id}`);
      setConferences(response.data);
    } catch (error) {
      console.error('Error loading conferences:', error);
    }
  };

  const createConference = async (conferenceData) => {
    try {
      const response = await axios.post(`${API}/video-conferences`, {
        ...conferenceData,
        host_id: user.id,
        conference_id: uuidv4()
      });
      
      await loadConferences();
      return response.data;
    } catch (error) {
      console.error('Error creating conference:', error);
      throw error;
    }
  };

  const joinConference = async (conferenceId) => {
    try {
      setConnectionStatus('connecting');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevices.camera ? { exact: selectedDevices.camera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          deviceId: selectedDevices.microphone ? { exact: selectedDevices.microphone } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join conference via API
      const response = await axios.post(`${API}/video-conferences/${conferenceId}/join`, {
        user_id: user.id
      });

      setActiveConference(response.data);
      setIsInCall(true);
      setConnectionStatus('connected');
      callStartTimeRef.current = Date.now();
      
      // Load participants and messages
      loadParticipants(conferenceId);
      loadChatMessages(conferenceId);
      
    } catch (error) {
      console.error('Error joining conference:', error);
      setConnectionStatus('disconnected');
    }
  };

  const leaveConference = async () => {
    try {
      if (activeConference) {
        await axios.post(`${API}/video-conferences/${activeConference.id}/leave`, {
          user_id: user.id
        });
      }
      
      cleanupMedia();
      setActiveConference(null);
      setIsInCall(false);
      setConnectionStatus('disconnected');
      setParticipants([]);
      setChatMessages([]);
      setCallDuration(0);
      callStartTimeRef.current = null;
      
    } catch (error) {
      console.error('Error leaving conference:', error);
    }
  };

  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    remoteStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    setRemoteStreams([]);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setConferenceSettings(prev => ({ ...prev, video: videoTrack.enabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setConferenceSettings(prev => ({ ...prev, audio: audioTrack.enabled }));
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track with screen share
      const videoTrack = screenStream.getVideoTracks()[0];
      if (localStream && videoTrack) {
        const sender = localStream.getVideoTracks()[0];
        // In a real WebRTC implementation, you would replace the track here
        setConferenceSettings(prev => ({ ...prev, screenShare: true }));
      }
      
      videoTrack.onended = () => {
        setConferenceSettings(prev => ({ ...prev, screenShare: false }));
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const loadParticipants = async (conferenceId) => {
    try {
      const response = await axios.get(`${API}/video-conferences/${conferenceId}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadChatMessages = async (conferenceId) => {
    try {
      const response = await axios.get(`${API}/video-conferences/${conferenceId}/messages`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !activeConference) return;

    try {
      const response = await axios.post(`${API}/video-conferences/${activeConference.id}/messages`, {
        user_id: user.id,
        message: newMessage,
        timestamp: new Date().toISOString()
      });

      setChatMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInCall && activeConference) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">{activeConference.title}</h1>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{formatDuration(callDuration)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{participants.length} participants</span>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Area */}
          <div className="flex-1 relative">
            {/* Local Video */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ display: conferenceSettings.video ? 'block' : 'none' }}
              />
              {!conferenceSettings.video && (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold">{user?.firstName?.[0]}</span>
                  </div>
                  <p className="text-gray-400">Camera is off</p>
                </div>
              )}
            </div>

            {/* Remote Videos */}
            <div className="absolute top-4 right-4 space-y-2">
              {remoteStreams.map((stream, index) => (
                <div key={index} className="w-40 h-30 bg-gray-700 rounded-lg overflow-hidden">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(ref) => {
                      if (ref) ref.srcObject = stream;
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Screen Share Indicator */}
            {conferenceSettings.screenShare && (
              <div className="absolute top-4 left-4 bg-blue-500 bg-opacity-90 px-3 py-1 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Sharing Screen</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {(showParticipants || showChat) && (
            <div className="w-80 bg-gray-900 border-l border-gray-700">
              {showParticipants && (
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold mb-3">Participants ({participants.length})</h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <img
                          src={participant.avatar || `https://ui-avatars.com/api/?name=${participant.name}&background=ef4444&color=fff`}
                          alt={participant.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm">{participant.name}</span>
                        {participant.is_host && (
                          <span className="text-xs bg-pink-500 px-2 py-1 rounded">Host</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {showChat && (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold">Chat</h3>
                  </div>
                  
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-4 space-y-3 overflow-y-auto"
                    style={{ maxHeight: '400px' }}
                  >
                    {chatMessages.map((message, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-pink-400">{message.sender_name}</div>
                        <div className="text-gray-300">{message.message}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                conferenceSettings.audio 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {conferenceSettings.audio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                conferenceSettings.video 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {conferenceSettings.video ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={startScreenShare}
              className={`p-3 rounded-full transition-colors ${
                conferenceSettings.screenShare 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Share className="w-5 h-5" />
            </button>
            
            <button
              onClick={leaveConference}
              className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Conference Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Camera</label>
                  <select
                    value={selectedDevices.camera}
                    onChange={(e) => setSelectedDevices(prev => ({ ...prev, camera: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                  >
                    {mediaDevices.cameras.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Microphone</label>
                  <select
                    value={selectedDevices.microphone}
                    onChange={(e) => setSelectedDevices(prev => ({ ...prev, microphone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                  >
                    {mediaDevices.microphones.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Speaker</label>
                  <select
                    value={selectedDevices.speaker}
                    onChange={(e) => setSelectedDevices(prev => ({ ...prev, speaker: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                  >
                    {mediaDevices.speakers.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Conferencing</h1>
          <p className="text-gray-400">Schedule and join video calls with experts and members</p>
        </div>

        {/* Conference Creation */}
        <ConferenceCreator onConferenceCreated={(conference) => {
          loadConferences();
          joinConference(conference.id);
        }} />

        {/* Conferences List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Conferences</h2>
          
          {conferences.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-xl font-semibold mb-2">No conferences yet</h3>
              <p className="text-gray-400">Create your first video conference to get started</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferences.map(conference => (
                <ConferenceCard
                  key={conference.id}
                  conference={conference}
                  onJoin={() => joinConference(conference.id)}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Conference Creator Component
const ConferenceCreator = ({ onConferenceCreated }) => {
  const { user, API } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60,
    max_participants: 10,
    is_private: false,
    require_approval: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API}/video-conferences`, {
        ...formData,
        host_id: user.id,
        conference_id: uuidv4()
      });
      
      onConferenceCreated(response.data);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        scheduled_time: '',
        duration_minutes: 60,
        max_participants: 10,
        is_private: false,
        require_approval: false
      });
    } catch (error) {
      console.error('Error creating conference:', error);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Create New Conference</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'New Conference'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conference Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter conference title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="Describe your conference"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                min="2"
                max="50"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                className="text-pink-500 focus:ring-pink-500 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Private Conference</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.require_approval}
                onChange={(e) => setFormData(prev => ({ ...prev, require_approval: e.target.checked }))}
                className="text-pink-500 focus:ring-pink-500 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Require Approval</span>
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Create Conference
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Conference Card Component
const ConferenceCard = ({ conference, onJoin, currentUser }) => {
  const isHost = conference.host_id === currentUser?.id;
  const scheduledTime = new Date(conference.scheduled_time);
  const isScheduled = conference.scheduled_time && scheduledTime > new Date();
  const canJoin = !isScheduled || (isScheduled && new Date() >= new Date(scheduledTime.getTime() - 10 * 60 * 1000)); // 10 minutes before

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{conference.title}</h3>
          {isHost && (
            <span className="inline-block px-2 py-1 bg-pink-500 text-white text-xs rounded">
              Host
            </span>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${conference.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
      </div>

      {conference.description && (
        <p className="text-gray-400 text-sm mb-4">{conference.description}</p>
      )}

      <div className="space-y-2 text-sm text-gray-400 mb-4">
        {conference.scheduled_time && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{scheduledTime.toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>{conference.duration_minutes} minutes</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{conference.current_participants || 0}/{conference.max_participants} participants</span>
        </div>
      </div>

      <button
        onClick={onJoin}
        disabled={!canJoin}
        className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isScheduled && !canJoin ? 'Scheduled' : 'Join Conference'}
      </button>
    </div>
  );
};

export default VideoConferenceSystem;