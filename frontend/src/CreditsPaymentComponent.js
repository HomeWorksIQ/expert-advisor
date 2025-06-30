import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';

const CreditsPaymentComponent = ({ cartTotal, onPaymentMethodChange }) => {
  const { user } = useUser();
  const [creditBalance, setCreditBalance] = useState(0);
  const [maxCreditsUsable, setMaxCreditsUsable] = useState(0);
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    creditsUsed: 0,
    cashPayment: cartTotal,
    totalSavings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCreditData();
    }
  }, [user, cartTotal]);

  const loadCreditData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Get credit balance
      const balanceResponse = await fetch(`${API_BASE_URL}/api/credits/${user.id}/balance`);
      const balanceData = await balanceResponse.json();
      
      if (balanceData.success) {
        setCreditBalance(balanceData.balance);
      }
      
      // Get max credits usable for current cart total
      if (cartTotal > 0) {
        const maxCreditsResponse = await fetch(`${API_BASE_URL}/api/cart/${user.id}/max-credits`);
        const maxCreditsData = await maxCreditsResponse.json();
        
        if (maxCreditsData.success) {
          setMaxCreditsUsable(maxCreditsData.max_credits_usable);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load credit data:', error);
      setLoading(false);
    }
  };

  const handleCreditsChange = (amount) => {
    const creditsUsed = Math.min(amount, maxCreditsUsable, creditBalance);
    const cashPayment = Math.max(0, cartTotal - creditsUsed);
    
    setCreditsToUse(creditsUsed);
    setPaymentBreakdown({
      creditsUsed,
      cashPayment,
      totalSavings: creditsUsed
    });

    // Notify parent component about payment method change
    if (onPaymentMethodChange) {
      onPaymentMethodChange({
        creditsUsed,
        cashPayment,
        totalAmount: cartTotal
      });
    }
  };

  const applyMaxCredits = () => {
    handleCreditsChange(maxCreditsUsable);
  };

  const clearCredits = () => {
    handleCreditsChange(0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
      
      {/* Credit Balance Display */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Available Credits</p>
            <p className="text-2xl font-bold text-green-600">${creditBalance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Max Usable (50%)</p>
            <p className="text-lg font-semibold text-blue-600">${maxCreditsUsable.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Credits Slider */}
      {maxCreditsUsable > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Use Credits</label>
            <span className="text-sm text-gray-500">${creditsToUse.toFixed(2)}</span>
          </div>
          
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max={maxCreditsUsable}
              step="0.01"
              value={creditsToUse}
              onChange={(e) => handleCreditsChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-between">
              <button
                onClick={clearCredits}
                className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={applyMaxCredits}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Use Max
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Payment Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${cartTotal.toFixed(2)}</span>
          </div>
          
          {paymentBreakdown.creditsUsed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Credits Applied:</span>
              <span className="text-green-600">-${paymentBreakdown.creditsUsed.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-900">Cash Payment:</span>
              <span className="text-gray-900">${paymentBreakdown.cashPayment.toFixed(2)}</span>
            </div>
          </div>
          
          {paymentBreakdown.totalSavings > 0 && (
            <div className="bg-green-100 rounded p-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-800">You Save:</span>
                <span className="text-green-800 font-medium">${paymentBreakdown.totalSavings.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Payment Method for Remaining Amount</h4>
        
        {paymentBreakdown.cashPayment > 0 ? (
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="radio" name="paymentMethod" value="card" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-700">Credit/Debit Card</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="paymentMethod" value="paypal" className="mr-2" />
              <span className="text-sm text-gray-700">PayPal</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="paymentMethod" value="bank" className="mr-2" />
              <span className="text-sm text-gray-700">Bank Transfer</span>
            </label>
          </div>
        ) : (
          <div className="bg-green-100 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">
              ✅ Full payment covered by credits! No additional payment required.
            </p>
          </div>
        )}
      </div>

      {/* Credits Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 About Credits</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Credits can cover up to 50% of any purchase</li>
          <li>• Earn credits by referring new members ($10 per referral)</li>
          <li>• Credits never expire and can be used anytime</li>
          <li>• Share your referral link to earn more credits!</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditsPaymentComponent;