import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminDashboard from './AdminDashboard';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import TrialStatusComponent from './TrialStatusComponent';
import TrialWelcomeModal from './TrialWelcomeModal';

// Utility functions for optimization
const debounce = (func, delay) => {
  let debounceTimer;
  return function(...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Enhanced Mock Data for Development
const mockPerformers = [
  {
    id: 1,
    firstName: "Isabella",
    lastName: "Rose",
    displayName: "Isabella Rose",
    username: "@isabella_rose",
    email: "isabella@example.com",
    phone: "+1234567890",
    bio: "Welcome to my exclusive world ✨ Premium content creator sharing intimate moments and lifestyle content. Join me for daily updates and exclusive content you won't find anywhere else!",
    profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
    coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    location: {
      address: "123 Main St, Los Angeles, CA 90210",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      zipCode: "90210"
    },
    gender: "female",
    age: 25,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    followers: 125000,
    following: 45,
    posts: 247,
    subscribers: 12500,
    rating: 4.9,
    subscriptionType: "paid",
    monthlyFee: 19.99,
    bundles: [
      { months: 3, price: 54.99, discount: 8 },
      { months: 6, price: 99.99, discount: 17 },
      { months: 12, price: 179.99, discount: 25 }
    ],
    socialAccounts: {
      instagram: "@isabella_rose_official",
      twitter: "@isabella_rose",
      tiktok: "@isabella_rose"
    },
    bankVerified: true,
    idVerified: true,
    accountStatus: "active",
    createdAt: "2023-01-15T10:30:00Z",
    earnings: {
      total: 45780.50,
      thisMonth: 5240.30,
      pendingPayout: 1250.75
    },
    preferences: {
      darkMode: true,
      language: "en",
      notifications: {
        push: true,
        email: true,
        sms: false
      }
    }
  },
  {
    id: 2,
    firstName: "Sophia",
    lastName: "Dreams",
    displayName: "Sophia Dreams",
    username: "@sophia_dreams",
    email: "sophia@example.com",
    phone: "+1234567891",
    bio: "Your favorite girl next door 💕 Custom content available. Let's chat and get to know each other better!",
    profileImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
    coverImage: "https://images.pexels.com/photos/2330137/pexels-photo-2330137.jpeg",
    location: {
      address: "456 Beach Blvd, Miami, FL 33139",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33139"
    },
    gender: "female",
    age: 23,
    isOnline: false,
    lastSeen: "2024-01-20T14:45:00Z",
    followers: 89000,
    following: 67,
    posts: 189,
    subscribers: 8900,
    rating: 4.7,
    subscriptionType: "paid",
    monthlyFee: 24.99,
    bundles: [
      { months: 3, price: 69.99, discount: 7 },
      { months: 6, price: 129.99, discount: 13 },
      { months: 12, price: 239.99, discount: 20 }
    ],
    socialAccounts: {
      instagram: "@sophia_dreams_official",
      twitter: "@sophia_dreams"
    },
    bankVerified: true,
    idVerified: true,
    accountStatus: "active",
    createdAt: "2023-03-22T09:15:00Z",
    earnings: {
      total: 32450.25,
      thisMonth: 3890.60,
      pendingPayout: 980.40
    },
    preferences: {
      darkMode: true,
      language: "en",
      notifications: {
        push: true,
        email: true,
        sms: true
      }
    }
  }
];

const mockContent = [
  {
    id: 1,
    performerId: 1,
    title: "Morning Workout Routine",
    description: "Starting my day with some intense cardio and strength training. Who wants to join me? 💪",
    type: "video",
    mediaUrl: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    thumbnail: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    duration: "12:34",
    uploadType: "immediate",
    postType: "private",
    subscriptionRequired: true,
    price: 9.99,
    likes: 1240,
    comments: 156,
    views: 3500,
    isLocked: true,
    createdAt: "2024-01-20T08:30:00Z",
    updatedAt: "2024-01-20T08:30:00Z",
    tags: ["fitness", "workout", "morning"],
    location: "Home Gym",
    privacy: "subscribers"
  },
  {
    id: 2,
    performerId: 2,
    title: "Behind the Scenes Photoshoot",
    description: "Exclusive behind-the-scenes content from my latest photoshoot. You get to see everything! 📸",
    type: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
    thumbnail: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
    uploadType: "immediate",
    postType: "public",
    subscriptionRequired: false,
    price: 0,
    likes: 856,
    comments: 89,
    views: 2100,
    isLocked: false,
    createdAt: "2024-01-19T15:20:00Z",
    updatedAt: "2024-01-19T15:20:00Z",
    tags: ["photoshoot", "bts", "modeling"],
    location: "Photography Studio",
    privacy: "public"
  }
];

const mockStories = [
  {
    id: 1,
    performerId: 1,
    type: "photo",
    mediaUrl: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    duration: 15,
    text: "Good morning beautiful souls! ☀️",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    expiresAt: new Date(Date.now() + 23 * 3600000).toISOString(), // 23 hours from now
    views: 450,
    viewers: []
  }
];

// Header Component with Enhanced Features
export const Header = ({ showSearch = true, className = "" }) => {
  const { user, logout, userType, notifications } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        try {
          // Simulate API call
          const results = mockPerformers.filter(performer =>
            performer.displayName.toLowerCase().includes(query.toLowerCase()) ||
            performer.username.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className={`bg-black border-b border-gray-800 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <img 
                src="/experts-logo.svg" 
                alt="The Experts - Professional Advisory Platform" 
                className="h-8 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-blue-500 font-bold text-lg leading-none" style={{fontFamily: 'sans-serif'}}>The Experts</span>
                <span className="text-gray-400 text-xs" style={{fontFamily: 'sans-serif'}}>Professional Advisory</span>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {searchResults.map(performer => (
                    <a
                      key={performer.id}
                      href={`/profile/${performer.id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={performer.profileImage}
                        alt={performer.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{performer.displayName}</p>
                        <p className="text-gray-400 text-sm">{performer.username}</p>
                      </div>
                      {performer.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
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
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a1 1 0 01-.5-.85V9a6 6 0 10-12 0v3.65a1 1 0 01-.5.85L0 17h5m5 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3">Notifications</h3>
                        {notifications.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">No new notifications</p>
                        ) : (
                          notifications.map(notification => (
                            <div key={notification.id} className="mb-3 p-3 bg-gray-700 rounded-lg">
                              <p className="text-white text-sm">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <a href="/messages" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </a>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-white hover:text-pink-400 transition-colors"
                  >
                    <img 
                      src={user.profileImage || "https://images.unsplash.com/photo-1701286618296-b40443dc63a9"} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="hidden md:block">{user.displayName || user.firstName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                      <a href={`/${userType}-dashboard`} className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                        Dashboard
                      </a>
                      <a href="/profile-setup" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                        Profile
                      </a>
                      <a href="/wallet" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                        Wallet
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                        Settings
                      </a>
                      <div className="border-t border-gray-700"></div>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
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

// Enhanced Home Page
export const HomePage = () => {
  const { user } = useUser();
  const [featuredPerformers, setFeaturedPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch featured performers
    setTimeout(() => {
      setFeaturedPerformers(mockPerformers.slice(0, 3));
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showSearch={false} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1652715256284-6cba3e829a70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxsaW5nZXJpZSUyMG1vZGVsfGVufDB8fHxibGFja3wxNzUwOTQ3MjExfDA&ixlib=rb-4.1.0&q=85')`
          }}
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-2xl">
            The Experts
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-lg">
            Professional Advisory. Expert Guidance. Available for you.
          </p>
          <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Connect with certified professionals across law, medicine, finance, and business. 
            Get expert advice from qualified advisors you can trust.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Consulting
            </a>
            <a 
              href="/discover" 
              className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Find Experts
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose <span className="text-blue-400">The Experts</span>?
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            We provide the most advanced platform for professionals and clients to connect, 
            consult, and solve complex challenges with industry-leading expertise.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Content</h3>
              <p className="text-gray-400">
                Access exclusive content from your favorite creators with unlimited streaming, 
                high-quality videos, and personalized recommendations.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn & Refer</h3>
              <p className="text-gray-400">
                Join our 3-tier affiliate program and earn from referrals. 
                Creators keep 60% of revenue with multiple monetization options.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
              <p className="text-gray-400">
                Your privacy is our priority with end-to-end encryption, 
                secure payments, and advanced content protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Featured <span className="text-pink-400">Creators</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Discover amazing creators and exclusive content
          </p>
          
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPerformers.map(performer => (
                <div key={performer.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all">
                  <div className="relative">
                    <img 
                      src={performer.coverImage} 
                      alt={performer.displayName}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        performer.isOnline 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {performer.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <img 
                        src={performer.profileImage} 
                        alt={performer.displayName}
                        className="w-16 h-16 rounded-full border-4 border-white"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{performer.displayName}</h3>
                    <p className="text-gray-400 text-sm mb-4">{performer.username}</p>
                    <p className="text-gray-300 mb-4 line-clamp-2">{performer.bio}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {(performer.followers / 1000).toFixed(0)}K followers
                      </div>
                      <a 
                        href={`/profile/${performer.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join The Experts?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Start your journey today and connect with certified professionals and trusted advisors
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-4 bg-white text-purple-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Get Started Now
            </a>
            <a 
              href="/discover"
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Browse Creators
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced Login Page
export const LoginPage = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'member'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.userType);
    
    if (result.success) {
      window.location.href = `/${formData.userType}-dashboard`;
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showSearch={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to your The Experts account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'member' 
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-medium">Member</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'performer' 
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-sm font-medium">Creator</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="text-pink-500 focus:ring-pink-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-pink-400 hover:text-pink-300">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              <button className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-400 hover:text-pink-300 font-medium">
                Sign up now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sign Up Page
export const SignUpPage = () => {
  const { signup } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToAge: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy || !formData.agreeToAge) {
      setError('Please agree to all terms and conditions');
      setIsLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      setSuccess(result.message);
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showSearch={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
              Join The Experts
            </h1>
            <p className="text-gray-400">Create your account and start your journey</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'client' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="client"
                    checked={formData.userType === 'client'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-medium">Client</div>
                    <div className="text-xs text-gray-400 mt-1">Seek expertise</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'expert' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="expert"
                    checked={formData.userType === 'expert'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="text-sm font-medium">Expert</div>
                    <div className="text-xs text-gray-400 mt-1">Provide expertise</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Create a password"
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToAge}
                  onChange={(e) => setFormData({...formData, agreeToAge: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I confirm that I am 18 years or older
                </span>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" className="text-pink-400 hover:text-pink-300">
                    Terms and Conditions
                  </a>
                </span>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => setFormData({...formData, agreeToPrivacy: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/privacy" className="text-pink-400 hover:text-pink-300">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/cookies" className="text-pink-400 hover:text-pink-300">
                    Cookie Policy
                  </a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other pages - will be implemented in next iterations
export const ForgotPasswordPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/login" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Login
      </a>
    </div>
  </div>
);

export const VerifyOTPPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/login" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Login
      </a>
    </div>
  </div>
);

export const ProfileSetupPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Profile Setup</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const BankVerificationPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Bank Verification</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

// Import enhanced components
export { MemberDashboard } from './enhanced-components';

// Enhanced Performer Dashboard with Geo-Location Settings
export const PerformerDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Content', icon: '🎥' },
    { id: 'geolocation', label: 'Location Settings', icon: '🌍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Expert Dashboard</h1>
          <p className="text-gray-400">Manage your consultations, earnings, and profile settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {/* Trial Status */}
          <TrialStatusComponent />
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                <div className="text-3xl font-bold text-green-400 mb-2">$2,456</div>
                <p className="text-gray-400">This month</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Subscribers</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">1,234</div>
                <p className="text-gray-400">Active subscribers</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Content Views</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">45.6K</div>
                <p className="text-gray-400">Total views</p>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Content Management</h3>
              <p className="text-gray-400">Upload and manage your photos, videos, and live streams.</p>
              <div className="mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all">
                  Upload Content
                </button>
              </div>
            </div>
          )}

          {activeTab === 'geolocation' && user && (
            <div>
              {/* Import the GeolocationSettings component */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🌍 Location & Access Settings</h3>
                <p className="text-gray-400 mb-6">
                  Control who can access your profile based on their location and set subscription requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">🗺️ Geographic Controls</h4>
                    <p className="text-gray-400 text-sm">Set which countries, states, or cities can access your profile</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">💳 Subscription Types</h4>
                    <p className="text-gray-400 text-sm">Configure free, monthly, pay-per-visit, or teaser access</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">⏱️ Teaser Settings</h4>
                    <p className="text-gray-400 text-sm">Set preview duration (15-300 seconds) before payment required</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">🚫 User Blocking</h4>
                    <p className="text-gray-400 text-sm">Block users for harassment, inappropriate behavior, etc.</p>
                  </div>
                </div>
                <div className="text-center">
                  <a 
                    href={`/performer/${user.id}/geolocation-settings`}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    Configure Location Settings
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Analytics & Insights</h3>
              <p className="text-gray-400">View detailed analytics about your content performance and audience.</p>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Earnings & Payouts</h3>
              <p className="text-gray-400">Track your earnings, manage payouts, and view transaction history.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
              <p className="text-gray-400">Manage your account preferences, privacy settings, and profile information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// More placeholder components
export const ProfilePage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const StorePage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Store Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const StreamingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Streaming Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const MessagingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const SettingsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const AdminLogin = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PostDetailPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Post Details</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const SubscriptionPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PaymentPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const WalletPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const NotificationsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PaymentSuccessPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4 text-green-400">Payment Successful!</h1>
      <p className="text-gray-400 mb-6">Your payment has been processed successfully.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300">
        Return to Home
      </a>
    </div>
  </div>
);

export const PaymentCancelledPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4 text-red-400">Payment Cancelled</h1>
      <p className="text-gray-400 mb-6">Your payment has been cancelled.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300">
        Return to Home
      </a>
    </div>
  </div>
);