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
    userType: 'member'
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
        window.location.href = formData.userType === 'expert' ? '/expert/dashboard' : '/member/dashboard';
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
        'Free profile creation',
        'Advanced messaging tools',
        'Video consultation tools',
        'Service monetization',
        'Priority support',
        'Pay only when published ($50/month)'
      ];
    } else {
      return [
        'Free access to all experts',
        'HD video consultations',
        'Document sharing',
        'Advanced search',
        'Priority messaging',
        'No fees ever'
      ];
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/${provider}`
      );
      if (response.data.auth_url) {
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      alert(`Failed to initialize ${provider} login. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Trial Offer */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          
          {/* Free Account Highlight */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>✨</span>
              <span>{formData.userType === 'expert' ? 'EXPERT SIGNUP' : 'FREE MEMBERSHIP'}</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              {formData.userType === 'expert' ? (
                <>
                  Join as an
                  <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Expert
                  </span>
                </>
              ) : (
                <>
                  Join as a
                  <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Member
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              {formData.userType === 'expert' 
                ? 'Create your profile for free, pay only when you publish and start getting clients.'
                : 'Access all expert services completely free. No hidden fees, no subscriptions.'
              }
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {formData.userType === 'expert' ? 'Expert Account Includes:' : 'Member Account Includes:'}
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
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formData.userType === 'expert' ? 'Free Signup' : 'Always Free'}
            </div>
            <div className="text-lg text-gray-300">
              {formData.userType === 'expert' 
                ? 'Pay $50/month only when you publish your profile'
                : 'Complete access to all expert services'
              }
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
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Join The Experts</h2>
            <p className="text-gray-400">
              Create your account and start connecting with {formData.userType === 'expert' ? 'members' : 'experts'} today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'member'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'member'
                      ? 'border-green-500 bg-green-900/30 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">Member</div>
                  <div className="text-xs opacity-75 text-green-400">
                    Always Free
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
                  <div className="text-xs opacity-75 text-blue-400">
                    $50 Monthly
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media Login */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('linkedin')}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg bg-[#0077B5] hover:bg-[#006497] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
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