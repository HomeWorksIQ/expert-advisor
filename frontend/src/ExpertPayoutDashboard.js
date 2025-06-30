import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';

const ExpertPayoutDashboard = () => {
  const { user } = useUser();
  const [payoutAccounts, setPayoutAccounts] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(1250.00); // Mock balance for demo
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showRequestPayout, setShowRequestPayout] = useState(false);

  // Form states
  const [newAccountForm, setNewAccountForm] = useState({
    accountHolderName: '',
    payoutMethod: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paypalEmail: '',
    country: 'US',
    state: '',
    city: '',
    address: '',
    zipCode: ''
  });

  const [payoutRequestForm, setPayoutRequestForm] = useState({
    amount: '',
    payoutAccountId: '',
    description: ''
  });

  useEffect(() => {
    if (user && user.userType === 'expert') {
      loadPayoutData();
    }
  }, [user]);

  const loadPayoutData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Load payout accounts
      const accountsResponse = await fetch(`${API_BASE_URL}/api/payouts/${user.id}/accounts`);
      const accountsData = await accountsResponse.json();
      
      if (accountsData.success) {
        setPayoutAccounts(accountsData.accounts);
      }
      
      // Load payout requests
      const requestsResponse = await fetch(`${API_BASE_URL}/api/payouts/${user.id}/requests`);
      const requestsData = await requestsResponse.json();
      
      if (requestsData.success) {
        setPayoutRequests(requestsData.requests);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load payout data:', error);
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const response = await fetch(`${API_BASE_URL}/api/payouts/accounts?expert_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_data: newAccountForm }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPayoutAccounts([...payoutAccounts, data.payout_account]);
        setShowAddAccount(false);
        setNewAccountForm({
          accountHolderName: '',
          payoutMethod: 'bank_transfer',
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          paypalEmail: '',
          country: 'US',
          state: '',
          city: '',
          address: '',
          zipCode: ''
        });
        alert('Payout account added successfully!');
      } else {
        alert('Failed to add payout account');
      }
    } catch (error) {
      console.error('Failed to add payout account:', error);
      alert('Failed to add payout account');
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const response = await fetch(`${API_BASE_URL}/api/payouts/request?expert_id=${user.id}&amount=${payoutRequestForm.amount}&payout_account_id=${payoutRequestForm.payoutAccountId}&description=${encodeURIComponent(payoutRequestForm.description)}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPayoutRequests([data.payout_request, ...payoutRequests]);
        setShowRequestPayout(false);
        setPayoutRequestForm({
          amount: '',
          payoutAccountId: '',
          description: ''
        });
        alert('Payout request submitted successfully!');
      } else {
        alert('Failed to submit payout request');
      }
    } catch (error) {
      console.error('Failed to submit payout request:', error);
      alert('Failed to submit payout request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payout dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Dashboard</h1>
          <p className="text-gray-600">Manage your earnings and request payouts</p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Balance</p>
                <p className="text-3xl font-bold">${availableBalance.toFixed(2)}</p>
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
                <p className="text-gray-500 text-sm font-medium">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payoutRequests.filter(req => req.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Paid Out</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payoutRequests
                    .filter(req => req.status === 'completed')
                    .reduce((sum, req) => sum + req.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowRequestPayout(true)}
              disabled={availableBalance < 50 || payoutAccounts.length === 0}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Request Payout
            </button>
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex-1 border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Add Payout Account
            </button>
          </div>
          {availableBalance < 50 && (
            <p className="text-sm text-gray-500 mt-2">Minimum payout amount is $50</p>
          )}
          {payoutAccounts.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Add a payout account to request payouts</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payout Accounts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Accounts</h2>
            {payoutAccounts.length > 0 ? (
              <div className="space-y-4">
                {payoutAccounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{account.accountHolderName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {account.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{account.payoutMethod.replace('_', ' ')}</p>
                    {account.payoutMethod === 'bank_transfer' ? (
                      <p className="text-sm text-gray-500">
                        {account.bankName} •••• {account.accountNumber?.slice(-4)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">{account.paypalEmail}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-gray-500">No payout accounts yet</p>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Add your first account
                </button>
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Requests</h2>
            {payoutRequests.length > 0 ? (
              <div className="space-y-4">
                {payoutRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">${request.amount.toFixed(2)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.description && (
                      <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No payout requests yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Account Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Payout Account</h2>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={newAccountForm.accountHolderName}
                    onChange={(e) => setNewAccountForm({...newAccountForm, accountHolderName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                  <select
                    value={newAccountForm.payoutMethod}
                    onChange={(e) => setNewAccountForm({...newAccountForm, payoutMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {newAccountForm.payoutMethod === 'bank_transfer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={newAccountForm.bankName}
                        onChange={(e) => setNewAccountForm({...newAccountForm, bankName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          required
                          value={newAccountForm.accountNumber}
                          onChange={(e) => setNewAccountForm({...newAccountForm, accountNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                        <input
                          type="text"
                          required
                          value={newAccountForm.routingNumber}
                          onChange={(e) => setNewAccountForm({...newAccountForm, routingNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                    <input
                      type="email"
                      required
                      value={newAccountForm.paypalEmail}
                      onChange={(e) => setNewAccountForm({...newAccountForm, paypalEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={newAccountForm.country}
                      onChange={(e) => setNewAccountForm({...newAccountForm, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={newAccountForm.state}
                      onChange={(e) => setNewAccountForm({...newAccountForm, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={newAccountForm.address}
                    onChange={(e) => setNewAccountForm({...newAccountForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={newAccountForm.city}
                      onChange={(e) => setNewAccountForm({...newAccountForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={newAccountForm.zipCode}
                      onChange={(e) => setNewAccountForm({...newAccountForm, zipCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Payout Modal */}
        {showRequestPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Payout</h2>
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    required
                    min="50"
                    max={availableBalance}
                    step="0.01"
                    value={payoutRequestForm.amount}
                    onChange={(e) => setPayoutRequestForm({...payoutRequestForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Available: ${availableBalance.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payout Account</label>
                  <select
                    required
                    value={payoutRequestForm.payoutAccountId}
                    onChange={(e) => setPayoutRequestForm({...payoutRequestForm, payoutAccountId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select an account</option>
                    {payoutAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountHolderName} - {account.payoutMethod === 'bank_transfer' ? account.bankName : 'PayPal'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={payoutRequestForm.description}
                    onChange={(e) => setPayoutRequestForm({...payoutRequestForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestPayout(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertPayoutDashboard;