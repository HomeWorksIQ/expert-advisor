import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useParams } from 'react-router-dom';
import { getExpertById } from './data/experts';

const ChatPage = () => {
  const { expertId } = useParams();
  const [message, setMessage] = useState('');
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    // Find expert by ID using shared data and set initial chat message
    setTimeout(() => {
      const foundExpert = getExpertById(expertId);
      setExpert(foundExpert);
      
      if (foundExpert) {
        // Set initial chat message from expert
        setChatMessages([
          {
            id: 1,
            sender: 'expert',
            name: foundExpert.displayName,
            text: `Hello! I'm available to help you. What can I assist you with today?`,
            time: '2:30 PM',
            isOnline: foundExpert.isOnline
          }
        ]);
      }
      
      setIsLoading(false);
    }, 500);
  }, [expertId]);

  // Timer effect for session tracking
  useEffect(() => {
    let interval = null;
    
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - sessionStartTime) / 1000); // in seconds
        setElapsedTime(elapsed);
        
        // Calculate cost (hourly rate / 3600 seconds * elapsed seconds)
        if (expert) {
          const costPerSecond = expert.hourlyRate / 3600;
          const currentCost = costPerSecond * elapsed;
          setTotalCost(currentCost);
        }
      }, 1000);
    } else if (!isSessionActive) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime, expert]);

  // Start session when first message is sent
  const startSession = () => {
    if (!isSessionActive) {
      setSessionStartTime(new Date().getTime());
      setIsSessionActive(true);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Expert Not Found</h2>
            <p className="text-gray-600 mb-6">The expert you're looking for doesn't exist.</p>
            <a href="/discover" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Browse All Experts
            </a>
          </div>
        </div>
      </div>
    );
  }

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Start session timer on first message
      startSession();
      
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'user',
        name: 'You',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
      
      // Simulate expert response
      setTimeout(() => {
        const expertResponse = {
          id: chatMessages.length + 2,
          sender: 'expert',
          name: expert.displayName,
          text: 'Thank you for your message. I understand your concern. Let me provide some guidance on that...',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, expertResponse]);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Chat Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={expert.profileImage}
                alt={expert.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{expert.displayName}</h2>
                <p className="text-green-600 text-sm">{expert.specialty}</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${expert.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-600">
                    {expert.isOnline ? 'Online now' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-gray-600 text-right">${expert.hourlyRate}/hour</p>
              
              {/* Session Timer */}
              {isSessionActive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-right">
                  <div className="text-sm font-semibold text-blue-900">Session Time</div>
                  <div className="text-lg font-mono text-blue-600">{formatTime(elapsedTime)}</div>
                  <div className="text-xs text-blue-700">Amount Due: ${totalCost.toFixed(2)}</div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <a
                  href={`/profile/${expertId}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                >
                  View Profile
                </a>
                <a
                  href={`/book/${expertId}`}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium">{msg.name}</span>
                    <span className="text-xs opacity-75">{msg.time}</span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Chat Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Chat Session Information
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>• Chat sessions are billed at ${expert.hourlyRate}/hour</p>
                <p>• Session timer starts when the expert responds</p>
                <p>• You can book a formal appointment for longer discussions</p>
                <p>• All conversations are confidential and secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Need More Time with {expert.firstName}?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href={`/profile/${expertId}`}
              className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>👤</span>
              <div className="text-center">
                <div className="font-medium text-gray-900">View Full Profile</div>
                <div className="text-sm text-gray-600">See credentials, reviews & more</div>
              </div>
            </a>
            <a 
              href={`/book/${expertId}`}
              className="flex items-center justify-center gap-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span>📅</span>
              <div className="text-center">
                <div className="font-medium text-green-600">Schedule Appointment</div>
                <div className="text-sm text-green-500">Video call, phone, or in-person</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;