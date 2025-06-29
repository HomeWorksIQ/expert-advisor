import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './App';

// Location Selection Component
export const LocationSelector = ({ onLocationSelect, selectedLocations = [], excludeMode = false }) => {
  const [countries] = useState([
    { code: 'US', name: 'United States', states: [
      { code: 'CA', name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { code: 'NY', name: 'New York', cities: ['New York City', 'Buffalo', 'Albany'] },
      { code: 'TX', name: 'Texas', cities: ['Houston', 'Dallas', 'Austin'] },
      { code: 'FL', name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa'] }
    ]},
    { code: 'CA', name: 'Canada', states: [
      { code: 'ON', name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Hamilton'] },
      { code: 'BC', name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey'] }
    ]},
    { code: 'GB', name: 'United Kingdom', states: [
      { code: 'ENG', name: 'England', cities: ['London', 'Manchester', 'Birmingham'] },
      { code: 'SCT', name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] }
    ]},
    { code: 'AU', name: 'Australia', states: [
      { code: 'NSW', name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong'] },
      { code: 'VIC', name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat'] }
    ]}
  ]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [locationType, setLocationType] = useState('country');

  const handleAddLocation = () => {
    if (!selectedCountry) return;

    let locationData = {
      type: locationType,
      value: '',
      displayName: '',
      isAllowed: !excludeMode
    };

    switch (locationType) {
      case 'country':
        locationData.value = selectedCountry;
        locationData.displayName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry;
        break;
      case 'state':
        if (!selectedState) return;
        locationData.value = selectedState;
        const country = countries.find(c => c.code === selectedCountry);
        const state = country?.states.find(s => s.code === selectedState);
        locationData.displayName = `${state?.name || selectedState}, ${country?.name || selectedCountry}`;
        break;
      case 'city':
        if (!selectedCity) return;
        locationData.value = selectedCity;
        const countryObj = countries.find(c => c.code === selectedCountry);
        const stateObj = countryObj?.states.find(s => s.code === selectedState);
        locationData.displayName = `${selectedCity}, ${stateObj?.name || selectedState}, ${countryObj?.name || selectedCountry}`;
        break;
      case 'zip_code':
        if (!zipCode) return;
        locationData.value = zipCode;
        locationData.displayName = `ZIP: ${zipCode}`;
        break;
      default:
        return;
    }

    onLocationSelect(locationData);
    
    // Reset form
    setSelectedState('');
    setSelectedCity('');
    setZipCode('');
  };

  const getStateOptions = () => {
    const country = countries.find(c => c.code === selectedCountry);
    return country?.states || [];
  };

  const getCityOptions = () => {
    const country = countries.find(c => c.code === selectedCountry);
    const state = country?.states.find(s => s.code === selectedState);
    return state?.cities || [];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        {excludeMode ? 'Exclude Locations' : 'Allow Locations'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location Type
          </label>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
          >
            <option value="country">Country</option>
            <option value="state">State/Province</option>
            <option value="city">City</option>
            <option value="zip_code">ZIP Code</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState('');
              setSelectedCity('');
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {(locationType === 'state' || locationType === 'city') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              State/Province
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              disabled={!selectedCountry}
            >
              <option value="">Select State</option>
              {getStateOptions().map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {locationType === 'city' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              disabled={!selectedState}
            >
              <option value="">Select City</option>
              {getCityOptions().map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {locationType === 'zip_code' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleAddLocation}
        className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
      >
        {excludeMode ? 'Add Exclusion' : 'Add Location'}
      </button>

      {selectedLocations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-white mb-3">
            {excludeMode ? 'Excluded Locations:' : 'Allowed Locations:'}
          </h4>
          <div className="space-y-2">
            {selectedLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <span className="text-white">{location.displayName}</span>
                <button
                  onClick={() => onLocationSelect(location, true)} // true for remove
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subscription Type Selector
export const SubscriptionTypeSelector = ({ value, onChange, locations }) => {
  const subscriptionTypes = [
    { 
      value: 'free', 
      label: 'Free Access', 
      description: 'Anyone can view your profile for free',
      icon: '🆓'
    },
    { 
      value: 'monthly', 
      label: 'Monthly Subscription', 
      description: 'Users need a monthly subscription to view your profile',
      icon: '📅'
    },
    { 
      value: 'per_visit', 
      label: 'Pay Per Visit', 
      description: 'Users pay a one-time fee to view your profile',
      icon: '💰'
    },
    { 
      value: 'teaser', 
      label: 'Teaser Mode', 
      description: 'Users get a limited preview before paying',
      icon: '👀'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Subscription Type</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptionTypes.map(type => (
          <label
            key={type.value}
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
              value === type.value
                ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input
              type="radio"
              name="subscriptionType"
              value={type.value}
              checked={value === type.value}
              onChange={(e) => onChange(e.target.value)}
              className="text-pink-500 focus:ring-pink-500 mt-1"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{type.icon}</span>
                <div className="text-white font-medium">{type.label}</div>
              </div>
              <div className="text-gray-400 text-sm mt-1">{type.description}</div>
            </div>
          </label>
        ))}
      </div>

      {locations.length > 0 && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            This subscription type will apply to: {locations.map(l => l.displayName).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// Teaser Settings Component
export const TeaserSettings = ({ settings, onSettingsChange }) => {
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [duration, setDuration] = useState(settings?.duration_seconds || 30);
  const [message, setMessage] = useState(settings?.message || "Preview time expired! Subscribe to continue viewing my profile.");

  useEffect(() => {
    onSettingsChange({
      enabled,
      duration_seconds: duration,
      message
    });
  }, [enabled, duration, message]);

  const durationOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 45, label: '45 seconds' },
    { value: 60, label: '1 minute' },
    { value: 90, label: '1.5 minutes' },
    { value: 120, label: '2 minutes' },
    { value: 180, label: '3 minutes' },
    { value: 300, label: '5 minutes' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Teaser Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="text-pink-500 focus:ring-pink-500 rounded"
          />
          <span className="ml-2 text-white">Enable teaser mode</span>
        </label>

        {enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teaser Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Message shown when teaser expires..."
              />
            </div>

            <div className="p-4 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-400 font-medium">Teaser Mode Info</p>
                  <p className="text-gray-300 text-sm mt-1">
                    Users will see your profile for {duration} seconds, then need to subscribe to continue viewing.
                    Each user gets one teaser session per visit.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// User Blocking Component
export const UserBlockingManager = ({ performerId }) => {
  const { API } = useUser();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [newBlock, setNewBlock] = useState({
    userId: '',
    reason: 'harassment',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const blockReasons = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'bad_language', label: 'Bad Language' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' }
  ];

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API}/performer/${performerId}/blocked-users`);
      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
    }
  }, [API, performerId]);

  useEffect(() => {
    if (performerId) {
      fetchBlockedUsers();
    }
  }, [performerId, fetchBlockedUsers]);

  const handleBlockUser = async () => {
    if (!newBlock.userId.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API}/performer/${performerId}/block-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked_user_id: newBlock.userId,
          reason: newBlock.reason,
          notes: newBlock.notes
        })
      });

      if (response.ok) {
        setNewBlock({ userId: '', reason: 'harassment', notes: '' });
        fetchBlockedUsers();
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
    setIsLoading(false);
  };

  const handleUnblockUser = async (blockedUserId) => {
    try {
      const response = await fetch(`${API}/performer/${performerId}/unblock-user/${blockedUserId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBlockedUsers();
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">User Blocking</h3>
      
      {/* Block New User */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User ID or Username
          </label>
          <input
            type="text"
            value={newBlock.userId}
            onChange={(e) => setNewBlock({...newBlock, userId: e.target.value})}
            placeholder="Enter user ID or username to block"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason for Blocking
          </label>
          <select
            value={newBlock.reason}
            onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
          >
            {blockReasons.map(reason => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (optional)
          </label>
          <textarea
            value={newBlock.notes}
            onChange={(e) => setNewBlock({...newBlock, notes: e.target.value})}
            rows={2}
            placeholder="Additional details about this block..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        <button
          onClick={handleBlockUser}
          disabled={isLoading || !newBlock.userId.trim()}
          className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Blocking...' : 'Block User'}
        </button>
      </div>

      {/* Blocked Users List */}
      {blockedUsers.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Blocked Users ({blockedUsers.length})</h4>
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                <div className="flex-1">
                  <div className="text-white font-medium">{user.blocked_user_id}</div>
                  <div className="text-gray-400 text-sm">
                    Reason: {blockReasons.find(r => r.value === user.reason)?.label || user.reason}
                  </div>
                  {user.notes && (
                    <div className="text-gray-400 text-sm mt-1">Notes: {user.notes}</div>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    Blocked: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleUnblockUser(user.blocked_user_id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockedUsers.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          <p className="text-gray-400">No blocked users</p>
        </div>
      )}
    </div>
  );
};

// Main Geo-Location Settings Component
export const GeolocationSettings = ({ performerId }) => {
  const { API } = useUser();
  const [allowedLocations, setAllowedLocations] = useState([]);
  const [excludedLocations, setExcludedLocations] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState('free');
  const [teaserSettings, setTeaserSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelect = (location, isRemove = false, isExclude = false) => {
    if (isRemove) {
      if (isExclude) {
        setExcludedLocations(prev => prev.filter((_, index) => index !== location));
      } else {
        setAllowedLocations(prev => prev.filter((_, index) => index !== location));
      }
    } else {
      const newLocation = {
        ...location,
        subscriptionType: subscriptionType
      };
      
      if (isExclude) {
        setExcludedLocations(prev => [...prev, newLocation]);
      } else {
        setAllowedLocations(prev => [...prev, newLocation]);
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save location preferences
      const allLocations = [
        ...allowedLocations.map(loc => ({
          location_type: loc.type,
          location_value: loc.value,
          is_allowed: true,
          subscription_type: loc.subscriptionType
        })),
        ...excludedLocations.map(loc => ({
          location_type: loc.type,
          location_value: loc.value,
          is_allowed: false,
          subscription_type: 'free'
        }))
      ];

      // Save each location preference
      for (const location of allLocations) {
        await fetch(`${API}/performer/${performerId}/location-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location)
        });
      }

      // Save teaser settings if teaser mode is used
      if (allowedLocations.some(loc => loc.subscriptionType === 'teaser') || subscriptionType === 'teaser') {
        await fetch(`${API}/performer/${performerId}/teaser-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teaserSettings)
        });
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Geo-Location & Access Settings</h2>
        <p className="text-gray-400">
          Control who can access your profile based on their location and set subscription requirements.
        </p>
      </div>

      {/* Allowed Locations */}
      <LocationSelector
        onLocationSelect={(location, isRemove) => handleLocationSelect(location, isRemove, false)}
        selectedLocations={allowedLocations}
        excludeMode={false}
      />

      {/* Subscription Type for Allowed Locations */}
      <SubscriptionTypeSelector
        value={subscriptionType}
        onChange={setSubscriptionType}
        locations={allowedLocations}
      />

      {/* Teaser Settings */}
      {subscriptionType === 'teaser' && (
        <TeaserSettings
          settings={teaserSettings}
          onSettingsChange={setTeaserSettings}
        />
      )}

      {/* Excluded Locations */}
      <LocationSelector
        onLocationSelect={(location, isRemove) => handleLocationSelect(location, isRemove, true)}
        selectedLocations={excludedLocations}
        excludeMode={true}
      />

      {/* User Blocking */}
      <UserBlockingManager performerId={performerId} />

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};