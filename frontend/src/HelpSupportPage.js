import React from 'react';
import { Header } from './components';

const HelpSupportPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-gray-400">Get assistance with your The Experts account</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-medium text-pink-400 mb-2">How do I subscribe to a creator?</h3>
              <p className="text-gray-300">
                To subscribe to a creator, visit their profile page and click the "Subscribe" button. 
                You'll be prompted to select a subscription plan and complete the payment process.
              </p>
            </div>
            
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-medium text-pink-400 mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-300">
                The Experts accepts credit/debit cards through CCBill and Stripe, as well as various cryptocurrencies.
                All payment information is securely processed and we never store your full card details.
              </p>
            </div>
            
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-medium text-pink-400 mb-2">How do I become a creator?</h3>
              <p className="text-gray-300">
                To become a creator, sign up for an account and select "Performer" as your account type.
                You'll need to complete the verification process, set up your profile, and add your banking information to receive payments.
              </p>
            </div>
            
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-medium text-pink-400 mb-2">How do payouts work for creators?</h3>
              <p className="text-gray-300">
                Creators receive 60% of all revenue generated from subscriptions and tips.
                Payouts are processed twice a month, and you can track your earnings in the Wallet section of your dashboard.
              </p>
            </div>
            
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-medium text-pink-400 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time from your account settings.
                You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="text-gray-400 mb-4">
              Need more help? Our support team is available 24/7 to assist you.
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Type
                </label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500">
                  <option>Account Issues</option>
                  <option>Payment Problems</option>
                  <option>Creator Support</option>
                  <option>Technical Issues</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 h-32"
                  placeholder="Describe your issue in detail"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Submit Request
              </button>
            </form>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            
            <div className="space-y-3">
              <a href="#" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">📚</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Knowledge Base</h3>
                    <p className="text-sm text-gray-400">Browse our detailed guides and tutorials</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🔒</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Privacy & Security</h3>
                    <p className="text-sm text-gray-400">Learn about our privacy practices</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Terms of Service</h3>
                    <p className="text-sm text-gray-400">Review our terms and conditions</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Billing & Payments</h3>
                    <p className="text-sm text-gray-400">Get help with payment issues</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🎥</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Creator Resources</h3>
                    <p className="text-sm text-gray-400">Tools and tips for content creators</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;