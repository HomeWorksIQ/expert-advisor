import React, { useState, useEffect } from 'react';
import { useUser } from './App';

// Digital Wallet Component
export const WalletPage = () => {
  const { user, API } = useUser();
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalSpent: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Mock wallet data
  const mockWalletData = {
    balance: 247.85,
    pendingBalance: 45.20,
    totalEarnings: 1247.50,
    totalSpent: 189.65,
    currency: 'USD'
  };

  const mockTransactions = [
    {
      id: 1,
      type: 'earned',
      amount: 19.99,
      description: 'Subscription payment from @john_doe',
      date: '2024-01-20T14:30:00Z',
      status: 'completed',
      method: 'ccbill'
    },
    {
      id: 2,
      type: 'spent',
      amount: -24.99,
      description: 'Subscription to @sophia_dreams',
      date: '2024-01-19T09:15:00Z',
      status: 'completed',
      method: 'stripe'
    },
    {
      id: 3,
      type: 'earned',
      amount: 5.00,
      description: 'Tip from @user123',
      date: '2024-01-18T16:45:00Z',
      status: 'completed',
      method: 'crypto'
    },
    {
      id: 4,
      type: 'withdrawn',
      amount: -100.00,
      description: 'Withdrawal to bank account',
      date: '2024-01-17T11:20:00Z',
      status: 'pending',
      method: 'bank_transfer'
    },
    {
      id: 5,
      type: 'added',
      amount: 50.00,
      description: 'Funds added via credit card',
      date: '2024-01-16T13:10:00Z',
      status: 'completed',
      method: 'ccbill'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWalletData(mockWalletData);
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTransactionIcon = (type, method) => {
    switch (type) {
      case 'earned': return '💰';
      case 'spent': return '💸';
      case 'withdrawn': return '🏦';
      case 'added': return '💳';
      default: return '💱';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned': return 'text-green-400';
      case 'spent': return 'text-red-400';
      case 'withdrawn': return 'text-blue-400';
      case 'added': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatAmount = (amount) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return `${isNegative ? '-' : '+'}$${absAmount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Digital Wallet</h1>
          <p className="text-gray-400">Manage your funds, earnings, and transactions</p>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">${walletData.balance.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-green-100">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">${walletData.pendingBalance.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-yellow-100">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${walletData.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-purple-100">📈</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">${walletData.totalSpent.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-blue-100">💸</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowAddFunds(true)}
            className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💳</div>
              <div className="text-left">
                <div className="font-semibold">Add Funds</div>
                <div className="text-sm opacity-90">Credit card, crypto, bank</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setShowWithdraw(true)}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏦</div>
              <div className="text-left">
                <div className="font-semibold">Withdraw</div>
                <div className="text-sm opacity-90">To bank or crypto wallet</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div className="text-left">
                <div className="font-semibold">View History</div>
                <div className="text-sm opacity-90">All transactions</div>
              </div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '📋' },
            { id: 'earnings', label: 'Earnings', icon: '💰' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Wallet Overview</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{getTransactionIcon(transaction.type, transaction.method)}</div>
                          <div>
                            <div className="text-sm font-medium text-white">{transaction.description}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                          {formatAmount(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Payment Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">💳</div>
                        <div>
                          <div className="text-sm font-medium">Credit Cards</div>
                          <div className="text-xs text-gray-400">CCBill, Stripe</div>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm">Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">₿</div>
                        <div>
                          <div className="text-sm font-medium">Cryptocurrency</div>
                          <div className="text-xs text-gray-400">Bitcoin, Ethereum, USDT</div>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm">Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">🏦</div>
                        <div>
                          <div className="text-sm font-medium">Bank Transfer</div>
                          <div className="text-xs text-gray-400">ACH, Wire transfer</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm">Setup Required</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                <option>All Types</option>
                <option>Earned</option>
                <option>Spent</option>
                <option>Withdrawn</option>
                <option>Added</option>
              </select>
              
              <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                <option>All Methods</option>
                <option>CCBill</option>
                <option>Stripe</option>
                <option>Crypto</option>
                <option>Bank Transfer</option>
              </select>
              
              <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>All time</option>
              </select>
            </div>
            
            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTransactionIcon(transaction.type, transaction.method)}</div>
                    <div>
                      <div className="font-medium text-white">{transaction.description}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.method.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {formatAmount(transaction.amount)}
                    </div>
                    <div className={`text-sm ${
                      transaction.status === 'completed' ? 'text-green-400' :
                      transaction.status === 'pending' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Earnings Breakdown</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">$847.20</div>
                  <div className="text-gray-400">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">$2,450.80</div>
                  <div className="text-gray-400">Last 3 Months</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">$12,847.00</div>
                  <div className="text-gray-400">All Time</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subscriptions</span>
                  <span className="text-white font-semibold">$567.30 (67%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tips</span>
                  <span className="text-white font-semibold">$189.50 (22%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Content Sales</span>
                  <span className="text-white font-semibold">$90.40 (11%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Wallet Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Payment Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Auto-convert crypto to USD</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Email notifications for transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Weekly earnings summary</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Security</h4>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-center">
                        <span>Two-Factor Authentication</span>
                        <span className="text-green-400">Enabled</span>
                      </div>
                    </button>
                    <button className="w-full p-3 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-center">
                        <span>Transaction PIN</span>
                        <span className="text-yellow-400">Setup Required</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <AddFundsModal onClose={() => setShowAddFunds(false)} />
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <WithdrawModal onClose={() => setShowWithdraw(false)} />
      )}
    </div>
  );
};

// Add Funds Modal
const AddFundsModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('ccbill');

  const fundingMethods = [
    { id: 'ccbill', name: 'Credit/Debit Card (CCBill)', fee: '3.9%', icon: '💳' },
    { id: 'stripe', name: 'Credit/Debit Card (Stripe)', fee: '2.9%', icon: '💳' },
    { id: 'crypto', name: 'Cryptocurrency', fee: '0.5%', icon: '₿' },
    { id: 'bank', name: 'Bank Transfer', fee: 'Free', icon: '🏦' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process add funds
    console.log('Adding funds:', { amount, method });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Add Funds</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              min="10"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="Enter amount"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum: $10.00</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {fundingMethods.map(fundingMethod => (
                <label
                  key={fundingMethod.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    method === fundingMethod.id
                      ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={fundingMethod.id}
                    checked={method === fundingMethod.id}
                    onChange={(e) => setMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{fundingMethod.icon}</span>
                      <span className="text-white">{fundingMethod.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">{fundingMethod.fee}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Withdraw Modal
const WithdrawModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');

  const withdrawMethods = [
    { id: 'bank', name: 'Bank Transfer', fee: 'Free', time: '1-3 business days', icon: '🏦' },
    { id: 'crypto', name: 'Cryptocurrency', fee: 'Network fee', time: '15-30 minutes', icon: '₿' },
    { id: 'paypal', name: 'PayPal', fee: '2.9%', time: 'Instant', icon: '💰' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process withdrawal
    console.log('Processing withdrawal:', { amount, method });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Withdraw Funds</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg">
          <p className="text-blue-400 text-sm">Available balance: $247.85</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              min="20"
              max="247.85"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="Enter amount"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum: $20.00</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdrawal Method
            </label>
            <div className="space-y-2">
              {withdrawMethods.map(withdrawMethod => (
                <label
                  key={withdrawMethod.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    method === withdrawMethod.id
                      ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={withdrawMethod.id}
                    checked={method === withdrawMethod.id}
                    onChange={(e) => setMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{withdrawMethod.icon}</span>
                      <div>
                        <div className="text-white">{withdrawMethod.name}</div>
                        <div className="text-xs text-gray-400">{withdrawMethod.time}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{withdrawMethod.fee}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Withdraw
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};