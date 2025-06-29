import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './App';
import TrialExpirationModal from './TrialExpirationModal';

const TrialStatusComponent = () => {
  const { user, API } = useUser();
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrialStatus();
    }
  }, [user]);

  // Auto-show expiration modal for expired or expiring trials
  useEffect(() => {
    if (trialData && (trialData.status === 'expired' || (trialData.days_remaining <= 1 && trialData.status === 'active'))) {
      setShowExpirationModal(true);
    }
  }, [trialData]);

  const fetchTrialStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/trials/${user.id}`);
      if (response.data.success && response.data.trial) {
        setTrialData(response.data.trial);
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToMembership = async (subscriptionType) => {
    try {
      const response = await axios.post(`${API}/trials/${user.id}/convert`, {
        subscription_type: subscriptionType
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setShowUpgradeModal(false);
        fetchTrialStatus();
      }
    } catch (error) {
      console.error('Failed to convert trial:', error);
      alert('Failed to upgrade. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      case 'used': return 'text-gray-400';
      default: return 'text-yellow-400';
    }
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 1) return 'border-red-500 bg-red-900/20';
    if (daysRemaining <= 3) return 'border-yellow-500 bg-yellow-900/20';
    return 'border-green-500 bg-green-900/20';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!trialData) {
    return null;
  }

  const { status, days_remaining, days_used, trial_end_date, benefits_unlocked } = trialData;
  const isActive = status === 'active';
  const isExpiring = days_remaining <= 3 && isActive;

  return (
    <div className={`border-2 rounded-lg p-4 mb-6 ${getUrgencyColor(days_remaining)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">✨</div>
          <div>
            <h3 className="font-semibold text-white">Free Trial</h3>
            <span className={`text-sm ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        {isActive && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{days_remaining}</div>
            <div className="text-xs text-gray-400">days left</div>
          </div>
        )}
      </div>

      {isActive && (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Trial Progress</span>
              <span>{days_used}/{days_used + days_remaining} days</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(days_used / (days_used + days_remaining)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Trial Benefits:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {benefits_unlocked.slice(0, 4).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">{benefit.replace(/_/g, ' ')}</span>
                </div>
              ))}
              {benefits_unlocked.length > 4 && (
                <div className="text-gray-400">+{benefits_unlocked.length - 4} more</div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          {isExpiring ? (
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-sm font-medium text-red-400">
                  Trial expires {days_remaining === 0 ? 'today' : `in ${days_remaining} day${days_remaining === 1 ? '' : 's'}`}!
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Upgrade now to continue enjoying premium features without interruption.
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-300">
                Loving your trial? Upgrade anytime to unlock unlimited access to all premium features.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowUpgradeModal(true)}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              isExpiring 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
            }`}
          >
            {isExpiring ? 'Upgrade Now - Don\'t Lose Access!' : 'Upgrade to Premium'}
          </button>
        </>
      )}

      {status === 'expired' && (
        <div className="text-center">
          <div className="text-red-400 mb-2">Your trial has expired</div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium text-sm"
          >
            Restore Access - Upgrade Now
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Upgrade Your Account</h3>
            
            <div className="space-y-3 mb-6">
              <div className="border border-gray-600 rounded-lg p-4 hover:border-pink-500 transition-colors cursor-pointer"
                   onClick={() => convertToMembership('monthly')}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">Monthly Plan</h4>
                    <p className="text-sm text-gray-400">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">$19.99</div>
                    <div className="text-xs text-gray-400">per month</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer"
                   onClick={() => convertToMembership('yearly')}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">Yearly Plan</h4>
                    <p className="text-sm text-gray-400">Save 20% annually</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">$199.99</div>
                    <div className="text-xs text-gray-400">per year</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="bg-green-600 text-xs px-2 py-1 rounded">Save $40</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialStatusComponent;