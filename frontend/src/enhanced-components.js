import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from './UserContext';
import { Header } from './components';
import TrialStatusComponent from './TrialStatusComponent';

// Client Dashboard Component
export const MemberDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Welcome back,</span>
            <span className="font-semibold">{user?.firstName || 'Client'}</span>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="mb-8 border-b border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Consultations
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'experts'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Experts
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Payments
            </button>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <p className="text-gray-400 mb-6">
                Welcome to your client dashboard. Here you can manage your consultations, 
                messages, and payments with professional experts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-blue-400 text-lg font-semibold mb-2">Upcoming Consultations</div>
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-gray-400">No upcoming consultations</div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-blue-400 text-lg font-semibold mb-2">Unread Messages</div>
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-gray-400">No unread messages</div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-blue-400 text-lg font-semibold mb-2">Expert Connections</div>
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-gray-400">No expert connections yet</div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-4">Ready to get expert advice?</h3>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Browse our network of verified professionals and book your first consultation today.
                </p>
                <a 
                  href="/discover" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find an Expert
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Consultations</h2>
              <p className="text-gray-400 mb-6">
                View and manage your scheduled consultations with experts.
              </p>
              
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">No consultations yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't booked any consultations yet. Browse our experts and schedule your first consultation.
                </p>
                <a 
                  href="/discover" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find an Expert
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'experts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Experts</h2>
              <p className="text-gray-400 mb-6">
                View and manage your connections with professional experts.
              </p>
              
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">No expert connections yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't connected with any experts yet. Browse our experts and start building your professional network.
                </p>
                <a 
                  href="/discover" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find an Expert
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <p className="text-gray-400 mb-6">
                View and manage your messages with experts.
              </p>
              
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't exchanged any messages yet. Connect with an expert to start a conversation.
                </p>
                <a 
                  href="/discover" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find an Expert
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payments</h2>
              <p className="text-gray-400 mb-6">
                View and manage your payment history and billing information.
              </p>
              
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-semibold mb-2">No payment history</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't made any payments yet. Book a consultation to get started.
                </p>
                <a 
                  href="/discover" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find an Expert
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Discover Page with Advanced Features - Professional Expert Platform
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
  const [locationInfo, setLocationInfo] = useState('');
  const expertsPerPage = 12;

  // Check URL parameters for location-based filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location');
    const category = urlParams.get('category');
    const city = urlParams.get('city');
    const state = urlParams.get('state');
    const zip = urlParams.get('zip');
    const radius = urlParams.get('radius');

    // Set location info based on URL parameters
    if (location === 'radius' && zip && radius) {
      setLocationInfo(`Experts within ${radius} miles of ${zip}`);
    } else if (location === 'radius' && city && radius) {
      setLocationInfo(`Experts within ${radius} miles of ${city}`);
    } else if (city && state) {
      setLocationInfo(`Experts in ${city}, ${state}`);
    } else if (location === 'national') {
      setLocationInfo('National experts');
    } else if (category) {
      setLocationInfo(`${category.charAt(0).toUpperCase() + category.slice(1)} experts`);
    }

    // Apply category filter if specified
    if (category) {
      setFilters(prev => ({ ...prev, expertiseCategory: category }));
    }
  }, []);

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

  const applyFilters = (allExperts, search, currentFilters) => {
    let filtered = [...allExperts];

    // Apply search filter
    if (search.length > 0) {
      filtered = filtered.filter(expert =>
        expert.displayName.toLowerCase().includes(search.toLowerCase()) ||
        expert.username.toLowerCase().includes(search.toLowerCase()) ||
        expert.bio.toLowerCase().includes(search.toLowerCase()) ||
        expert.specializations.some(spec => spec.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply status filter
    if (currentFilters.status === 'online') {
      filtered = filtered.filter(expert => expert.isOnline);
    }

    // Apply expertise category filter
    if (currentFilters.expertiseCategory !== 'all') {
      filtered = filtered.filter(expert => expert.expertiseCategory === currentFilters.expertiseCategory);
    }

    // Apply experience level filter
    if (currentFilters.experienceLevel !== 'all') {
      filtered = filtered.filter(expert => expert.experienceLevel === currentFilters.experienceLevel);
    }

    // Apply sorting
    switch (currentFilters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'consultationFee':
        filtered.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
        break;
      default:
        filtered.sort((a, b) => b.totalConsultations - a.totalConsultations);
        break;
    }

    setFilteredExperts(filtered);
    setTotalPages(Math.ceil(filtered.length / expertsPerPage));
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      {/* Trial Status Component */}
      {user && <TrialStatusComponent />}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-4">
            Discover Professional Experts
          </h1>
          {locationInfo && (
            <p className="text-lg text-green-400 font-medium mb-2">{locationInfo}</p>
          )}
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with certified professionals across legal, medical, financial, and business expertise. 
            Get expert guidance from qualified advisors you can trust.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search experts by name, specialization, or credentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-lg"
            />
            <div className="absolute left-4 top-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Experts</option>
                <option value="online">Available Now</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expertise Category</label>
              <select
                value={filters.expertiseCategory}
                onChange={(e) => handleFilterChange('expertiseCategory', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="legal">Legal</option>
                <option value="medical">Medical</option>
                <option value="financial">Financial</option>
                <option value="accounting">Accounting</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="experienced">Experienced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="consultationFee">Lowest Fee</option>
                <option value="experience">Most Experience</option>
                <option value="newest">Recently Joined</option>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No experts found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or browse all experts
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  status: 'all',
                  consultationType: 'all',
                  sortBy: 'rating',
                  expertiseCategory: 'all',
                  experienceLevel: 'all'
                });
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear Filters
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
                    
                    {/* Online Status */}
                    {expert.isOnline && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Available Now
                      </div>
                    )}

                    {/* Verification Badge */}
                    {expert.isVerified && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Profile Image */}
                    <div className="flex items-start space-x-3 mb-3">
                      <img 
                        src={expert.profileImage} 
                        alt={expert.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{expert.displayName}</h3>
                        <p className="text-sm text-gray-400 truncate">{expert.username}</p>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                          {expert.expertiseCategory}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                          {expert.experienceLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{expert.bio}</p>
                    </div>

                    {/* Credentials */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Key Credentials:</div>
                      <div className="flex flex-wrap gap-1">
                        {expert.credentials.slice(0, 2).map((credential, idx) => (
                          <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {credential}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{expert.rating}</span>
                      </div>
                      <div>{expert.totalConsultations} consultations</div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-white">${expert.consultationFee}/hr</span>
                      <span className="text-sm text-gray-400">{expert.yearsExperience}+ yrs exp</span>
                    </div>

                    {/* Action Button */}
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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