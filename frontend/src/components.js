import React, { useState, useEffect } from 'react';

// Mock Data
const mockPerformers = [
  {
    id: 1,
    name: "Isabella Rose",
    username: "@isabella_rose",
    followers: "125K",
    isOnline: true,
    profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
    coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    rating: 4.9,
    price: "$19.99/month",
    bio: "Welcome to my exclusive world ✨ Premium content creator sharing intimate moments and lifestyle content.",
    posts: 247,
    subscribers: "12.5K"
  },
  {
    id: 2,
    name: "Sophia Dreams",
    username: "@sophia_dreams",
    followers: "89K",
    isOnline: false,
    profileImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
    coverImage: "https://images.pexels.com/photos/2330137/pexels-photo-2330137.jpeg",
    rating: 4.7,
    price: "$24.99/month",
    bio: "Your favorite girl next door 💕 Custom content available. Let's chat!",
    posts: 189,
    subscribers: "8.9K"
  },
  {
    id: 3,
    name: "Luna Nights",
    username: "@luna_nights",
    followers: "156K",
    isOnline: true,
    profileImage: "https://images.pexels.com/photos/1983035/pexels-photo-1983035.jpeg",
    coverImage: "https://images.unsplash.com/photo-1717295248358-4b8f2c8989d6",
    rating: 4.8,
    price: "$29.99/month",
    bio: "Late night adventures and exclusive content 🌙 VIP experience guaranteed.",
    posts: 312,
    subscribers: "15.6K"
  }
];

const mockContent = [
  {
    id: 1,
    performerId: 1,
    type: "video",
    title: "Morning Routine",
    thumbnail: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    duration: "12:34",
    likes: 1240,
    isLocked: true,
    price: "$9.99"
  },
  {
    id: 2,
    performerId: 2,
    type: "photo",
    title: "Behind the Scenes",
    thumbnail: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
    likes: 856,
    isLocked: false,
    price: "Free"
  }
];

// Header Component
export const Header = ({ user, onLogout, userType }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-white font-bold text-xl">Eye Candy</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/discover" className="text-gray-300 hover:text-white transition-colors">
              Discover
            </a>
            <a href="/categories" className="text-gray-300 hover:text-white transition-colors">
              Categories
            </a>
            <a href="/live" className="text-gray-300 hover:text-white transition-colors">
              Live
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 text-white hover:text-pink-400 transition-colors"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1701286618296-b40443dc63a9" 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </button>
                
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
                    <a href={`/${userType}-dashboard`} className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
                      Dashboard
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
                      Settings
                    </a>
                    <button 
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <a 
                  href="/login"
                  className="px-4 py-2 text-white hover:text-pink-400 transition-colors"
                >
                  Login
                </a>
                <a 
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Home Page
export const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1701286618296-b40443dc63a9')`
          }}
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Eye Candy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Premium Content. Exclusive Experiences. Unlimited Possibilities.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Your Journey
            </a>
            <a 
              href="/discover"
              className="px-8 py-4 border-2 border-pink-500 text-pink-400 rounded-lg text-lg font-semibold hover:bg-pink-500 hover:text-white transition-all"
            >
              Explore Creators
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-pink-400">Eye Candy</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Exclusive Content</h3>
              <p className="text-gray-400">Access premium content from your favorite creators with unlimited streaming.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn & Refer</h3>
              <p className="text-gray-400">Join our 3-tier affiliate program and earn from referrals with competitive rates.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
              <p className="text-gray-400">Your privacy is our priority with end-to-end encryption and secure payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-white font-bold text-xl">Eye Candy</span>
          </div>
          <p className="text-gray-400">© 2025 Eye Candy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Login Page
export const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'member'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login
    const userData = {
      id: 1,
      name: formData.userType === 'member' ? 'John Doe' : 'Isabella Rose',
      email: formData.email,
      type: formData.userType
    };
    onLogin(userData, formData.userType);
    window.location.href = `/${formData.userType}-dashboard`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-white font-bold text-2xl">Eye Candy</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-white">Member ($19.95/month)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-white">Performer ($50/month)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-400 hover:text-pink-300">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sign Up Page
