import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from './UserContext';
import { Header } from './components';
import TrialStatusComponent from './TrialStatusComponent';

// Enhanced Discover Page with Advanced Features
export const DiscoverPage = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    consultationType: 'all',
    sortBy: 'rating',
    expertiseCategory: 'all',
    experienceLevel: 'all'
  });
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const expertsPerPage = 12;

  // Professional expert dataset
  const mockExperts = [
    // LEGAL EXPERTS
    {
      id: 1, firstName: "Dr. Sarah", lastName: "Chen", displayName: "Dr. Sarah Chen", username: "@sarah_chen_law",
      bio: "Senior Corporate Attorney with 15+ years experience. Harvard Law graduate specializing in M&A and business compliance.",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2", 
      coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
      expertiseCategory: "legal", experienceLevel: "expert", age: 42, isOnline: true, totalConsultations: 1247, 
      totalClients: 389, rating: 4.9, consultationFee: 350.0, isVerified: true, joinedDate: "2020-03-15", 
      yearsExperience: 15, credentials: ["J.D. Harvard Law School", "NY State Bar", "American Bar Association"],
      specializations: ["Corporate Law", "Mergers & Acquisitions", "Contract Negotiation"], ethnicity: "asian"
    },
    {
      id: 2, firstName: "Marcus", lastName: "Williams", displayName: "Marcus Williams", username: "@marcus_williams_law",
      bio: "Compassionate family law attorney with expertise in divorce, child custody, and family mediation.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", 
      coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
      expertiseCategory: "legal", experienceLevel: "experienced", age: 38, isOnline: true, totalConsultations: 892, 
      totalClients: 267, rating: 4.8, consultationFee: 275.0, isVerified: true, joinedDate: "2019-08-22", 
      yearsExperience: 14, credentials: ["J.D. UCLA School of Law", "CA State Bar", "Certified Family Mediator"],
      specializations: ["Family Law", "Divorce Proceedings", "Child Custody"], ethnicity: "black"
    },

    // MEDICAL EXPERTS
    {
      id: 3, firstName: "Dr. Priya", lastName: "Patel", displayName: "Dr. Priya Patel", username: "@dr_priya_patel",
      bio: "Board-Certified Internal Medicine Physician committed to providing personalized healthcare guidance.",
      profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54", 
      coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
      expertiseCategory: "medical", experienceLevel: "expert", age: 35, isOnline: true, totalConsultations: 1456, 
      totalClients: 623, rating: 4.9, consultationFee: 200.0, isVerified: true, joinedDate: "2018-09-03", 
      yearsExperience: 11, credentials: ["M.D. Johns Hopkins", "Board Certified Internal Medicine"],
      specializations: ["Internal Medicine", "Preventive Care", "Chronic Disease Management"], ethnicity: "asian"
    },

    // FINANCIAL EXPERTS
    {
      id: 4, firstName: "Jennifer", lastName: "Thompson", displayName: "Jennifer Thompson", username: "@jennifer_cfp",
      bio: "Certified Financial Planner helping individuals and families achieve their financial goals through comprehensive planning.",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956", 
      coverImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
      expertiseCategory: "financial", experienceLevel: "expert", age: 40, isOnline: false, totalConsultations: 734, 
      totalClients: 298, rating: 4.8, consultationFee: 250.0, isVerified: true, joinedDate: "2019-01-15", 
      yearsExperience: 12, credentials: ["CFP Certification", "Series 7 License", "Series 66 License"],
      specializations: ["Financial Planning", "Investment Strategy", "Retirement Planning"], ethnicity: "white"
    },

    // ACCOUNTING EXPERTS
    {
      id: 5, firstName: "David", lastName: "Kim", displayName: "David Kim", username: "@david_kim_cpa",
      bio: "CPA & Tax Specialist with expertise in individual and business tax preparation, financial analysis.",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", 
      coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
      expertiseCategory: "accounting", experienceLevel: "expert", age: 44, isOnline: true, totalConsultations: 1123, 
      totalClients: 456, rating: 4.9, consultationFee: 175.0, isVerified: true, joinedDate: "2017-11-08", 
      yearsExperience: 20, credentials: ["CPA License", "Enrolled Agent (EA)", "QuickBooks ProAdvisor"],
      specializations: ["Tax Preparation", "Business Accounting", "Financial Analysis"], ethnicity: "asian"
    },

    // BUSINESS EXPERTS
    {
      id: 6, firstName: "Amara", lastName: "Johnson", displayName: "Amara Johnson", username: "@amara_biz_consultant",
      bio: "Former Fortune 500 executive turned business consultant. MBA from Wharton specializing in strategic planning.",
      profileImage: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f", 
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      expertiseCategory: "business", experienceLevel: "expert", age: 39, isOnline: true, totalConsultations: 567, 
      totalClients: 189, rating: 4.9, consultationFee: 300.0, isVerified: true, joinedDate: "2018-05-20", 
      yearsExperience: 15, credentials: ["MBA Wharton", "PMP Certification", "Six Sigma Black Belt"],
      specializations: ["Strategic Planning", "Operations Management", "Startup Advisory"], ethnicity: "black"
    }
  ];

  const mockPerformers = [
    {
      id: 8, firstName: "Alex", lastName: "Storm", displayName: "Alex Storm", username: "@alex_storm",
      bio: "Fitness coach and lifestyle influencer 💪 Workout routines, nutrition tips, and motivation!",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", 
      coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
      gender: "male", age: 27, isOnline: true, followers: 91000, posts: 203, subscribers: 8700, rating: 4.7,
      subscriptionType: "paid", monthlyFee: 22.99, isVerified: true, joinedDate: "2023-02-18", 
      totalLikes: 267000, totalMedia: 578, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 62.99, discount: 8 }, { months: 6, price: 119.99, discount: 13 }, { months: 12, price: 219.99, discount: 20 }]
    },
    {
      id: 9, firstName: "Dylan", lastName: "Phoenix", displayName: "Dylan Phoenix", username: "@dylan_phoenix",
      bio: "Musician and songwriter 🎸 Original music, studio sessions, and intimate acoustic performances.",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", 
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
      gender: "male", age: 24, isOnline: false, followers: 134000, posts: 167, subscribers: 12300, rating: 4.8,
      subscriptionType: "paid", monthlyFee: 16.99, isVerified: true, joinedDate: "2023-04-07", 
      totalLikes: 378000, totalMedia: 445, lastSeen: "2024-01-20T22:15:00Z",
      bundles: [{ months: 3, price: 45.99, discount: 10 }, { months: 6, price: 84.99, discount: 17 }, { months: 12, price: 159.99, discount: 22 }]
    },
    {
      id: 10, firstName: "Jake", lastName: "Rivers", displayName: "Jake Rivers", username: "@jake_rivers",
      bio: "Adventure seeker and travel vlogger 🌍 Sharing my journeys and outdoor experiences worldwide!",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", 
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      gender: "male", age: 32, isOnline: true, followers: 187000, posts: 289, subscribers: 16800, rating: 4.9,
      subscriptionType: "paid", monthlyFee: 28.99, isVerified: true, joinedDate: "2022-10-12", 
      totalLikes: 567000, totalMedia: 823, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 79.99, discount: 8 }, { months: 6, price: 149.99, discount: 14 }, { months: 12, price: 279.99, discount: 20 }]
    },
    {
      id: 11, firstName: "Ryan", lastName: "Blake", displayName: "Ryan Blake", username: "@ryan_blake",
      bio: "Tech entrepreneur and lifestyle content 💻 Behind-the-scenes of startup life and tech reviews.",
      profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7", 
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      gender: "male", age: 28, isOnline: false, followers: 78000, posts: 134, subscribers: 7200, rating: 4.5,
      subscriptionType: "paid", monthlyFee: 19.99, isVerified: false, joinedDate: "2023-07-30", 
      totalLikes: 156000, totalMedia: 367, lastSeen: "2024-01-21T14:20:00Z",
      bundles: [{ months: 3, price: 54.99, discount: 8 }, { months: 6, price: 99.99, discount: 17 }, { months: 12, price: 179.99, discount: 25 }]
    },
    {
      id: 12, firstName: "Ethan", lastName: "Cross", displayName: "Ethan Cross", username: "@ethan_cross",
      bio: "Personal trainer and wellness coach 🏋️ Workout routines, nutrition tips, and motivation!",
      profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce", 
      coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
      gender: "male", age: 26, isOnline: true, followers: 112000, posts: 223, subscribers: 9800, rating: 4.7,
      subscriptionType: "paid", monthlyFee: 21.99, isVerified: true, joinedDate: "2023-01-28", 
      totalLikes: 298000, totalMedia: 612, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 59.99, discount: 9 }, { months: 6, price: 109.99, discount: 17 }, { months: 12, price: 199.99, discount: 24 }]
    },

    // TRANS PERFORMERS (6 total)
    {
      id: 13, firstName: "Zara", lastName: "Moon", displayName: "Zara Moon", username: "@zara_moon",
      bio: "Authentic self-expression and empowerment 🌈 Sharing my journey and creating safe spaces for everyone.",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616c6c0c15b", 
      coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
      gender: "trans", age: 25, isOnline: true, followers: 143000, posts: 198, subscribers: 11900, rating: 4.9,
      subscriptionType: "paid", monthlyFee: 26.99, isVerified: true, joinedDate: "2022-12-05", 
      totalLikes: 423000, totalMedia: 567, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 72.99, discount: 10 }, { months: 6, price: 134.99, discount: 17 }, { months: 12, price: 249.99, discount: 23 }]
    },
    {
      id: 14, firstName: "River", lastName: "Sky", displayName: "River Sky", username: "@river_sky",
      bio: "Artist and creative soul 🎨 Exploring identity through art, fashion, and self-discovery.",
      profileImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6", 
      coverImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
      gender: "trans", age: 23, isOnline: false, followers: 87000, posts: 156, subscribers: 7800, rating: 4.8,
      subscriptionType: "paid", monthlyFee: 20.99, isVerified: true, joinedDate: "2023-03-17", 
      totalLikes: 234000, totalMedia: 445, lastSeen: "2024-01-20T16:45:00Z",
      bundles: [{ months: 3, price: 56.99, discount: 9 }, { months: 6, price: 104.99, discount: 16 }, { months: 12, price: 189.99, discount: 24 }]
    },
    {
      id: 15, firstName: "Phoenix", lastName: "Vale", displayName: "Phoenix Vale", username: "@phoenix_vale",
      bio: "Drag performer and entertainer ✨ Glamour, performances, and behind-the-scenes magic!",
      profileImage: "https://images.unsplash.com/photo-1463453091185-61582044d556", 
      coverImage: "https://images.unsplash.com/photo-1471436968665-2dd5ad2f1e82",
      gender: "trans", age: 27, isOnline: true, followers: 176000, posts: 267, subscribers: 14500, rating: 4.9,
      subscriptionType: "paid", monthlyFee: 31.99, isVerified: true, joinedDate: "2022-09-14", 
      totalLikes: 612000, totalMedia: 789, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 86.99, discount: 9 }, { months: 6, price: 159.99, discount: 17 }, { months: 12, price: 289.99, discount: 24 }]
    },
    {
      id: 16, firstName: "Casey", lastName: "Nova", displayName: "Casey Nova", username: "@casey_nova",
      bio: "Fashion influencer and style icon 👗 Breaking boundaries with fashion and self-expression.",
      profileImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453", 
      coverImage: "https://images.unsplash.com/photo-1445205170230-053b83016050",
      gender: "trans", age: 30, isOnline: false, followers: 198000, posts: 342, subscribers: 17200, rating: 4.8,
      subscriptionType: "paid", monthlyFee: 29.99, isVerified: true, joinedDate: "2022-11-22", 
      totalLikes: 567000, totalMedia: 923, lastSeen: "2024-01-21T11:30:00Z",
      bundles: [{ months: 3, price: 81.99, discount: 8 }, { months: 6, price: 149.99, discount: 17 }, { months: 12, price: 269.99, discount: 25 }]
    },
    {
      id: 17, firstName: "Jamie", lastName: "Star", displayName: "Jamie Star", username: "@jamie_star",
      bio: "Activist and content creator 🏳️‍⚧️ Advocating for trans rights while sharing life's beautiful moments.",
      profileImage: "https://images.unsplash.com/photo-1491349174775-aaafddd81942", 
      coverImage: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6",
      gender: "trans", age: 24, isOnline: true, followers: 76000, posts: 134, subscribers: 6500, rating: 4.7,
      subscriptionType: "paid", monthlyFee: 18.99, isVerified: false, joinedDate: "2023-05-08", 
      totalLikes: 189000, totalMedia: 387, lastSeen: new Date().toISOString(),
      bundles: [{ months: 3, price: 51.99, discount: 8 }, { months: 6, price: 94.99, discount: 17 }, { months: 12, price: 169.99, discount: 25 }]
    },
    {
      id: 18, firstName: "Alex", lastName: "Dawn", displayName: "Alex Dawn", username: "@alex_dawn",
      bio: "Photographer and visual storyteller 📸 Capturing authentic moments and celebrating diversity.",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2", 
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      gender: "trans", age: 28, isOnline: false, followers: 129000, posts: 201, subscribers: 10200, rating: 4.8,
      subscriptionType: "paid", monthlyFee: 24.99, isVerified: true, joinedDate: "2022-12-30", 
      totalLikes: 345000, totalMedia: 634, lastSeen: "2024-01-20T20:15:00Z",
      bundles: [{ months: 3, price: 67.99, discount: 9 }, { months: 6, price: 124.99, discount: 17 }, { months: 12, price: 224.99, discount: 25 }]
    }
  ];

  // Debounce utility function
  function debounce(func, delay) {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Filter and search logic
  // Initialize state with expert data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API loading
    setTimeout(() => {
      setExperts(mockExperts);
      applyFilters(mockExperts, searchTerm, filters);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    applyFilters(experts, searchTerm, filters);
  }, [searchTerm, filters, experts]);

  const applyFilters = (allPerformers, search, currentFilters) => {
    let filtered = [...allPerformers];

    // Apply search filter
    if (search.length > 0) {
      filtered = filtered.filter(performer =>
        performer.displayName.toLowerCase().includes(search.toLowerCase()) ||
        performer.username.toLowerCase().includes(search.toLowerCase()) ||
        performer.bio.toLowerCase().includes(search.toLowerCase())
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

    setFilteredExperts(filtered);
    setTotalPages(Math.ceil(filtered.length / expertsPerPage));
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const refreshSuggestions = () => {
    setIsLoading(true);
    setTimeout(() => {
      const shuffled = [...mockExperts].sort(() => 0.5 - Math.random());
      setExperts(shuffled);
      applyFilters(shuffled, searchTerm, filters);
      setIsLoading(false);
    }, 800);
  };

  const getCurrentPageExperts = () => {
    const startIndex = (currentPage - 1) * expertsPerPage;
    const endIndex = startIndex + expertsPerPage;
    return filteredExperts.slice(startIndex, endIndex);
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
            Find your favorite content creators and explore exclusive content from diverse performers
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

            {/* Gender Filter - NOW WITH TRANS OPTION */}
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
              {filteredExperts.length} experts found
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
        ) : filteredExperts.length === 0 ? (
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
              {getCurrentPageExperts().map(expert => (
                <div key={expert.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                  <div className="relative">
                    <img 
                      src={expert.coverImage} 
                      alt={expert.displayName}
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

                    {/* Gender Badge */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
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