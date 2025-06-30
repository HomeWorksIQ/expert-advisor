import React, { useState } from 'react';
import { Header } from './components';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { expertId } = useParams();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'expert',
      name: 'Dr. Sarah Chen',
      text: 'Hello! I\'m available to help you. What can I assist you with today?',
      time: '2:30 PM',
      isOnline: true
    }
  ]);

  // Mock expert data
  const expert = {
    id: expertId,
    name: "Dr. Sarah Chen",
    specialty: "Family Medicine",
    profileImage: "https://images.unsplash.com/photo-1638202993928-7267aad84c31",
    isOnline: true,
    hourlyRate: 150
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
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
          name: expert.name,
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
                <h2 className="text-lg font-semibold text-gray-900">{expert.name}</h2>
                <p className="text-green-600 text-sm">{expert.specialty}</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${expert.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-600">
                    {expert.isOnline ? 'Online now' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">${expert.hourlyRate}/hour</p>
              <a
                href={`/book/${expertId}`}
                className="inline-block mt-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
              >
                Book Appointment
              </a>
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
      </div>
    </div>
  );
};

export default ChatPage;