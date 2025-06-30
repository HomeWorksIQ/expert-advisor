import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useSearchParams } from 'react-router-dom';

const SubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const [expertise, setExpertise] = useState('');
  const [fee, setFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const expertiseMap = {
    'medical': 'Medical & Healthcare',
    'legal': 'Legal Services', 
    'financial': 'Financial Planning',
    'business': 'Business Consulting',
    'insurance': 'Insurance Services',
    'education': 'Education & Tutoring',
    'technology': 'Technology & IT',
    'marketing': 'Marketing & Advertising',
    'real_estate': 'Real Estate',
    'accounting': 'Accounting & Tax'
  };

  useEffect(() => {
    const expertiseParam = searchParams.get('expertise');
    const feeParam = searchParams.get('fee');
    
    if (expertiseParam && feeParam) {
      setExpertise(expertiseParam);
      setFee(parseInt(feeParam));
    }
  }, [searchParams]);

  const handleSubscription = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      alert('Subscription activated successfully! You can now publish your expert profile and start accepting consultations.');
      window.location.href = '/expert/dashboard';
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Expert Subscription
          </h1>
          <p className="text-gray-600">
            Activate your expert profile and start helping clients today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Subscription Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expertise Category:</span>
                <span className="font-semibold">{expertiseMap[expertise] || 'Not Selected'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Fee:</span>
                <span className="font-semibold text-green-600">${fee}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Monthly:</span>
                  <span className="text-2xl font-bold text-green-600">${fee}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's Included:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Complete expert profile setup</li>
                <li>✓ Unlimited client consultations</li>
                <li>✓ Chat and video call features</li>
                <li>✓ Document sharing capabilities</li>
                <li>✓ Payment processing included</li>
                <li>✓ Analytics and reporting</li>
                <li>✓ 24/7 platform support</li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment</p>
                  <div className="text-blue-600 font-semibold">PayPal Payment Gateway</div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleSubscription}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Subscribe for $${fee}/month`
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By subscribing, you agree to our Terms of Service and Privacy Policy. 
                You can cancel your subscription at any time.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;