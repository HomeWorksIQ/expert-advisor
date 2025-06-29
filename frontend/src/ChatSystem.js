import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from './App';

const ChatSystem = () => {
  const { user, API } = useUser();
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(`${API}/chat/rooms/${user.id}`);
      setChatRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/chat/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageData = {
        sender_id: user.id,
        message_type: 'text',
        content: newMessage.trim()
      };

      const response = await axios.post(`${API}/chat/rooms/${activeChat.id}/messages`, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        
        const messageData = {
          sender_id: user.id,
          message_type: file.type.startsWith('image/') ? 'image' : 'file',
          content: file.name,
          media_url: base64Data,
          media_type: file.type,
          media_size: file.size
        };

        const response = await axios.post(`${API}/chat/rooms/${activeChat.id}/messages`, messageData);
        setMessages(prev => [...prev, response.data]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const createChatRoom = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const chatData = {
        chat_type: selectedUsers.length > 1 ? 'group_chat' : 'direct_message',
        participants: [user.id, ...selectedUsers.map(u => u.id)],
        creator_id: user.id,
        name: selectedUsers.length > 1 ? `Group with ${selectedUsers.map(u => u.firstName).join(', ')}` : null
      };

      const response = await axios.post(`${API}/chat/rooms`, chatData);
      setChatRooms(prev => [response.data, ...prev]);
      setActiveChat(response.data);
      setShowCreateChat(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message) => {
    const isOwn = message.sender_id === user.id;
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          {message.message_type === 'image' && (
            <img 
              src={message.media_url} 
              alt="Shared image" 
              className="max-w-full h-auto rounded mb-2"
            />
          )}
          {message.message_type === 'file' && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-2xl">📎</div>
              <div>
                <div className="text-sm font-medium">{message.content}</div>
                <div className="text-xs opacity-75">
                  {(message.media_size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          )}
          {message.message_type === 'text' && (
            <p className="text-sm">{message.content}</p>
          )}
          <p className={`text-xs mt-1 ${isOwn ? 'text-pink-200' : 'text-gray-400'}`}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-gray-700 bg-gray-900">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Messages</h2>
              <button
                onClick={() => setShowCreateChat(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg hover:from-pink-600 hover:to-purple-700"
              >
                ➕
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {chatRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setActiveChat(room)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                  activeChat?.id === room.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {room.chat_type === 'group_chat' ? '👥' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {room.name || `Chat Room ${room.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {room.message_count} messages
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 bg-gray-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    {activeChat.chat_type === 'group_chat' ? '👥' : '👤'}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {activeChat.name || `Chat ${activeChat.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activeChat.participants.length} participants
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-800">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-gray-400">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-gray-400">No messages yet. Start the conversation!</div>
                  </div>
                ) : (
                  <div>
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 bg-gray-900">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    📎
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-lg hover:from-pink-600 hover:to-purple-700"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      {showCreateChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Start New Chat</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4 max-h-48 overflow-y-auto">
              {/* This would be populated with search results */}
              <div className="text-gray-400 text-center py-4">
                Search functionality will be implemented with user search API
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateChat(false)}
                className="flex-1 p-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createChatRoom}
                disabled={selectedUsers.length === 0}
                className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg disabled:opacity-50"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;