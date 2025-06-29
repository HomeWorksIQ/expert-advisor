import React, { useState } from 'react';
import { useUser } from './App';

const TrialWelcomeModal = ({ isOpen, onClose }) => {
  const { user } = useUser();

  if (!isOpen) return null;

  const performerBenefits = [
    "Premium Analytics & Insights",
    "Advanced Messaging Tools", 
    "Live Streaming Capabilities",
    "Video Call Features",
    "Content Monetization Tools",
    "Priority Customer Support",
    "Custom Branding Options",
    "Unlimited Content Uploads"
  ];

  const memberBenefits = [
    "Premium Content Access",
    "HD Streaming Quality",
    "Download Content for Offline",
    "Advanced Search & Filters",
    "Priority Messaging with Creators",
    "Exclusive Events & Content",
    "Ad-Free Experience",
    "Early Access to New Features"
  ];

  const benefits = user?.userType === 'performer' ? performerBenefits : memberBenefits;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative animate-pulse">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome to Your 7-Day Free Trial!
          </h2>
          <p className="text-gray-300">
            Experience all premium features absolutely free for the next 7 days.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            {user?.userType === 'performer' ? 'Performer Benefits' : 'Member Benefits'}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Trial Duration:</span>
            <span className="text-sm text-pink-400 font-bold">7 Days</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">No Credit Card:</span>
            <span className="text-sm text-green-400 font-bold">Required</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Cancel Anytime:</span>
            <span className="text-sm text-blue-400 font-bold">Yes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            Start Exploring Premium Features
          </button>
          <p className="text-xs text-gray-400 text-center">
            Your trial starts now and you'll receive a reminder before it expires.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialWelcomeModal;