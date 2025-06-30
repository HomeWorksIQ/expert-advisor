import React, { useState, useEffect } from 'react';
import { Header } from './components';

const DiscoverPage = () => {
  const [performers, setPerformers] = useState([]);
  const [filteredPerformers, setFilteredPerformers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    status: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock performers data with gender diversity
  const mockPerformers = [
    // FEMALE PERFORMERS
    {
      id: 1, displayName: "Isabella Rose", username: "@isabella_rose",
      bio: "Welcome to my exclusive world ✨",
      profileImage: "https://images.unsplash.com/photo-1701286618296-b40443dc63a9", 
      gender: "female", isOnline: true
    },
    {
      id: 2, displayName: "Sophia Dreams", username: "@sophia_dreams",
      bio: "Your favorite girl next door 💕",
      profileImage: "https://images.unsplash.com/photo-1701286842710-5f37edc4b8b4", 
      gender: "female", isOnline: false
    },
    {
      id: 3, displayName: "Luna Nights", username: "@luna_nights",
      bio: "Late night adventures 🌙",
      profileImage: "https://images.pexels.com/photos/1983035/pexels-photo-1983035.jpeg", 
      gender: "female", isOnline: true
    },
    {
      id: 4, displayName: "Maya Divine", username: "@maya_divine",
      bio: "Spiritual content and meditation ✨",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2", 
      gender: "female", isOnline: true
    },
    {
      id: 5, displayName: "Aria Star", username: "@aria_star",
      bio: "Pop culture enthusiast and gaming streamer 🎮",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80", 
      gender: "female", isOnline: false
    },
    {
      id: 6, displayName: "Victoria Grace", username: "@victoria_grace",
      bio: "Fashion model and lifestyle creator 👗",
      profileImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb", 
      gender: "female", isOnline: true
    },

    // MALE PERFORMERS
    {
      id: 7, displayName: "Alex Storm", username: "@alex_storm",
      bio: "Fitness enthusiast and lifestyle content creator 💪",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", 
      gender: "male", isOnline: false
    },
    {
      id: 8, displayName: "Marcus King", username: "@marcus_king",
      bio: "Chef and culinary artist 👨‍🍳",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", 
      gender: "male", isOnline: true
    },
    {
      id: 9, displayName: "Dylan Phoenix", username: "@dylan_phoenix",
      bio: "Musician and songwriter 🎸",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", 
      gender: "male", isOnline: false
    },
    {
      id: 10, displayName: "Jake Rivers", username: "@jake_rivers",
      bio: "Adventure seeker and travel vlogger 🌍",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", 
      gender: "male", isOnline: true
    },
    {
      id: 11, displayName: "Ryan Blake", username: "@ryan_blake",
      bio: "Tech entrepreneur and lifestyle content 💻",
      profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7", 
      gender: "male", isOnline: false
    },
    {
      id: 12, displayName: "Ethan Cross", username: "@ethan_cross",
      bio: "Personal trainer and wellness coach 🏋️",
      profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce", 
      gender: "male", isOnline: true
    },

    // TRANS PERFORMERS
    {
      id: 13, displayName: "Zara Moon", username: "@zara_moon",
      bio: "Authentic self-expression and empowerment 🌈",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616c6c0c15b", 
      gender: "trans", isOnline: true
    },
    {
      id: 14, displayName: "River Sky", username: "@river_sky",
      bio: "Artist and creative soul 🎨",
      profileImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6", 
      gender: "trans", isOnline: false
    },
    {
      id: 15, displayName: "Phoenix Vale", username: "@phoenix_vale",
      bio: "Drag performer and entertainer ✨",
      profileImage: "https://images.unsplash.com/photo-1463453091185-61582044d556", 
      gender: "trans", isOnline: true
    },
    {
      id: 16, displayName: "Casey Nova", username: "@casey_nova",
      bio: "Fashion influencer and style icon 👗",
      profileImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453", 
      gender: "trans", isOnline: false
    },
    {
      id: 17, displayName: "Jamie Star", username: "@jamie_star",
      bio: "Activist and content creator 🏳️‍⚧️",
      profileImage: "https://images.unsplash.com/photo-1491349174775-aaafddd81942", 
      gender: "trans", isOnline: true
    },
    {
      id: 18, displayName: "Alex Dawn", username: "@alex_dawn",
      bio: "Photographer and visual storyteller 📸",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2", 
      gender: "trans", isOnline: false
    }
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setPerformers(mockPerformers);
      setFilteredPerformers(mockPerformers);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...performers];

    // Apply search filter
    if (searchTerm.length > 0) {
      filtered = filtered.filter(performer =>
        performer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(performer => performer.gender === filters.gender);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(performer =>
        filters.status === 'online' ? performer.isOnline : !performer.isOnline
      );
    }

    setFilteredPerformers(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
          <div className="grid md:grid-cols-2 gap-4">
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

            {/* Gender Filter - WITH TRANS OPTION */}
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
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              {filteredPerformers.length} creators found
            </div>
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
            <h3 className="text-xl font-semibold mb-2">No experts found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  gender: 'all',
                  status: 'all'
                });
              }}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPerformers.map(performer => (
              <div key={performer.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src={performer.profileImage} 
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

                  {/* Gender Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      performer.gender === 'female' ? 'bg-pink-500 text-white' :
                      performer.gender === 'male' ? 'bg-blue-500 text-white' :
                      'bg-rainbow bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white'
                    }`}>
                      {performer.gender === 'female' ? '♀️' : performer.gender === 'male' ? '♂️' : '🏳️‍⚧️'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {performer.displayName}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">{performer.username}</p>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2 h-10">
                    {performer.bio}
                  </p>
                  
                  <a 
                    href={`/profile/${performer.id}`}
                    className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium block text-center"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;