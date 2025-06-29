import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './App';

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
                src="/eye-candy-logo.svg" 
                alt="Eye Candy - Interlocking Hearts Logo" 
                className="h-8 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-red-500 font-bold text-lg leading-none italic" style={{fontFamily: 'cursive'}}>Eye Candy</span>
                <span className="text-gray-400 text-xs italic" style={{fontFamily: 'cursive'}}>Unwrap Me</span>
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
                    className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
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
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
            Eye Candy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-lg">
            Premium Content. Exclusive Experiences. Waiting for you.
          </p>
          <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Join thousands of creators and fans in the world's most exclusive content platform. 
            Create, share, and monetize your content with our advanced features and secure payment system.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              Start Your Journey
            </a>
            <a 
              href="/discover"
              className="px-8 py-4 border-2 border-pink-500 text-pink-400 rounded-lg text-lg font-semibold hover:bg-pink-500 hover:text-white transition-all shadow-lg backdrop-blur-sm bg-black/20"
            >
              Explore Creators
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
            Why Choose <span className="text-pink-400">Eye Candy</span>?
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            We provide the most advanced platform for content creators and fans to connect, 
            share, and monetize exclusive content with industry-leading features.
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
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPerformers.map(performer => (
                <div key={performer.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={performer.coverImage} 
                      alt={performer.displayName}
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
                        alt={performer.displayName}
                        className="w-16 h-16 rounded-full border-4 border-white object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{performer.displayName}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-400">{performer.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{performer.username}</p>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{performer.bio}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">
                        <span>{performer.followers.toLocaleString()} followers</span>
                        <span className="mx-2">•</span>
                        <span>{performer.posts} posts</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-pink-400">
                        ${performer.monthlyFee}/month
                      </span>
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

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">1M+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400">Content Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">$10M+</div>
              <div className="text-gray-400">Creator Earnings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators and fans already earning and enjoying exclusive content on Eye Candy.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-4 bg-white text-purple-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Start Creating Today
            </a>
            <a 
              href="/discover"
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Explore Content
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img 
                  src="/eye-candy-logo.svg" 
                  alt="Eye Candy - Interlocking Hearts Logo" 
                  className="h-6 w-auto"
                />
                <div className="flex flex-col">
                  <span className="text-red-500 font-bold text-lg leading-none italic" style={{fontFamily: 'cursive'}}>Eye Candy</span>
                  <span className="text-gray-400 text-xs italic" style={{fontFamily: 'cursive'}}>Unwrap Me</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                The world's most exclusive content platform for creators and fans.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-pink-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.091.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.989C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Creators</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/creator-program" className="hover:text-white">Creator Program</a></li>
                <li><a href="/monetization" className="hover:text-white">Monetization</a></li>
                <li><a href="/analytics" className="hover:text-white">Analytics</a></li>
                <li><a href="/resources" className="hover:text-white">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Fans</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/discover" className="hover:text-white">Discover</a></li>
                <li><a href="/categories" className="hover:text-white">Categories</a></li>
                <li><a href="/live" className="hover:text-white">Live Streams</a></li>
                <li><a href="/premium" className="hover:text-white">Premium</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="/safety" className="hover:text-white">Safety</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 Eye Candy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Enhanced Login Page with Social Login
export const LoginPage = () => {
  const { login, socialLogin } = useUser();
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

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate social login process
      // In real implementation, you'd integrate with Google/Facebook SDK
      const mockToken = 'mock_social_token';
      const result = await socialLogin(provider, mockToken);
      
      if (result.success) {
        window.location.href = `/${result.user.userType}-dashboard`;
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Social login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/eye-candy-logo.svg" 
                alt="Eye Candy - Interlocking Hearts Logo" 
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-red-500 font-bold text-xl leading-none italic" style={{fontFamily: 'cursive'}}>Eye Candy</span>
                <span className="text-gray-400 text-sm italic" style={{fontFamily: 'cursive'}}>Unwrap Me</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-medium">Member</div>
                    <div className="text-gray-400 text-xs">$19.95/month</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-medium">Performer</div>
                    <div className="text-gray-400 text-xs">$50/month</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email or Phone Number
              </label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter your email or phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="text-pink-500 focus:ring-pink-500 rounded" />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-pink-400 hover:text-pink-300">
                Forgot password?
              </a>
            </div>

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
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-lg bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-lg bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-400 hover:text-pink-300 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sign Up Page with Terms & Conditions
export const SignUpPage = () => {
  const { signup } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToAge: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
      window.location.href = '/verify-otp';
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/eye-candy-logo.svg" 
                alt="Eye Candy - Interlocking Hearts Logo" 
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-red-500 font-bold text-xl leading-none italic" style={{fontFamily: 'cursive'}}>Eye Candy</span>
                <span className="text-gray-400 text-sm italic" style={{fontFamily: 'cursive'}}>Unwrap Me</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Join Eye Candy</h2>
            <p className="text-gray-400">Create your account today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-medium">Member</div>
                    <div className="text-gray-400 text-xs">$19.95/month</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="text-pink-500 focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-medium">Performer</div>
                    <div className="text-gray-400 text-xs">$50/month</div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {formData.userType === 'member' 
                  ? 'Access exclusive content from creators worldwide' 
                  : 'Create and monetize your content, keep 60% of revenue'}
              </p>
            </div>

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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
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
export { DiscoverPage, MemberDashboard } from './enhanced-components';

// Enhanced Performer Dashboard with Geo-Location Settings
export const PerformerDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Content', icon: '🎥' },
    { id: 'geolocation', label: 'Location Settings', icon: '🌍' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Performer Dashboard</h1>
          <p className="text-gray-400">Manage your content, earnings, and profile settings</p>
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Earnings</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-pink-400">$2,456.78</div>
                <div className="text-gray-400 text-sm">+12% from last month</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Subscribers</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">1,234</div>
                <div className="text-gray-400 text-sm">+8% from last month</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Profile Views</h3>
                  <span className="text-2xl">👁️</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">45,678</div>
                <div className="text-gray-400 text-sm">+15% from last month</div>
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

          {activeTab === 'earnings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Earnings Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-semibold">$567.89</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Last Month</span>
                  <span className="text-white font-semibold">$1,234.56</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Pending Payout</span>
                  <span className="text-green-400 font-semibold">$345.67</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.displayName || user?.firstName}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Bio</label>
                  <textarea 
                    rows={4}
                    defaultValue="Your bio here..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Profile Page with Mock Data
export const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useUser();
  
  // Mock performer data for demonstration
  const performer = {
    id: id,
    firstName: "Isabella",
    lastName: "Rose",
    displayName: "Isabella Rose",
    username: "@isabella_rose",
    bio: "Welcome to my exclusive world ✨ Premium content creator sharing intimate moments and lifestyle content.",
    profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
    coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
    location: "Los Angeles, CA",
    followers: 125000,
    following: 45,
    posts: 247,
    subscribers: 12500,
    rating: 4.9,
    subscriptionType: "paid",
    monthlyFee: 19.99,
    isOnline: true,
    lastSeen: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="h-64 md:h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${performer.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <img
                src={performer.profileImage}
                alt={performer.displayName}
                className="w-32 h-32 rounded-full border-4 border-pink-500 object-cover"
              />
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{performer.displayName}</h1>
                  {performer.isOnline && (
                    <span className="flex items-center text-green-400 text-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                      Online
                    </span>
                  )}
                </div>
                <p className="text-pink-400 text-lg mb-2">{performer.username}</p>
                <p className="text-gray-300 mb-4">{performer.bio}</p>
                
                {/* Stats */}
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-white font-bold">{performer.followers.toLocaleString()}</div>
                    <div className="text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{performer.posts}</div>
                    <div className="text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{performer.subscribers.toLocaleString()}</div>
                    <div className="text-gray-400">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{performer.rating}/5</div>
                    <div className="text-gray-400">Rating</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all">
                  Subscribe for ${performer.monthlyFee}/month
                </button>
                <button className="px-6 py-3 border border-pink-500 text-pink-400 rounded-lg font-semibold hover:bg-pink-500 hover:text-white transition-all">
                  Send Message
                </button>
                <button className="px-6 py-3 border border-gray-600 text-gray-400 rounded-lg font-semibold hover:bg-gray-600 hover:text-white transition-all">
                  Send Tip
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-pink-500 text-pink-400 font-medium">
                  Posts
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent text-gray-400 hover:text-white">
                  Photos
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent text-gray-400 hover:text-white">
                  Videos
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent text-gray-400 hover:text-white">
                  Live
                </button>
              </nav>
            </div>
            
            {/* Sample Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div key={item} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2">Exclusive Content #{item}</h3>
                    <p className="text-gray-400 text-sm mb-3">Premium content available for subscribers only.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 font-semibold">$9.99</span>
                      <button className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 transition-all">
                        Unlock
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StorePage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Store Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const StreamingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Streaming Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const MessagingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Messaging</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const SettingsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const AdminDashboard = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const AdminLogin = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const PostDetailPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Post Detail</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const SubscriptionPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

// Re-export payment and wallet components
export { PaymentPage } from './payment-components';
export { WalletPage } from './wallet-components';

// Payment Success Page
export const PaymentSuccessPage = () => {
  const [sessionId, setSessionId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    
    if (session) {
      setSessionId(session);
      checkPaymentStatus(session);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkPaymentStatus = async (sessionId) => {
    try {
      const response = await fetch(`/api/payments/status/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const result = await response.json();
      setPaymentDetails(result);
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-400 mb-8">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
        
        {paymentDetails && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span>{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span>${paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{new Date(paymentDetails.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <a
            href="/member-dashboard"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Go to Dashboard
          </a>
          <div>
            <a href="/discover" className="text-pink-400 hover:text-pink-300">
              Discover More Content
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Cancelled Page
export const PaymentCancelledPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-xl text-gray-400 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        <div className="space-y-4">
          <a
            href="/payment"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Try Again
          </a>
          <div>
            <a href="/discover" className="text-pink-400 hover:text-pink-300">
              Continue Browsing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const HelpSupportPage = () => (
  <div className="min-h-screen bg-black text-white">
    <Header />
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Help & Support</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 mb-4">Need help? We're here to assist you!</p>
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📧 Email Support</h3>
            <p className="text-gray-400">support@eyecandy.com</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">💬 Live Chat</h3>
            <p className="text-gray-400">Available 24/7 for premium members</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📚 FAQ</h3>
            <p className="text-gray-400">Check our frequently asked questions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);