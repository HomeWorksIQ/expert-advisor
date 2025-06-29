import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useUser } from './UserContext';

// Standalone DiscoverPage component
const DiscoverPage = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subscriptionType: 'all',
    gender: 'all',
    ageRange: 'all',
    sortBy: 'popularity'
  });
  const [performers, setPerformers] = useState([]);
  const [filteredPerformers, setFilteredPerformers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const performersPerPage = 12;

  // Mock performers data
  const mockPerformers = [
    {
      id: 1,
      firstName: "Isabella",
      lastName: "Rose",
      displayName: "Isabella Rose",
      username: "@isabella_rose",
      bio: "Welcome to my exclusive world ✨ Premium content creator sharing intimate moments and lifestyle content.",
      profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9",
      coverImage: "https://images.pexels.com/photos/7533330/pexels-photo-7533330.jpeg",
      gender: "female",
      age: 25,
      isOnline: true,
      subscriptionType: "paid",
      monthlyFee: 19.99,
      isVerified: true,
      followers: 125000
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
      subscriptionType: "paid",
      monthlyFee: 24.99,
      isVerified: true,
      followers: 89000
    },
    {
      id: 7,
      firstName: "Alex",
      lastName: "Storm",
      displayName: "Alex Storm",
      username: "@alex_storm",
      bio: "Fitness enthusiast and lifestyle content creator. Join my journey to wellness! 💪",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      gender: "male",
      age: 30,
      isOnline: false,
      subscriptionType: "free",
      monthlyFee: 0,
      isVerified: true,
      followers: 67000
    },
    {
      id: 13,
      firstName: "Zara",
      lastName: "Moon",
      displayName: "Zara Moon",
      username: "@zara_moon",
      bio: "Authentic self-expression and empowerment 🌈 Sharing my journey and creating safe spaces for everyone.",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616c6c0c15b",
      coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
      gender: "trans",
      age: 25,
      isOnline: true,
      subscriptionType: "paid",
      monthlyFee: 26.99,
      isVerified: true,
      followers: 143000
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPerformers(mockPerformers);
      setFilteredPerformers(mockPerformers);
      setTotalPages(Math.ceil(mockPerformers.length / performersPerPage));
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter performers based on search term and filters
    let filtered = [...performers];
    
    // Apply search filter
    if (searchTerm.length > 0) {
      filtered = filtered.filter(performer =>
        performer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(performer =>
        filters.status === 'online' ? performer.isOnline : !performer.isOnline
      );
    }
    
    // Apply subscription type filter
    if (filters.subscriptionType !== 'all') {
      filtered = filtered.filter(performer =>
        filters.subscriptionType === 'free' 
          ? performer.subscriptionType === 'free' 
          : performer.subscriptionType === 'paid'
      );
    }
    
    // Apply gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(performer => performer.gender === filters.gender);
    }
    
    // Apply age range filter
    if (filters.ageRange !== 'all') {
      filtered = filtered.filter(performer => {
        const age = performer.age;
        switch (filters.ageRange) {
          case '18-25': return age >= 18 && age <= 25;
          case '26-35': return age >= 26 && age <= 35;
          case '36+': return age >= 36;
          default: return true;
        }
      });
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.joinedDate || 0) - new Date(a.joinedDate || 0));
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
  }, [searchTerm, filters, performers]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
                <option value="trans">Trans</option>
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
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                }, 1000);
              }}
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
                        <span className="text-sm text-gray-400">{performer.rating || 4.5}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-1">{performer.username}</p>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2 h-10">
                      {performer.bio}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{(performer.followers / 1000).toFixed(0)}K followers</span>
                      <span>{performer.posts || 100} posts</span>
                      <span>{((performer.totalLikes || performer.followers) / 1000).toFixed(0)}K likes</span>
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

export default DiscoverPage;