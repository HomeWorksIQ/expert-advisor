import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    key_type: '',
    service_name: '',
    api_key: '',
    api_secret: '',
    app_id: '',
    account_sid: '',
    auth_token: '',
    client_id: '',
    client_secret: '',
    environment: 'production',
    description: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const apiKeyTypes = [
    { value: 'agora', label: 'Agora Video' },
    { value: 'twilio_video', label: 'Twilio Video' },
    { value: 'jitsi', label: 'Jitsi Meet' },
    { value: 'google_calendar', label: 'Google Calendar' },
    { value: 'microsoft_outlook', label: 'Microsoft Outlook' },
    { value: 'firebase_fcm', label: 'Firebase FCM' },
    { value: 'twilio_sms', label: 'Twilio SMS' },
    { value: 'aws_s3', label: 'AWS S3' },
    { value: 'google_cloud_storage', label: 'Google Cloud Storage' },
    { value: 'cloudinary', label: 'Cloudinary' },
    { value: 'usps', label: 'USPS' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'stripe_connect', label: 'Stripe Connect' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' }
  ];

  useEffect(() => {
    if (activeTab === 'api-keys') {
      fetchApiKeys();
    }
  }, [activeTab]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/api-keys`);
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/admin/api-keys`, newApiKey);
      
      // Reset form
      setNewApiKey({
        key_type: '',
        service_name: '',
        api_key: '',
        api_secret: '',
        app_id: '',
        account_sid: '',
        auth_token: '',
        client_id: '',
        client_secret: '',
        environment: 'production',
        description: ''
      });
      
      // Refresh API keys list
      await fetchApiKeys();
      alert('API key created successfully!');
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/api-keys/${keyId}`);
      await fetchApiKeys();
      alert('API key deleted successfully!');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      alert('Failed to delete API key. Please try again.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'content', label: 'Content', icon: '📱' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">1,234</p>
          </div>
          <div className="text-3xl">👥</div>
        </div>
        <p className="text-green-400 text-sm mt-2">+12% from last month</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Active Performers</p>
            <p className="text-2xl font-bold text-white">567</p>
          </div>
          <div className="text-3xl">🎭</div>
        </div>
        <p className="text-green-400 text-sm mt-2">+8% from last month</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Monthly Revenue</p>
            <p className="text-2xl font-bold text-white">$45,678</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
        <p className="text-green-400 text-sm mt-2">+15% from last month</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Live Sessions</p>
            <p className="text-2xl font-bold text-white">23</p>
          </div>
          <div className="text-3xl">📹</div>
        </div>
        <p className="text-blue-400 text-sm mt-2">Currently active</p>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      {/* Create New API Key Form */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Add New API Key</h3>
        <form onSubmit={handleCreateApiKey} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
            <select
              value={newApiKey.key_type}
              onChange={(e) => setNewApiKey({ ...newApiKey, key_type: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              <option value="">Select Service Type</option>
              {apiKeyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Service Name</label>
            <input
              type="text"
              value={newApiKey.service_name}
              onChange={(e) => setNewApiKey({ ...newApiKey, service_name: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="e.g., Agora Production"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
            <input
              type="password"
              value={newApiKey.api_key}
              onChange={(e) => setNewApiKey({ ...newApiKey, api_key: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
            <input
              type="password"
              value={newApiKey.api_secret}
              onChange={(e) => setNewApiKey({ ...newApiKey, api_secret: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter API Secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">App ID</label>
            <input
              type="text"
              value={newApiKey.app_id}
              onChange={(e) => setNewApiKey({ ...newApiKey, app_id: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter App ID (if applicable)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Environment</label>
            <select
              value={newApiKey.environment}
              onChange={(e) => setNewApiKey({ ...newApiKey, environment: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={newApiKey.description}
              onChange={(e) => setNewApiKey({ ...newApiKey, description: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Optional description or notes"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create API Key'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing API Keys */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Existing API Keys</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading API keys...</div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400">No API keys configured yet.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-300">Service</th>
                  <th className="pb-3 text-gray-300">Type</th>
                  <th className="pb-3 text-gray-300">Environment</th>
                  <th className="pb-3 text-gray-300">Status</th>
                  <th className="pb-3 text-gray-300">Created</th>
                  <th className="pb-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(key => (
                  <tr key={key.id} className="border-b border-gray-700">
                    <td className="py-3 text-white">{key.service_name}</td>
                    <td className="py-3 text-gray-300">{key.key_type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        key.environment === 'production' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        key.status === 'active' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (tabName) => (
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold text-white mb-2">{tabName} Management</h3>
      <p className="text-gray-400">This section will be implemented with advanced {tabName.toLowerCase()} management features.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your Eye Candy platform</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'api-keys' && renderApiKeys()}
          {activeTab === 'users' && renderPlaceholder('Users')}
          {activeTab === 'content' && renderPlaceholder('Content')}
          {activeTab === 'payments' && renderPlaceholder('Payments')}
          {activeTab === 'analytics' && renderPlaceholder('Analytics')}
          {activeTab === 'settings' && renderPlaceholder('Settings')}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;