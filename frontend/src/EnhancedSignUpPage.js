import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const EnhancedSignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client'
  });
  const [trialSettings, setTrialSettings] = useState({
    trial_enabled: true,
    expert_trial_days: 7,
    client_trial_days: 7
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUser();

  useEffect(() => {
    fetchTrialSettings();
  }, []);

  const fetchTrialSettings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/trial-settings/public`);
      if (response.data.success) {
        setTrialSettings({
          trial_enabled: response.data.trial_enabled,
          performer_trial_days: response.data.performer_trial_days,
          member_trial_days: response.data.member_trial_days
        });
      }
    } catch (error) {
      console.error('Failed to fetch trial settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/signup`,
        formData
      );

      if (response.data.access_token) {
        await login(response.data);
        window.location.href = formData.userType === 'performer' ? '/performer/dashboard' : '/member/dashboard';
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTrialDays = () => {
    return formData.userType === 'expert' 
      ? trialSettings.expert_trial_days 
      : trialSettings.client_trial_days;
  };

  const getTrialBenefits = () => {
    if (formData.userType === 'expert') {
      return [
        'Premium Analytics & Insights',
        'Advanced Messaging Tools',
        'Video Consultation Tools',
        'Service Monetization',
        'Priority Support',
        'Custom Branding'
      ];
    } else {
      return [
        'Premium Expert Access',
        'HD Video Consultations',
        'Document Sharing',
        'Advanced Search',
        'Priority Messaging',
        'Ad-Free Experience'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Trial Offer */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          
          {/* Free Trial Highlight */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>🎉</span>
              <span>LIMITED TIME OFFER</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Start Your
              <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {getTrialDays()}-Day FREE Trial
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Experience all premium features with no credit card required. 
              Cancel anytime during your trial period.
            </p>
          </div>

          {/* Trial Benefits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {formData.userType === 'performer' ? 'Performer' : 'Member'} Trial Includes:
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {getTrialBenefits().map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              ${formData.userType === 'performer' ? '199' : '99'} Value
            </div>
            <div className="text-lg text-gray-300">
              <span className="line-through">Regular Price</span>
              <span className="ml-2 text-green-400 font-bold">FREE for {getTrialDays()} days!</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-pink-500 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Trial Banner */}
          <div className="lg:hidden mb-8 text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg mb-4">
              <div className="text-lg font-bold">
                {getTrialDays()}-Day FREE Trial
              </div>
              <div className="text-sm opacity-90">
                No credit card required
                <span className="block text-xs mt-1">
                  Regular price: ${formData.userType === 'performer' ? '29.99' : '19.99'}/month
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Join The Experts</h2>
            <p className="text-gray-400">
              Create your account and start your free trial instantly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'client'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'client'
                      ? 'border-blue-500 bg-blue-900/30 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">Client</div>
                  <div className="text-xs opacity-75">
                    {trialSettings.client_trial_days} days FREE
                    <span className="text-gray-400"> (reg. $19.99/mo)</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'expert'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'expert'
                      ? 'border-blue-500 bg-blue-900/30 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-medium">Expert</div>
                  <div className="text-xs opacity-75">
                    {trialSettings.expert_trial_days} days FREE
                    <span className="text-gray-400"> (reg. $29.99/mo)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Trial Info */}
            {trialSettings.trial_enabled && (
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-400">✨</span>
                  <span className="text-sm font-medium text-white">Free Trial Activated</span>
                </div>
                <p className="text-xs text-gray-300">
                  Your {getTrialDays()}-day free trial will start immediately after signup. 
                  No payment required. Cancel anytime.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>Start My {getTrialDays()}-Day FREE Trial</>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-gray-500 text-xs">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Secure & Safe</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>✅</span>
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSignUpPage;