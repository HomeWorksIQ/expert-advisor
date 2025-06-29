import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './App';

// Teaser Countdown Component
export const TeaserCountdown = ({ remainingSeconds, onExpired, message }) => {
  const [seconds, setSeconds] = useState(remainingSeconds);

  useEffect(() => {
    setSeconds(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpired();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpired]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    return ((remainingSeconds - seconds) / remainingSeconds) * 100;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Preview Mode</span>
          </div>
          <div className="text-xl font-bold">
            {formatTime(seconds)}
          </div>
        </div>
        
        <button className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all text-sm font-medium">
          Subscribe Now
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${getProgressPercent()}%` }}
        />
      </div>
    </div>
  );
};

// Access Denied Component
export const AccessDenied = ({ reason, message, subscriptionRequired, onSubscribe }) => {
  const getIcon = () => {
    switch (reason) {
      case 'location_blocked':
        return (
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'user_blocked':
        return (
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      case 'subscription_required':
      case 'teaser_expired':
        return (
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const getTitle = () => {
    switch (reason) {
      case 'location_blocked':
        return 'Not Available in Your Location';
      case 'user_blocked':
        return 'Access Restricted';
      case 'subscription_required':
        return 'Subscription Required';
      case 'teaser_expired':
        return 'Preview Expired';
      default:
        return 'Access Denied';
    }
  };

  const getActionButton = () => {
    if (reason === 'user_blocked' || reason === 'location_blocked') {
      return null;
    }

    if (subscriptionRequired) {
      const subscriptionLabels = {
        monthly: 'Subscribe Monthly',
        per_visit: 'Pay for Access',
        teaser: 'Start Preview'
      };

      return (
        <button
          onClick={onSubscribe}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          {subscriptionLabels[subscriptionRequired] || 'Subscribe'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
          {getIcon()}
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {getTitle()}
          </h2>
          
          <p className="text-gray-400 mb-6">
            {message}
          </p>
          
          {getActionButton()}
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <a 
              href="/"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Access Controller Component
export const ProfileAccessController = ({ performerId, children }) => {
  const { user, API } = useUser();
  const [accessStatus, setAccessStatus] = useState('checking');
  const [accessData, setAccessData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [teaserExpired, setTeaserExpired] = useState(false);

  const checkAccess = useCallback(async () => {
    try {
      // First detect user location
      const locationResponse = await fetch(`${API}/detect-location`, {
        method: 'POST'
      });
      
      if (!locationResponse.ok) throw new Error('Location detection failed');
      
      const locationData = await locationResponse.json();
      setUserLocation(locationData.location);

      // Check profile access
      const accessResponse = await fetch(`${API}/check-profile-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performer_id: performerId,
          user_id: user?.id || null,
          location: locationData.location
        })
      });

      if (!accessResponse.ok) throw new Error('Access check failed');
      
      const access = await accessResponse.json();
      setAccessData(access);
      setAccessStatus(access.allowed ? 'allowed' : 'denied');
      
    } catch (error) {
      console.error('Access check error:', error);
      setAccessStatus('error');
    }
  }, [API, performerId, user?.id]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const handleTeaserExpired = () => {
    setTeaserExpired(true);
    setAccessStatus('denied');
  };

  const handleSubscribe = () => {
    // Redirect to subscription/payment page
    window.location.href = `/subscription/${performerId}`;
  };

  // Loading state
  if (accessStatus === 'checking') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-white text-lg">Checking access permissions...</p>
          {userLocation && (
            <p className="text-gray-400 text-sm mt-2">
              Detected location: {userLocation.city}, {userLocation.country}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (accessStatus === 'error') {
    return (
      <AccessDenied
        reason="error"
        message="Unable to verify access permissions. Please try again later."
      />
    );
  }

  // Access denied
  if (accessStatus === 'denied' || teaserExpired) {
    const reason = teaserExpired ? 'teaser_expired' : 
                   accessData?.reason?.includes('blocked') ? 
                   (accessData.reason.includes('User') ? 'user_blocked' : 'location_blocked') :
                   'subscription_required';

    return (
      <AccessDenied
        reason={reason}
        message={accessData?.message || 'Access to this profile is not available.'}
        subscriptionRequired={accessData?.subscription_required}
        onSubscribe={handleSubscribe}
      />
    );
  }

  // Teaser mode
  if (accessData?.access_level === 'teaser' && accessData?.teaser_remaining_seconds > 0) {
    return (
      <div>
        <TeaserCountdown
          remainingSeconds={accessData.teaser_remaining_seconds}
          onExpired={handleTeaserExpired}
          message={accessData.message}
        />
        <div style={{ paddingTop: '80px' }}> {/* Account for fixed teaser bar */}
          {children}
        </div>
      </div>
    );
  }

  // Full access granted
  return children;
};

// Location Display Component
export const LocationDisplay = ({ location, showDetails = true }) => {
  if (!location) return null;

  return (
    <div className="flex items-center text-gray-400 text-sm">
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {showDetails ? (
        <span>{location.city}, {location.state}, {location.country}</span>
      ) : (
        <span>{location.country}</span>
      )}
    </div>
  );
};

// Subscription Status Badge Component
export const SubscriptionStatusBadge = ({ subscriptionType, isActive = false }) => {
  const getStatusConfig = () => {
    switch (subscriptionType) {
      case 'free':
        return {
          label: 'Free',
          color: 'bg-green-500',
          icon: '🆓'
        };
      case 'monthly':
        return {
          label: isActive ? 'Subscribed' : 'Monthly Sub Required',
          color: isActive ? 'bg-blue-500' : 'bg-yellow-500',
          icon: '📅'
        };
      case 'per_visit':
        return {
          label: isActive ? 'Paid Access' : 'Pay Per Visit',
          color: isActive ? 'bg-purple-500' : 'bg-orange-500',
          icon: '💰'
        };
      case 'teaser':
        return {
          label: 'Preview Available',
          color: 'bg-pink-500',
          icon: '👀'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-500',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};