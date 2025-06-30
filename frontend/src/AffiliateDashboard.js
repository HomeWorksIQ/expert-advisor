import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';

const AffiliateDashboard = () => {
  const { user } = useUser();
  const [affiliateAccount, setAffiliateAccount] = useState(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.userType === 'member') {
      loadAffiliateData();
      loadCreditData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Try to get existing affiliate account
      let response = await fetch(`${API_BASE_URL}/api/affiliate/${user.id}`);
      let data = await response.json();
      
      if (!data.success) {
        // Create affiliate account if doesn't exist
        response = await fetch(`${API_BASE_URL}/api/affiliate/create?member_id=${user.id}`, {
          method: 'POST'
        });
        data = await response.json();
        
        if (data.success) {
          setAffiliateAccount(data.affiliate_account);
        }
      } else {
        setAffiliateAccount(data.affiliate_account);
      }
      
      // Get affiliate stats
      response = await fetch(`${API_BASE_URL}/api/affiliate/${user.id}/stats`);
      data = await response.json();
      
      if (data.success) {
        setAffiliateAccount(prev => ({ ...prev, ...data.stats }));
      }
    } catch (error) {
      console.error('Failed to load affiliate data:', error);
      setError('Failed to load affiliate data');
    }
  };

  const loadCreditData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Create credit account if doesn't exist
      await fetch(`${API_BASE_URL}/api/credits/create-account?user_id=${user.id}`, {
        method: 'POST'
      });
      
      // Get credit balance
      let response = await fetch(`${API_BASE_URL}/api/credits/${user.id}/balance`);
      let data = await response.json();
      
      if (data.success) {
        setCreditBalance(data.balance);
      }
      
      // Get credit history
      response = await fetch(`${API_BASE_URL}/api/credits/${user.id}/history?limit=20`);
      data = await response.json();
      
      if (data.success) {
        setCreditHistory(data.transactions);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load credit data:', error);
      setError('Failed to load credit data');
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (affiliateAccount?.referral_link) {
      navigator.clipboard.writeText(affiliateAccount.referral_link);
      alert('Referral link copied to clipboard!');
    }
  };

  const shareReferralLink = () => {
    if (navigator.share && affiliateAccount?.referral_link) {
      navigator.share({
        title: 'Join The Experts Platform',
        text: 'Join this amazing platform to connect with professional experts!',
        url: affiliateAccount.referral_link,
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-600">Earn credits by referring new members to The Experts platform</p>
        </div>

        {/* Credit Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Credits</p>
                <p className="text-3xl font-bold">${creditBalance.toFixed(2)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{affiliateAccount?.total_referrals || 0}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">${(affiliateAccount?.total_credits_earned || 0).toFixed(2)}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={affiliateAccount?.referral_link || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={shareReferralLink}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Share
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this link with friends and earn $10 in credits for each new member who signs up!
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How the Affiliate Program Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600 text-sm">Share your unique referral link with friends, family, or on social media</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-gray-600 text-sm">When someone uses your link to create a new account, we track the referral</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn Credits</h3>
              <p className="text-gray-600 text-sm">You receive $10 in credits that can be used to pay for expert services</p>
            </div>
          </div>
        </div>

        {/* Credit History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit History</h2>
          {creditHistory.length > 0 ? (
            <div className="space-y-4">
              {creditHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No credit transactions yet</p>
              <p className="text-gray-400 text-sm">Start referring friends to earn credits!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;