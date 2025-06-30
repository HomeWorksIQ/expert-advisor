import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useSearchParams } from 'react-router-dom';

// Mock expert data - in a real app this would come from the backend
const mockExperts = [
  // Medical Experts
  {
    id: 1,
    name: "Dr. Sarah Chen",
    category: "medical",
    specialty: "Family Medicine",
    location: { city: "Boston", state: "MA", zipCode: "02115" },
    experienceLevel: "expert",
    yearsOfExperience: 15,
    isOnline: true,
    rating: 4.9,
    consultationRate: 150,
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    credentials: ["MD", "Board Certified"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    category: "medical",
    specialty: "Cardiology",
    location: { city: "Houston", state: "TX", zipCode: "77002" },
    experienceLevel: "expert",
    yearsOfExperience: 20,
    isOnline: false,
    rating: 4.8,
    consultationRate: 250,
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkb2N0b3IlMjBtYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    credentials: ["MD", "FACC"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 3,
    name: "Dr. Emily Foster",
    category: "medical",
    specialty: "Pediatrics",
    location: { city: "Los Angeles", state: "CA", zipCode: "90210" },
    experienceLevel: "experienced",
    yearsOfExperience: 12,
    isOnline: true,
    rating: 4.7,
    consultationRate: 180,
    profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxkb2N0b3IlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    credentials: ["MD", "Pediatric Board Certified"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Insurance Experts
  {
    id: 4,
    name: "James Wilson",
    category: "insurance",
    specialty: "Life Insurance",
    location: { city: "Denver", state: "CO", zipCode: "80202" },
    experienceLevel: "experienced",
    yearsOfExperience: 15,
    isOnline: true,
    rating: 4.7,
    consultationRate: 100,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxpbnN1cmFuY2UlMjBtYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    credentials: ["Licensed Agent"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 5,
    name: "Lisa Anderson",
    category: "insurance",
    specialty: "Auto & Home Insurance",
    location: { city: "Phoenix", state: "AZ", zipCode: "85001" },
    experienceLevel: "expert",
    yearsOfExperience: 18,
    isOnline: true,
    rating: 4.8,
    consultationRate: 85,
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616c8da6ad6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw2fHxpbnN1cmFuY2UlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    credentials: ["Licensed Agent", "CPCU"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Business Experts
  {
    id: 6,
    name: "David Thompson",
    category: "business",
    specialty: "Strategy Consulting",
    location: { city: "Seattle", state: "WA", zipCode: "98101" },
    experienceLevel: "expert",
    yearsOfExperience: 22,
    isOnline: true,
    rating: 4.9,
    consultationRate: 200,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw2fHxidXNpbmVzcyUyMG1hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    credentials: ["MBA", "CPA"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 7,
    name: "Amanda Rodriguez",
    category: "business",
    specialty: "Marketing Strategy",
    location: { city: "Miami", state: "FL", zipCode: "33101" },
    experienceLevel: "experienced",
    yearsOfExperience: 10,
    isOnline: false,
    rating: 4.6,
    consultationRate: 175,
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw4fHxidXNpbmVzcyUyMHdvbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    credentials: ["MBA", "PMP"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Education Experts
  {
    id: 8,
    name: "Professor Robert Adams",
    category: "education",
    specialty: "Mathematics",
    location: { city: "Boston", state: "MA", zipCode: "02116" },
    experienceLevel: "expert",
    yearsOfExperience: 25,
    isOnline: true,
    rating: 4.9,
    consultationRate: 75,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw4fHx0ZWFjaGVyJTIwbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    credentials: ["PhD Mathematics"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 9,
    name: "Jennifer Kim",
    category: "education",
    specialty: "Language Learning",
    location: { city: "San Francisco", state: "CA", zipCode: "94102" },
    experienceLevel: "experienced",
    yearsOfExperience: 8,
    isOnline: true,
    rating: 4.8,
    consultationRate: 60,
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxMHx8dGVhY2hlciUyMHdvbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    credentials: ["MA Linguistics", "TESOL Certified"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 10,
    name: "Marcus Johnson",
    category: "education",
    specialty: "SAT/ACT Prep",
    location: { city: "Chicago", state: "IL", zipCode: "60601" },
    experienceLevel: "intermediate",
    yearsOfExperience: 6,
    isOnline: true,
    rating: 4.7,
    consultationRate: 55,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxMnx8dGVhY2hlciUyMG1hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    credentials: ["MS Education", "SAT Certified"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Legal Experts
  {
    id: 11,
    name: "Attorney Michelle Stone",
    category: "legal",
    specialty: "Family Law",
    location: { city: "Atlanta", state: "GA", zipCode: "30309" },
    experienceLevel: "expert",
    yearsOfExperience: 16,
    isOnline: false,
    rating: 4.8,
    consultationRate: 300,
    profileImage: "https://images.unsplash.com/photo-1594736797933-d0ff1d1e2e8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxNHx8bGF3eWVyJTIwd29tYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    credentials: ["JD", "State Bar Certified"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 12,
    name: "Richard Parker",
    category: "legal",
    specialty: "Business Law",
    location: { city: "New York", state: "NY", zipCode: "10001" },
    experienceLevel: "expert",
    yearsOfExperience: 24,
    isOnline: true,
    rating: 4.9,
    consultationRate: 450,
    profileImage: "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxNnx8bGF3eWVyJTIwbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    credentials: ["JD", "LLM", "NY Bar"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Financial Experts
  {
    id: 13,
    name: "Thomas Bradford",
    category: "financial",
    specialty: "Investment Planning",
    location: { city: "Dallas", state: "TX", zipCode: "75201" },
    experienceLevel: "expert",
    yearsOfExperience: 19,
    isOnline: true,
    rating: 4.8,
    consultationRate: 275,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxOHx8ZmluYW5jaWFsJTIwbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    credentials: ["CFP", "CFA"],
    availableFor: ["chat", "video_call", "in_person"]
  },
  {
    id: 14,
    name: "Sophia Williams",
    category: "financial",
    specialty: "Retirement Planning",
    location: { city: "Portland", state: "OR", zipCode: "97201" },
    experienceLevel: "experienced",
    yearsOfExperience: 11,
    isOnline: true,
    rating: 4.7,
    consultationRate: 225,
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyMHx8ZmluYW5jaWFsJTIwd29tYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    credentials: ["CFP", "ChFC"],
    availableFor: ["chat", "video_call", "in_person"]
  },

  // Technology Experts
  {
    id: 15,
    name: "Kevin Zhang",
    category: "technology",
    specialty: "Cybersecurity",
    location: { city: "Austin", state: "TX", zipCode: "78701" },
    experienceLevel: "expert",
    yearsOfExperience: 14,
    isOnline: true,
    rating: 4.9,
    consultationRate: 225,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyMnx8dGVjaHx8YW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    credentials: ["CISSP", "CEH"],
    availableFor: ["chat", "video_call", "in_person"]
  }
];

const categories = [
  { id: "all", name: "All Categories" },
  { id: "medical", name: "Medical & Health" },
  { id: "insurance", name: "Insurance" },
  { id: "business", name: "Business Consulting" },
  { id: "education", name: "Education & Tutoring" },
  { id: "marketing", name: "Marketing & Advertising" },
  { id: "home_services", name: "Home Services" },
  { id: "fitness", name: "Fitness & Wellness" },
  { id: "legal", name: "Legal Services" },
  { id: "technology", name: "Technology & IT" },
  { id: "real_estate", name: "Real Estate" },
  { id: "automotive", name: "Automotive" },
  { id: "pet_care", name: "Pet Care" },
  { id: "financial", name: "Financial Planning" }
];

const DiscoverPageNew = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredExperts, setFilteredExperts] = useState(mockExperts);
  const [showResults, setShowResults] = useState(false);
  
  // Search filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    location: 'all',
    zipCode: '',
    radius: '25',
    status: 'all',
    experienceLevel: 'all',
    sortBy: 'rating'
  });

  const [userLocation, setUserLocation] = useState(null);
  const [expertCount, setExpertCount] = useState(mockExperts.length);

  useEffect(() => {
    // Pre-select category if coming from categories page
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  // Calculate expert count based on filters and location
  useEffect(() => {
    calculateExpertCount();
  }, [filters, userLocation]);

  const calculateExpertCount = () => {
    let count = mockExperts.length;
    
    // Apply basic filtering for count
    if (filters.category !== 'all') {
      count = mockExperts.filter(expert => expert.category === filters.category).length;
    }
    
    // Location-based calculation
    if (filters.location === 'local' && userLocation) {
      // For local search, assume we find experts within reasonable distance
      // In a real app, this would calculate based on actual geographic distance
      count = Math.floor(count * 0.6); // Simulate local availability
    } else if (filters.location === 'custom' && filters.zipCode) {
      // For ZIP code search, simulate distance-based availability
      const radius = parseInt(filters.radius);
      if (radius <= 10) count = Math.floor(count * 0.3);
      else if (radius <= 25) count = Math.floor(count * 0.5);
      else if (radius <= 50) count = Math.floor(count * 0.7);
      else count = Math.floor(count * 0.9);
    }
    
    // Additional filter impacts
    if (filters.status === 'online') count = Math.floor(count * 0.4);
    if (filters.experienceLevel !== 'all') count = Math.floor(count * 0.7);
    
    // Ensure minimum count
    count = Math.max(count, 1);
    setExpertCount(count);
  };

  // Filter experts based on current filters
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        const params = new URLSearchParams();
        
        if (filters.category !== 'all') params.append('category', filters.category);
        if (filters.status !== 'all') params.append('status', filters.status);
        if (filters.experienceLevel !== 'all') params.append('experienceLevel', filters.experienceLevel);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.location === 'custom' && filters.zipCode) {
          params.append('zipCode', filters.zipCode);
          params.append('radius', filters.radius);
        }
        if (filters.location !== 'all') params.append('location', filters.location);
        
        const response = await fetch(`${API_BASE_URL}/api/experts/discover?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setFilteredExperts(data.experts);
        } else {
          // Fallback to mock data if API fails
          setFilteredExperts(mockExperts);
        }
      } catch (error) {
        console.error('Failed to fetch experts:', error);
        // Fallback to mock data
        setFilteredExperts(mockExperts);
      }
    };

    fetchExperts();
  }, [filters, userLocation]);

  const handleLocationDetection = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${API_BASE_URL}/api/detect-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          setUserLocation(data.location);
          setFilters(prev => ({ ...prev, location: 'local' }));
        }
      } else {
        // Fallback to mock location for demo
        const mockLocation = {
          city: "Boston",
          state: "MA",
          zipCode: "02115",
          country: "USA"
        };
        setUserLocation(mockLocation);
        setFilters(prev => ({ ...prev, location: 'local' }));
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      // Fallback to mock location for demo
      const mockLocation = {
        city: "Boston",
        state: "MA", 
        zipCode: "02115",
        country: "USA"
      };
      setUserLocation(mockLocation);
      setFilters(prev => ({ ...prev, location: 'local' }));
    }
  };

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setFilters({
      category: 'all',
      location: 'all',
      zipCode: '',
      radius: '25',
      status: 'all',
      experienceLevel: 'all',
      sortBy: 'rating'
    });
  };

  const selectedCategoryName = categories.find(cat => cat.id === filters.category)?.name || 'All Categories';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showResults ? (
          /* Search Form */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find the Perfect <span className="text-blue-600">Expert</span>
              </h1>
              <p className="text-lg text-gray-600">
                Use our advanced search to find experts that match your specific needs
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Expert Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Location Preference
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <button
                    onClick={handleLocationDetection}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      filters.location === 'local' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📍</div>
                    <div className="font-medium">My Location</div>
                    <div className="text-sm text-gray-500">Use current location</div>
                  </button>
                  
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, location: 'national' }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      filters.location === 'national' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🌎</div>
                    <div className="font-medium">National</div>
                    <div className="text-sm text-gray-500">All experts nationwide</div>
                  </button>
                  
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, location: 'custom' }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      filters.location === 'custom' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏙️</div>
                    <div className="font-medium">Specific Area</div>
                    <div className="text-sm text-gray-500">Enter zip code</div>
                  </button>
                </div>

                {filters.location === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter ZIP code"
                        value={filters.zipCode}
                        onChange={(e) => setFilters(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={filters.radius}
                        onChange={(e) => setFilters(prev => ({ ...prev, radius: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="5">Within 5 miles</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                        <option value="50">Within 50 miles</option>
                        <option value="100">Within 100 miles</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Experts</option>
                    <option value="online">Online Now</option>
                    <option value="offline">Available Later</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="intermediate">Intermediate (3-7 years)</option>
                    <option value="experienced">Experienced (8-15 years)</option>
                    <option value="expert">Expert (15+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center">
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Search Experts ({filteredExperts.length} found)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Search Results
                  </h1>
                  <p className="text-gray-600">
                    Found {filteredExperts.length} experts in {selectedCategoryName}
                    {userLocation && filters.location === 'local' && ` near ${userLocation.city}, ${userLocation.state}`}
                  </p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  New Search
                </button>
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedCategoryName}
                  </span>
                )}
                {filters.location !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {filters.location === 'local' ? 'Local Area' : 
                     filters.location === 'national' ? 'National' : 'Custom Area'}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {filters.status === 'online' ? 'Online Now' : 'Available Later'}
                  </span>
                )}
                {filters.experienceLevel !== 'all' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {filters.experienceLevel.charAt(0).toUpperCase() + filters.experienceLevel.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {filteredExperts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperts.map(expert => (
                  <div key={expert.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={expert.profileImage}
                          alt={expert.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{expert.name}</h3>
                          <p className="text-blue-600 text-sm font-medium">{expert.specialty}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600">{expert.rating}</span>
                            <div className={`w-2 h-2 rounded-full ${expert.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-xs text-gray-500">
                              {expert.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{expert.yearsOfExperience} years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium">${expert.consultationRate}/hour</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{expert.location.city}, {expert.location.state}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {expert.credentials.map((credential, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {credential}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`/profile/${expert.id}`}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-center text-sm hover:bg-gray-200 transition-colors"
                        >
                          View Profile
                        </a>
                        <a
                          href={`/chat/${expert.id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-center text-sm hover:bg-blue-700 transition-colors"
                        >
                          Chat
                        </a>
                        <a
                          href={`/book/${expert.id}`}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-center text-sm hover:bg-green-700 transition-colors"
                        >
                          Book
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or expanding your location radius.
                </p>
                <button
                  onClick={handleNewSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try New Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPageNew;