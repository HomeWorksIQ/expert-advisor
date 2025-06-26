import React, { useState, useEffect, useRef } from 'react';
import { useUser } from './App';

// Payment Method Selection Component
export const PaymentMethodSelector = ({ onMethodSelect, selectedMethod }) => {
  const paymentMethods = [
    {
      id: 'ccbill',
      name: 'Credit/Debit Card (CCBill)',
      description: 'Secure payment with Visa, Mastercard, Amex',
      icon: '💳',
      recommended: true,
      fees: '3.9%'
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card (Stripe)',
      description: 'Alternative card processing',
      icon: '💳',
      recommended: false,
      fees: '2.9%'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, and 200+ coins',
      icon: '₿',
      recommended: false,
      fees: '0.5%'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h3>
      {paymentMethods.map(method => (
        <div
          key={method.id}
          onClick={() => onMethodSelect(method.id)}
          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === method.id
              ? 'border-pink-500 bg-pink-500 bg-opacity-10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          {method.recommended && (
            <div className="absolute -top-2 left-4 bg-pink-500 text-white text-xs px-2 py-1 rounded">
              Recommended
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{method.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{method.name}</h4>
              <p className="text-sm text-gray-400">{method.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Fee: {method.fees}</div>
              {selectedMethod === method.id && (
                <div className="text-pink-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Subscription Package Selector
export const SubscriptionPackageSelector = ({ onPackageSelect, selectedPackage, userType }) => {
  const memberPackages = [
    {
      id: 'member_monthly',
      name: 'Monthly Membership',
      price: 19.95,
      period: '1 month',
      description: 'Access to all premium content',
      features: ['Unlimited content access', 'HD video streaming', 'Direct messaging', 'Mobile app access'],
      popular: false
    },
    {
      id: 'member_quarterly',
      name: 'Quarterly Membership',
      price: 54.99,
      period: '3 months',
      originalPrice: 59.85,
      savings: 8,
      description: 'Best value for regular users',
      features: ['Everything in Monthly', '3 months at reduced rate', 'Priority support', 'Early access to new features'],
      popular: true
    },
    {
      id: 'member_annual',
      name: 'Annual Membership',
      price: 179.99,
      period: '12 months',
      originalPrice: 239.40,
      savings: 25,
      description: 'Maximum savings for power users',
      features: ['Everything in Quarterly', 'Maximum discount', 'VIP badge', 'Exclusive events access'],
      popular: false
    }
  ];

  const performerPackages = [
    {
      id: 'performer_monthly',
      name: 'Creator Monthly',
      price: 50.00,
      period: '1 month',
      description: 'Start your content creation journey',
      features: ['Upload unlimited content', 'Keep 60% of revenue', 'Analytics dashboard', 'Payment processing'],
      popular: false
    },
    {
      id: 'performer_quarterly',
      name: 'Creator Quarterly',
      price: 140.00,
      period: '3 months',
      originalPrice: 150.00,
      savings: 7,
      description: 'Popular choice for serious creators',
      features: ['Everything in Monthly', 'Advanced analytics', 'Priority listing', 'Custom branding'],
      popular: true
    },
    {
      id: 'performer_annual',
      name: 'Creator Annual',
      price: 500.00,
      period: '12 months',
      originalPrice: 600.00,
      savings: 17,
      description: 'Best value for professional creators',
      features: ['Everything in Quarterly', 'Maximum savings', 'Dedicated support', 'Marketing tools'],
      popular: false
    }
  ];

  const packages = userType === 'member' ? memberPackages : performerPackages;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Choose Your {userType === 'member' ? 'Membership' : 'Creator'} Plan
      </h3>
      
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            onClick={() => onPackageSelect(pkg)}
            className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedPackage?.id === pkg.id
                ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}
            
            {pkg.savings && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {pkg.savings}%
              </div>
            )}
            
            <div className="text-center mb-4">
              <h4 className="font-semibold text-white text-lg">{pkg.name}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-pink-400">${pkg.price}</span>
                <span className="text-gray-400">/{pkg.period}</span>
              </div>
              {pkg.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  ${pkg.originalPrice}
                </div>
              )}
            </div>
            
            <p className="text-gray-400 text-sm text-center mb-4">{pkg.description}</p>
            
            <ul className="space-y-2">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            {selectedPackage?.id === pkg.id && (
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// CCBill Payment Component
export const CCBillPayment = ({ package: selectedPackage, onSuccess, onError }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPackage) return;

    // Load CCBill widget script if not already loaded
    if (!window.ccbill) {
      const script = document.createElement('script');
      script.src = 'https://js.ccbill.com/v1.9.0/ccbill-advanced-widget.js';
      script.onload = initializeWidget;
      script.onerror = () => setError('Failed to load CCBill payment system');
      document.head.appendChild(script);
    } else {
      initializeWidget();
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.unmount();
        } catch (e) {
          console.warn('Error unmounting CCBill widget:', e);
        }
      }
    };
  }, [selectedPackage]);

  const initializeWidget = () => {
    try {
      const widget = new window.ccbill.PaymentWidget();
      widgetRef.current = widget;
      
      const isSubscription = selectedPackage.period !== 'one-time';
      
      const config = {
        apiKey: process.env.REACT_APP_CCBILL_API_KEY,
        initialPrice: selectedPackage.price.toFixed(2),
        initialPeriod: isSubscription ? getPeriodInDays(selectedPackage.period) : 1,
        currency: "USD",
        recurringPrice: isSubscription ? selectedPackage.price.toFixed(2) : undefined,
        recurringPeriod: isSubscription ? getPeriodInDays(selectedPackage.period) : undefined,
        rebills: isSubscription ? 99 : undefined,
        formName: `eyecandy_${selectedPackage.id}`,
        style: {
          theme: 'dark',
          primaryColor: '#EC4899'
        }
      };
      
      // Clear container and mount widget
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        widget.mount(containerRef.current, config);
      }
      
      // Handle events
      const handleTokenCreated = (event) => {
        const token = event.detail.token;
        processPayment(token);
      };
      
      const handlePaymentError = (event) => {
        setError(event.detail.message || 'Payment failed. Please try again.');
        onError(event.detail);
      };
      
      document.addEventListener('tokenCreated', handleTokenCreated);
      document.addEventListener('paymentError', handlePaymentError);
      
      setIsLoading(false);
      
      // Cleanup function
      return () => {
        document.removeEventListener('tokenCreated', handleTokenCreated);
        document.removeEventListener('paymentError', handlePaymentError);
      };
    } catch (err) {
      setError('Failed to initialize payment system');
      setIsLoading(false);
    }
  };

  const getPeriodInDays = (period) => {
    switch (period) {
      case '1 month': return 30;
      case '3 months': return 90;
      case '12 months': return 365;
      default: return 30;
    }
  };

  const processPayment = async (token) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/payments/ccbill/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentToken: token,
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          isSubscription: selectedPackage.period !== 'one-time'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.message || 'Payment processing failed');
        onError(result);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Secure Card Payment</h3>
      
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Loading secure payment form...</span>
        </div>
      )}
      
      <div ref={containerRef} className={isLoading ? 'hidden' : ''}></div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>💳 Visa, Mastercard, American Express, and Discover accepted</p>
        <p>🏦 Processed by CCBill - trusted by millions worldwide</p>
      </div>
    </div>
  );
};

// Stripe Payment Component
export const StripePayment = ({ package: selectedPackage, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const processStripePayment = async () => {
    try {
      setIsLoading(true);
      setError('');

      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/payment-cancelled`;

      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          successUrl,
          cancelUrl,
          metadata: {
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            userId: localStorage.getItem('userId')
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        setError(result.message || 'Failed to create payment session');
        onError(result);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stripe Checkout</h3>
      
      {error && (
        <div className="mb-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white">{selectedPackage.name}</h4>
          <p className="text-gray-400 text-sm">{selectedPackage.description}</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-pink-400">${selectedPackage.price}</span>
            <span className="text-gray-400">/{selectedPackage.period}</span>
          </div>
        </div>
        
        <button
          onClick={processStripePayment}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </span>
          ) : (
            'Continue with Stripe'
          )}
        </button>
        
        <div className="text-xs text-gray-400 text-center">
          <p>🔒 Secure payment powered by Stripe</p>
          <p>💳 All major credit and debit cards accepted</p>
        </div>
      </div>
    </div>
  );
};

// Cryptocurrency Payment Component
export const CryptoPayment = ({ package: selectedPackage, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, checking, completed, failed

  const supportedCryptos = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '$' },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
    { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', icon: '₿' }
  ];

  const createCryptoPayment = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/payments/crypto/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          currency: selectedCrypto.toUpperCase(),
          isSubscription: selectedPackage.period !== 'one-time'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result.payment);
        setPaymentStatus('pending');
        startPaymentMonitoring(result.payment.id);
      } else {
        setError(result.message || 'Failed to create crypto payment');
        onError(result);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentMonitoring = (paymentId) => {
    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payments/crypto/status/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        const result = await response.json();
        
        if (result.status === 'completed') {
          setPaymentStatus('completed');
          onSuccess(result);
        } else if (result.status === 'failed' || result.status === 'expired') {
          setPaymentStatus('failed');
          setError('Payment failed or expired. Please try again.');
          onError(result);
        } else {
          // Continue monitoring
          setTimeout(checkPayment, 10000); // Check every 10 seconds
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setTimeout(checkPayment, 10000); // Retry after error
      }
    };

    // Start checking after 30 seconds
    setTimeout(checkPayment, 30000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show success message
  };

  const openInWallet = () => {
    const crypto = supportedCryptos.find(c => c.id === selectedCrypto);
    const walletUrl = `${crypto.symbol.toLowerCase()}:${paymentData.address}?amount=${paymentData.cryptoAmount}`;
    window.open(walletUrl, '_blank');
  };

  if (paymentStatus === 'completed') {
    return (
      <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-400 mb-2">Payment Completed!</h3>
        <p className="text-gray-300">Your crypto payment has been confirmed on the blockchain.</p>
      </div>
    );
  }

  if (paymentData && paymentStatus === 'pending') {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Complete Crypto Payment</h3>
        
        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-400 text-sm">Send exactly the amount shown below to complete your payment</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Amount to Send:</span>
              <span className="text-xl font-bold text-white">
                {paymentData.cryptoAmount} {paymentData.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">USD Value:</span>
              <span className="text-gray-300">${selectedPackage.price}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Send to Address:</span>
              <button
                onClick={() => copyToClipboard(paymentData.address)}
                className="text-pink-400 hover:text-pink-300 text-sm"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-800 rounded p-2 break-all text-sm text-white font-mono">
              {paymentData.address}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={openInWallet}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              Open in Wallet
            </button>
            <button
              onClick={() => copyToClipboard(paymentData.address)}
              className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Copy Address
            </button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Waiting for payment confirmation...
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>⏱️ Payment expires in 30 minutes</p>
            <p>🔗 Confirmation typically takes 1-3 network confirmations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Pay with Cryptocurrency</h3>
      
      {error && (
        <div className="mb-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {supportedCryptos.map(crypto => (
              <button
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCrypto === crypto.id
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                    : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{crypto.icon}</span>
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{crypto.symbol}</div>
                    <div className="text-gray-400 text-xs">{crypto.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white">{selectedPackage.name}</h4>
          <p className="text-gray-400 text-sm">{selectedPackage.description}</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-pink-400">${selectedPackage.price}</span>
            <span className="text-gray-400">/{selectedPackage.period}</span>
          </div>
        </div>
        
        <button
          onClick={createCryptoPayment}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Payment...
            </span>
          ) : (
            'Generate Payment Address'
          )}
        </button>
        
        <div className="text-xs text-gray-400 text-center">
          <p>🔒 Secure crypto payments via NOWPayments</p>
          <p>⚡ Instant confirmation with supported cryptocurrencies</p>
          <p>🌐 Decentralized and anonymous transactions</p>
        </div>
      </div>
    </div>
  );
};

// Main Payment Page Component
export const PaymentPage = () => {
  const { user, userType } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ccbill');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, name: 'Choose Package', icon: '📦' },
    { id: 2, name: 'Payment Method', icon: '💳' },
    { id: 3, name: 'Complete Payment', icon: '✅' }
  ];

  const handlePaymentSuccess = (result) => {
    setIsProcessing(false);
    // Redirect to success page or update user state
    window.location.href = '/payment-success';
  };

  const handlePaymentError = (error) => {
    setIsProcessing(false);
    console.error('Payment error:', error);
  };

  const renderPaymentComponent = () => {
    if (!selectedPackage) return null;

    switch (selectedPaymentMethod) {
      case 'ccbill':
        return (
          <CCBillPayment
            package={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      case 'stripe':
        return (
          <StripePayment
            package={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      case 'crypto':
        return (
          <CryptoPayment
            package={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-gray-400">Secure payment processing for Eye Candy</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'border-gray-600 text-gray-400'
              }`}>
                <span className="text-lg">{step.icon}</span>
              </div>
              <div className="ml-2 mr-4">
                <div className={`text-sm ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                  {step.name}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mr-4 ${
                  currentStep > step.id ? 'bg-pink-500' : 'bg-gray-600'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <div>
              <SubscriptionPackageSelector
                onPackageSelect={(pkg) => {
                  setSelectedPackage(pkg);
                  setCurrentStep(2);
                }}
                selectedPackage={selectedPackage}
                userType={userType}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <PaymentMethodSelector
                onMethodSelect={setSelectedPaymentMethod}
                selectedMethod={selectedPaymentMethod}
              />
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {renderPaymentComponent()}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};