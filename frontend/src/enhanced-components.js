import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from './App';

// Enhanced Discover Page with Advanced Features
export const DiscoverPage = () => {
  const { user, API } = useUser();
  const [performers, setPerformers] = useState([]);
  const [filteredPerformers, setFilteredPerformers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, online, offline
    subscriptionType: 'all', // all, free, paid
    sortBy: 'popularity', // popularity, newest, price_low, price_high
    gender: 'all', // all, female, male, other
    ageRange: 'all' // all, 18-25, 26-35, 36+
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const performersPerPage = 12;

  // Mock performers data
  const mockPerformers = [
    {
      id: 1,
      firstName: "Isabella",
      lastName: "Rose",
      displayName: "Isabella Rose",
      username: "@isabella_rose",
      email: "isabella@example.com",
      bio: "Welcome to my exclusive world ✨ Premium content creator sharing intimate moments and lifestyle content.",
      profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
      coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      gender: "female",
      age: 25,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followers: 125000,
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
      isVerified: true,
      joinedDate: "2023-01-15",
      totalLikes: 450000,
      totalMedia: 890
    },
    {
      id: 2,
      firstName: "Sophia",
      lastName: "Dreams",
      displayName: "Sophia Dreams",
      username: "@sophia_dreams",
      bio: "Your favorite girl next door 💕 Custom content available. Let's chat!",
      profileImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4",
      coverImage: "https://images.pexels.com/photos/2330137/pexels-photo-2330137.jpeg",
      gender: "female",
      age: 23,
      isOnline: false,
      lastSeen: "2024-01-20T14:45:00Z",
      followers: 89000,
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
      isVerified: true,
      joinedDate: "2023-03-22",
      totalLikes: 287000,
      totalMedia: 567
    },
    {
      id: 3,
      firstName: "Luna",
      lastName: "Nights",
      displayName: "Luna Nights",
      username: "@luna_nights",
      bio: "Late night adventures and exclusive content 🌙 VIP experience guaranteed.",
      profileImage: "https://images.pexels.com/photos/1983035/pexels-photo-1983035.jpeg",
      coverImage: "https://images.unsplash.com/photo-1717295248358-4b8f2c8989d6",
      gender: "female",
      age: 28,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followers: 156000,
      posts: 312,
      subscribers: 15600,
      rating: 4.8,
      subscriptionType: "paid",
      monthlyFee: 29.99,
      bundles: [
        { months: 3, price: 79.99, discount: 11 },
        { months: 6, price: 149.99, discount: 17 },
        { months: 12, price: 269.99, discount: 25 }
      ],
      isVerified: true,
      joinedDate: "2022-11-08",
      totalLikes: 678000,
      totalMedia: 1240
    },
    {
      id: 4,
      firstName: "Alex",
      lastName: "Storm",
      displayName: "Alex Storm",
      username: "@alex_storm",
      bio: "Fitness enthusiast and lifestyle content creator. Join my journey to wellness! 💪",
      profileImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      coverImage: "https://images.pexels.com/photos/2330137/pexels-photo-2330137.jpeg",
      gender: "male",
      age: 30,
      isOnline: false,
      lastSeen: "2024-01-19T18:30:00Z",
      followers: 67000,
      posts: 145,
      subscribers: 5400,
      rating: 4.6,
      subscriptionType: "free",
      monthlyFee: 0,
      bundles: [],
      isVerified: true,
      joinedDate: "2023-06-12",
      totalLikes: 123000,
      totalMedia: 345
    },
    {
      id: 5,
      firstName: "Maya",
      lastName: "Divine",
      displayName: "Maya Divine",
      username: "@maya_divine",
      bio: "Spiritual content and meditation sessions. Find your inner peace with me ✨",
      profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
      coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      gender: "female",
      age: 26,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followers: 45000,
      posts: 98,
      subscribers: 3200,
      rating: 4.9,
      subscriptionType: "paid",
      monthlyFee: 15.99,
      bundles: [
        { months: 3, price: 42.99, discount: 10 },
        { months: 6, price: 79.99, discount: 17 },
        { months: 12, price: 149.99, discount: 22 }
      ],
      isVerified: false,
      joinedDate: "2023-09-03",
      totalLikes: 89000,
      totalMedia: 234
    }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query, currentFilters) => {
      let filtered = [...mockPerformers];

      // Apply search filter
      if (query.length > 0) {
        filtered = filtered.filter(performer =>
          performer.displayName.toLowerCase().includes(query.toLowerCase()) ||
          performer.username.toLowerCase().includes(query.toLowerCase()) ||
          performer.bio.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Apply status filter
      if (currentFilters.status !== 'all') {
        filtered = filtered.filter(performer =>
          currentFilters.status === 'online' ? performer.isOnline : !performer.isOnline
        );
      }

      // Apply subscription type filter
      if (currentFilters.subscriptionType !== 'all') {
        filtered = filtered.filter(performer =>
          currentFilters.subscriptionType === 'free' 
            ? performer.subscriptionType === 'free' 
            : performer.subscriptionType === 'paid'
        );
      }

      // Apply gender filter
      if (currentFilters.gender !== 'all') {
        filtered = filtered.filter(performer => performer.gender === currentFilters.gender);
      }

      // Apply age range filter
      if (currentFilters.ageRange !== 'all') {
        filtered = filtered.filter(performer => {
          const age = performer.age;
          switch (currentFilters.ageRange) {
            case '18-25': return age >= 18 && age <= 25;
            case '26-35': return age >= 26 && age <= 35;
            case '36+': return age >= 36;
            default: return true;
          }
        });
      }

      // Apply sorting
      switch (currentFilters.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
          break;
        case 'price_low':
          filtered.sort((a, b) => a.monthlyFee - b.monthlyFee);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.monthlyFee - a.monthlyFee);
          break;
        case 'popularity':
        default:
          filtered.sort((a, b) => b.followers - a.followers);
          break;
      }

      setFilteredPerformers(filtered);
      setTotalPages(Math.ceil(filtered.length / performersPerPage));
      setCurrentPage(1);
    }, 300),
    []
  );

  // Debounce utility function
  function debounce(func, delay) {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPerformers(mockPerformers);
      debouncedSearch(searchTerm, filters);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm, filters);
  }, [searchTerm, filters, debouncedSearch]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const refreshSuggestions = () => {
    setIsLoading(true);
    // Simulate refresh with new suggestions
    setTimeout(() => {
      const shuffled = [...mockPerformers].sort(() => 0.5 - Math.random());
      setPerformers(shuffled);
      debouncedSearch(searchTerm, filters);
      setIsLoading(false);
    }, 1000);
  };

  const getCurrentPagePerformers = () => {
    const startIndex = (currentPage - 1) * performersPerPage;
    const endIndex = startIndex + performersPerPage;
    return filteredPerformers.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Creators
          </h1>
          <p className="text-gray-400 text-lg">
            Find your favorite content creators and explore exclusive content
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, username, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
              <div className="absolute left-4 top-3.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Subscription Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={filters.subscriptionType}
                onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Premium</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="all">All</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={filters.ageRange}
                onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="all">All Ages</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36+">36+</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              {filteredPerformers.length} creators found
            </div>
            <button
              onClick={refreshSuggestions}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPerformers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No creators found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  status: 'all',
                  subscriptionType: 'all',
                  sortBy: 'popularity',
                  gender: 'all',
                  ageRange: 'all'
                });
              }}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentPagePerformers().map(performer => (
                <div key={performer.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                  <div className="relative">
                    <img 
                      src={performer.coverImage} 
                      alt={performer.displayName}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Status Indicator */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        performer.isOnline 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {performer.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {/* Verification Badge */}
                    {performer.isVerified && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-blue-500 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Profile Image */}
                    <div className="absolute bottom-3 left-3">
                      <img 
                        src={performer.profileImage} 
                        alt={performer.displayName}
                        className="w-12 h-12 rounded-full border-3 border-white object-cover"
                      />
                    </div>

                    {/* Subscription Type Badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        performer.subscriptionType === 'free'
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {performer.subscriptionType === 'free' ? 'Free' : 'Premium'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {performer.displayName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-400">{performer.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-1">{performer.username}</p>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2 h-10">
                      {performer.bio}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{(performer.followers / 1000).toFixed(0)}K followers</span>
                      <span>{performer.posts} posts</span>
                      <span>{(performer.totalLikes / 1000).toFixed(0)}K likes</span>
                    </div>
                    
                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        {performer.subscriptionType === 'paid' ? (
                          <span className="text-lg font-semibold text-pink-400">
                            ${performer.monthlyFee}/month
                          </span>
                        ) : (
                          <span className="text-lg font-semibold text-green-400">
                            Free
                          </span>
                        )}
                      </div>
                      <a 
                        href={`/profile/${performer.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
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