export const SignUpPage = ({ onSignUp }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Mock signup
    const userData = {
      id: 1,
      name: formData.name,
      email: formData.email,
      type: formData.userType
    };
    onSignUp(userData, formData.userType);
    window.location.href = `/${formData.userType}-dashboard`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-white font-bold text-2xl">Eye Candy</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Join Eye Candy</h2>
            <p className="text-gray-400">Create your account today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-white">Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-white">Performer</span>
                </label>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {formData.userType === 'member' ? 'Members pay $19.95/month' : 'Performers pay $50/month and keep 60% of revenue'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-pink-400 hover:text-pink-300">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Discover Page
export const DiscoverPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPerformers = mockPerformers.filter(performer => {
    const matchesSearch = performer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'online' && performer.isOnline) ||
                         (filter === 'offline' && !performer.isOnline);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Discover Creators</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('online')}
                className={`px-4 py-2 rounded-lg ${filter === 'online' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                Online
              </button>
              <button
                onClick={() => setFilter('offline')}
                className={`px-4 py-2 rounded-lg ${filter === 'offline' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                Offline
              </button>
            </div>
          </div>
        </div>

        {/* Creators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerformers.map(performer => (
            <div key={performer.id} className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img 
                  src={performer.coverImage} 
                  alt={performer.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    performer.isOnline ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {performer.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <img 
                    src={performer.profileImage} 
                    alt={performer.name}
                    className="w-16 h-16 rounded-full border-4 border-white object-cover"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{performer.name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-400">{performer.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{performer.username}</p>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{performer.bio}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-400">
                    <span>{performer.followers} followers</span>
                    <span className="mx-2">•</span>
                    <span>{performer.posts} posts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-pink-400">{performer.price}</span>
                  <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Member Dashboard
export const MemberDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} onLogout={onLogout} userType="member" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-400">Your premium membership is active</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {['feed', 'subscriptions', 'messages', 'referrals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Your Feed</h2>
            {mockContent.map(content => (
              <div key={content.id} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={mockPerformers.find(p => p.id === content.performerId)?.profileImage} 
                      alt="Creator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {mockPerformers.find(p => p.id === content.performerId)?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="relative mb-4">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {content.isLocked && (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🔒</div>
                          <p className="text-lg font-semibold mb-2">Unlock for {content.price}</p>
                          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Unlock Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">{content.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-pink-400">
                        <span>❤️</span>
                        <span>{content.likes}</span>
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        💬 Comment
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        📤 Share
                      </button>
                    </div>
                    {content.type === 'video' && (
                      <span className="text-sm text-gray-400">{content.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Subscriptions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPerformers.slice(0, 2).map(performer => (
                <div key={performer.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={performer.profileImage} 
                      alt={performer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{performer.name}</h3>
                      <p className="text-gray-400 text-sm">{performer.username}</p>
                      <p className="text-green-400 text-sm">Active • Renews Dec 25</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                      Message
                    </button>
                    <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Referral Program</h2>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Your Referral Stats</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">12</div>
                  <div className="text-gray-400">Total Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">$127.50</div>
                  <div className="text-gray-400">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">$45.20</div>
                  <div className="text-gray-400">This Month</div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-semibold mb-2">Your Referral Link</h4>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value="https://eyecandy.com/ref/johndoe123"
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
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
          </div>
        )}
      </div>
    </div>
  );
};

// Performer Dashboard
export const PerformerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} onLogout={onLogout} userType="performer" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-gray-400">Manage your content and earnings</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isLive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isLive ? '🔴 End Stream' : '📹 Go Live'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {['overview', 'content', 'store', 'earnings', 'referrals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
                <div className="text-3xl font-bold text-green-400">$2,847</div>
                <p className="text-gray-400 text-sm">+12% from last month</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
                <div className="text-3xl font-bold text-pink-400">1,247</div>
                <p className="text-gray-400 text-sm">+8% from last month</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Content Views</h3>
                <div className="text-3xl font-bold text-purple-400">12,5K</div>
                <p className="text-gray-400 text-sm">+15% from last month</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Revenue Share</h3>
                <div className="text-3xl font-bold text-blue-400">60%</div>
                <p className="text-gray-400 text-sm">You keep 60% of revenue</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New subscription from @john_doe</p>
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                  </div>
                  <span className="text-green-400">+$19.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Content purchase: "Morning Routine"</p>
                    <p className="text-gray-400 text-sm">4 hours ago</p>
                  </div>
                  <span className="text-green-400">+$9.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New follower: @sarah_m</p>
                    <p className="text-gray-400 text-sm">6 hours ago</p>
                  </div>
                  <span className="text-blue-400">Follow</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Content</h2>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                + Upload New Content
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockContent.map(content => (
                <div key={content.id} className="bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{content.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>{content.type}</span>
                      <span>{content.likes} likes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold">{content.price}</span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Personal Store</h2>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                + Add Item
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Store Items</h3>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-400 mb-4">Your store is empty</p>
                <p className="text-gray-500">Add photos, videos, or physical items to start selling</p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Earnings & Payouts</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">This Month</h3>
                <div className="text-3xl font-bold text-green-400">$847.20</div>
                <p className="text-gray-400 text-sm">60% of $1,412</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Pending Payout</h3>
                <div className="text-3xl font-bold text-yellow-400">$245.60</div>
                <p className="text-gray-400 text-sm">Available Dec 1st</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Lifetime</h3>
                <div className="text-3xl font-bold text-purple-400">$12,847</div>
                <p className="text-gray-400 text-sm">Since joining</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Payment History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                  <div>
                    <p className="font-medium">November 2024 Payout</p>
                    <p className="text-gray-400 text-sm">Paid to bank account ending 1234</p>
                  </div>
                  <span className="text-green-400 font-semibold">$1,247.80</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                  <div>
                    <p className="font-medium">October 2024 Payout</p>
                    <p className="text-gray-400 text-sm">Paid to bank account ending 1234</p>
                  </div>
                  <span className="text-green-400 font-semibold">$987.40</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Performer Referral Program</h2>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Your Referral Stats</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">8</div>
                  <div className="text-gray-400">Performers Referred</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">$247.50</div>
                  <div className="text-gray-400">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">$89.20</div>
                  <div className="text-gray-400">This Month</div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-semibold mb-2">Your Performer Referral Link</h4>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value="https://eyecandy.com/performer-ref/isabella_rose"
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Page
export const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Profile Page</h1>
        <p className="text-gray-400">Profile details will be displayed here</p>
      </div>
    </div>
  );
};

// Store Page
export const StorePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Personal Store</h1>
        <p className="text-gray-400">Store items will be displayed here</p>
      </div>
    </div>
  );
};

// Streaming Page
export const StreamingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Live Stream</h1>
        <p className="text-gray-400">Streaming interface will be displayed here</p>
      </div>
    </div>
  );
};