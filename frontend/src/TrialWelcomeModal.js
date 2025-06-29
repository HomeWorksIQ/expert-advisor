import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';

const TrialWelcomeModal = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Eye Candy! 🎉",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-2xl font-bold mb-4">Welcome, {user?.firstName}!</h3>
          <p className="text-gray-400 mb-6">
            Thank you for joining Eye Candy. You're now on a 7-day free trial of our premium features.
          </p>
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-lg mb-4">
            <p className="text-white font-semibold">🎁 Free Trial Benefits</p>
            <ul className="text-white text-sm mt-2 space-y-1">
              <li>• Access to all premium content</li>
              <li>• Unlimited messaging with creators</li>
              <li>• HD video streaming</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Explore Amazing Features",
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-4">Discover What You Can Do</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="text-pink-400 text-xl">🔍</div>
              <div>
                <h4 className="font-semibold">Discover Creators</h4>
                <p className="text-gray-400 text-sm">Browse and find amazing content creators</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="text-pink-400 text-xl">💬</div>
              <div>
                <h4 className="font-semibold">Direct Messaging</h4>
                <p className="text-gray-400 text-sm">Chat directly with your favorite creators</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="text-pink-400 text-xl">📱</div>
              <div>
                <h4 className="font-semibold">Live Streams</h4>
                <p className="text-gray-400 text-sm">Watch exclusive live content and interact in real-time</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="text-pink-400 text-xl">🎁</div>
              <div>
                <h4 className="font-semibold">Tips & Gifts</h4>
                <p className="text-gray-400 text-sm">Support creators with tips and virtual gifts</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Trial Information",
      content: (
        <div className="text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h3 className="text-xl font-bold mb-4">7-Day Free Trial</h3>
          
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Trial Starts:</span>
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Trial Ends:</span>
              <span className="text-white">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly Price After Trial:</span>
              <span className="text-pink-400 font-bold">$19.99/month</span>
            </div>
          </div>
          
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mb-4">
            <p className="text-blue-400 text-sm">
              💡 You can cancel anytime before your trial ends to avoid being charged.
            </p>
          </div>
          
          <p className="text-gray-400 text-sm">
            We'll send you a reminder 2 days before your trial expires.
          </p>
        </div>
      )
    },
    {
      title: "Ready to Get Started?",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-4">You're All Set!</h3>
          <p className="text-gray-400 mb-6">
            Your trial has started. Explore the platform and discover amazing content!
          </p>
          
          <div className="space-y-3">
            <a 
              href="/discover"
              className="block w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              🔍 Start Exploring Creators
            </a>
            
            <a 
              href={user?.userType === 'member' ? '/member-dashboard' : '/performer-dashboard'}
              className="block w-full py-3 border border-pink-500 text-pink-400 rounded-lg font-semibold hover:bg-pink-500 hover:text-white transition-all"
            >
              📊 Go to Dashboard
            </a>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeModal = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-700 h-1">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{steps[currentStep].title}</h2>
            <button 
              onClick={closeModal}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {steps[currentStep].content}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-pink-500' 
                      : index < currentStep 
                        ? 'bg-pink-300' 
                        : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              >
                Get Started! 🎉
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialWelcomeModal;