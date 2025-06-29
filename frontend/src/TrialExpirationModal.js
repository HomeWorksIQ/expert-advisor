import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './App';

const TrialExpirationModal = ({ isOpen, onClose, trialData }) => {
  const { user, API } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  if (!isOpen || !trialData) return null;

  const isExpired = trialData.status === 'expired';
  const isExpiring = trialData.days_remaining <= 1 && trialData.status === 'active';

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: user?.userType === 'performer' ? 29.99 : 19.99,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        'All premium features',
        'Priority support',
        'Advanced analytics',
        'Unlimited content'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: user?.userType === 'performer' ? 299.99 : 199.99,
      interval: 'year',
      description: 'Best value - Save 17%',
      popular: true,
      savings: user?.userType === 'performer' ? 59.89 : 39.89,
      features: [
        'All monthly features',
        'Priority support',
        'Advanced analytics',
        'Unlimited content',
        'Exclusive features',
        'Early access to new tools'
      ]
    }
  ];

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      // Convert trial to paid subscription
      const response = await axios.post(`${API}/trials/${user.id}/convert`, {
        subscription_type: selectedPlan
      });
      
      if (response.data.success) {
        // Redirect to payment processing
        window.location.href = `/payment?plan=${selectedPlan}&trial_conversion=true`;
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      alert('Failed to process upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extendTrial = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/trials/${user.id}/extend`, {
        additional_days: 3
      });
      
      if (response.data.success) {
        alert('Trial extended by 3 days!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to extend trial:', error);
      alert('Unable to extend trial at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        
        {/* Header */}
        <div className={`p-6 text-center border-b border-gray-700 ${
          isExpired ? 'bg-red-900/20' : 'bg-yellow-900/20'
        }`}>
          <div className="text-4xl mb-3">
            {isExpired ? '⏰' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isExpired ? 'Your Free Trial Has Ended' : 'Trial Expiring Soon!'}
          </h2>
          <p className="text-gray-300">
            {isExpired 
              ? 'Upgrade now to restore access to all premium features'
              : `Your trial ends ${trialData.days_remaining === 0 ? 'today' : `in ${trialData.days_remaining} day${trialData.days_remaining === 1 ? '' : 's'}`}. Don't lose access!`
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* What You'll Lose */}
          {isExpired && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Features You've Lost Access To:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {trialData.benefits_unlocked.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-red-300">
                    <span>❌</span>
                    <span>{benefit.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plans */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-semibold text-white text-center mb-4">
              Choose Your Plan to Continue
            </h3>
            
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-pink-500 bg-pink-900/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${plan.price}</div>
                    <div className="text-sm text-gray-400">per {plan.interval}</div>
                    {plan.savings && (
                      <div className="text-xs text-green-400 font-medium">
                        Save ${plan.savings}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trial Usage Summary */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Your Trial Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Trial Duration:</span>
                <span className="text-white ml-2">{trialData.trial_duration_days} days</span>
              </div>
              <div>
                <span className="text-gray-400">Days Used:</span>
                <span className="text-white ml-2">{trialData.days_used}</span>
              </div>
              <div>
                <span className="text-gray-400">Features Accessed:</span>
                <span className="text-white ml-2">{trialData.benefits_unlocked.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Started:</span>
                <span className="text-white ml-2">
                  {new Date(trialData.trial_start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {isExpired ? 'Restore Access' : 'Upgrade Now'} - ${plans.find(p => p.id === selectedPlan)?.price}/{plans.find(p => p.id === selectedPlan)?.interval}
                </>
              )}
            </button>

            {!isExpired && (
              <button
                onClick={extendTrial}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
              >
                Give Me 3 More Days (One-time Extension)
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full border border-gray-600 hover:bg-gray-700 text-gray-300 py-3 px-6 rounded-lg font-medium transition-all"
            >
              {isExpired ? 'Continue with Basic Features' : 'Remind Me Later'}
            </button>
          </div>

          {/* Guarantee */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-gray-400 text-xs">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>↩️</span>
                <span>30-Day Money Back</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🚫</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialExpirationModal;