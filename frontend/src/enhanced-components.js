import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from './UserContext';
import { Header } from './components';
import TrialStatusComponent from './TrialStatusComponent';

// Enhanced Discover Page with Advanced Features
export const DiscoverPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          Discover Amazing Creators
        </h1>
        <p className="text-gray-400 text-lg">
          Find your favorite content creators and explore exclusive content
        </p>
        <div className="mt-8">
          <p className="text-white">Test page - Discover functionality coming soon!</p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Member Dashboard with All Required Features
export const MemberDashboard = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [feed, setFeed] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [referralStats, setReferralStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockFeed = [
    {
      id: 1,
      performerId: 1,
      performerName: "Isabella Rose",
      performerUsername: "@isabella_rose",
      performerImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
      title: "Morning Workout Routine",
      description: "Starting my day with some intense cardio and strength training. Who wants to join me? 💪",
      type: "video",
      mediaUrl: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      thumbnail: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      duration: "12:34",
      isLocked: true,
      price: 9.99,
      likes: 1240,
      comments: 156,
      isLiked: false,
      isBookmarked: false,
      createdAt: "2024-01-20T08:30:00Z",
      tags: ["fitness", "workout", "morning"]
    },
    {
      id: 2,
      performerId: 2,
      performerName: "Sophia Dreams",
      performerUsername: "@sophia_dreams",
      performerImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
      title: "Behind the Scenes Photoshoot",
      description: "Exclusive behind-the-scenes content from my latest photoshoot. You get to see everything! 📸",
      type: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
      thumbnail: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
      isLocked: false,
      price: 0,
      likes: 856,
      comments: 89,
      isLiked: true,
      isBookmarked: true,
      createdAt: "2024-01-19T15:20:00Z",
      tags: ["photoshoot", "bts", "modeling"]
    }
  ];

  const mockSubscriptions = [
    {
      id: 1,
      performerId: 1,
      performerName: "Isabella Rose",
      performerUsername: "@isabella_rose",
      performerImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
      subscriptionType: "monthly",
      price: 19.99,
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-02-01T00:00:00Z",
      status: "active",
      autoRenew: true
    },
    {
      id: 2,
      performerId: 2,
      performerName: "Sophia Dreams",
      performerUsername: "@sophia_dreams",
      performerImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
      subscriptionType: "3-month",
      price: 69.99,
      startDate: "2023-12-15T00:00:00Z",
      endDate: "2024-03-15T00:00:00Z",
      status: "active",
      autoRenew: false
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setFeed(mockFeed);
      setSubscriptions(mockSubscriptions);
      setBookmarks(mockFeed.filter(post => post.isBookmarked));
      setReferralStats({
        totalReferrals: 12,
        totalEarnings: 127.50,
        thisMonth: 45.20,
        referralLink: "https://eyecandy.com/ref/johndoe123"
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLike = async (postId) => {
    setFeed(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = async (postId) => {
    setFeed(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    
    // Update bookmarks
    const updatedPost = feed.find(post => post.id === postId);
    if (updatedPost) {
      if (!updatedPost.isBookmarked) {
        setBookmarks(prev => [...prev, { ...updatedPost, isBookmarked: true }]);
      } else {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== postId));
      }
    }
  };

  const handleTip = async (performerId, amount, message) => {
    // Simulate tip sending
    console.log('Sending tip:', { performerId, amount, message });
    // In real implementation, this would call the API
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralStats.referralLink);
    // Show success message
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trial Status */}
        <TrialStatusComponent />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || user?.displayName}!
          </h1>
          <p className="text-gray-400">Your premium membership is active</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'feed', label: 'Your Feed', icon: '📰' },
            { id: 'subscriptions', label: 'Subscriptions', icon: '💎' },
            { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
            { id: 'messages', label: 'Messages', icon: '💬' },
            { id: 'referrals', label: 'Referrals', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-lg whitespace-nowrap transition-all flex items-center space-x-2 ${
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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your content...</p>
          </div>
        ) : (
          <>
            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Your Feed</h2>
                {feed.map(post => (
                  <FeedPost 
                    key={post.id} 
                    post={post} 
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onTip={handleTip}
                  />
                ))}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Subscriptions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptions.map(subscription => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Bookmarked Content</h2>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔖</div>
                    <p className="text-gray-400">No bookmarked content yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map(bookmark => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Messages</h2>
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-400 mb-4">No messages yet</p>
                  <p className="text-gray-500">Start chatting with your favorite creators!</p>
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Referral Program</h2>
                <ReferralSection referralStats={referralStats} onCopyLink={copyReferralLink} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Feed Post Component
const FeedPost = ({ post, onLike, onBookmark, onTip }) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');

  const handleTipSubmit = () => {
    if (tipAmount && parseFloat(tipAmount) > 0) {
      onTip(post.performerId, parseFloat(tipAmount), tipMessage);
      setShowTipModal(false);
      setTipAmount('');
      setTipMessage('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={post.performerImage} 
            alt={post.performerName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white">{post.performerName}</h3>
            <p className="text-gray-400 text-sm">{post.performerUsername}</p>
          </div>
          <div className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
        <p className="text-gray-300 mb-4">{post.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Media Content */}
      <div className="relative">
        <img 
          src={post.thumbnail} 
          alt={post.title}
          className="w-full h-64 object-cover"
        />
        
        {post.isLocked && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-lg font-semibold mb-2">Unlock for ${post.price}</p>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                Unlock Now
              </button>
            </div>
          </div>
        )}

        {post.type === 'video' && !post.isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <svg className="w-6 h-6" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments}</span>
            </button>
            
            <button 
              onClick={() => onBookmark(post.id)}
              className={`transition-colors ${
                post.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <svg className="w-6 h-6" fill={post.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
          
          <button 
            onClick={() => setShowTipModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            💰 Tip
          </button>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Send a Tip to {post.performerName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tip Amount ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message (optional)
              </label>
              <textarea
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                rows="3"
                placeholder="Add a message..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTipSubmit}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subscription Card Component
const SubscriptionCard = ({ subscription }) => {
  const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={subscription.performerImage}
          alt={subscription.performerName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-white">{subscription.performerName}</h3>
          <p className="text-gray-400 text-sm">{subscription.performerUsername}</p>
          <p className={`text-sm ${subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
            {subscription.status === 'active' ? `Active • ${daysRemaining} days left` : 'Expired'}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Subscription Type</span>
          <span>${subscription.price}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Auto Renew</span>
          <span>{subscription.autoRenew ? 'On' : 'Off'}</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
          Message
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
          Manage
        </button>
      </div>
    </div>
  );
};

// Bookmark Card Component
const BookmarkCard = ({ bookmark }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="relative">
        <img
          src={bookmark.thumbnail}
          alt={bookmark.title}
          className="w-full h-48 object-cover"
        />
        {bookmark.type === 'video' && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-white text-sm">
            {bookmark.duration}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">{bookmark.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{bookmark.performerName}</p>
        <div className="flex items-center justify-between">
          <span className="text-pink-400">{bookmark.isLocked ? `$${bookmark.price}` : 'Free'}</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
            </svg>
            <span>{bookmark.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Referral Section Component
const ReferralSection = ({ referralStats, onCopyLink }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Your Referral Stats</h3>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-pink-400">{referralStats.totalReferrals}</div>
          <div className="text-gray-400">Total Referrals</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">${referralStats.totalEarnings}</div>
          <div className="text-gray-400">Total Earned</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">${referralStats.thisMonth}</div>
          <div className="text-gray-400">This Month</div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6">
        <h4 className="font-semibold mb-2">Your Referral Link</h4>
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={referralStats.referralLink}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button 
            onClick={onCopyLink}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Commission Structure</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tier 1 (Direct Referrals):</span>
            <span className="text-green-400">10%</span>
          </div>
          <div className="flex justify-between">
            <span>Tier 2 (Sub-referrals):</span>
            <span className="text-green-400">5%</span>
          </div>
          <div className="flex justify-between">
            <span>Tier 3 (Sub-sub-referrals):</span>
            <span className="text-green-400">5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};