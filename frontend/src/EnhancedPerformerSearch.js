import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from './App';

const EnhancedPerformerSearch = () => {
  const { user, API } = useUser();
  
  // State for search results and parameters
  const [searchResults, setSearchResults] = useState({
    performers: [],
    pagination: { current_page: 1, total_pages: 1, total_count: 0 },
    filters_applied: {}
  });
  
  const [searchParams, setSearchParams] = useState({
    query: '',
    // Location filters
    country: '',
    state: '',
    city: '',
    radius_km: 50,
    // Demographic filters
    min_age: 18,
    max_age: 65,
    gender: [],
    sexual_preference: [],
    ethnicity: [],
    // Status filters
    online_only: false,
    verified_only: false,
    // Sort options
    sort_by: 'popularity',
    sort_order: 'desc',
    page: 1,
    limit: 20
  });
  
  const [filterOptions, setFilterOptions] = useState({
    genders: [],
    sexual_preferences: [],
    ethnicities: [],
    body_types: [],
    hair_colors: [],
    eye_colors: [],
    sort_options: []
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
    performSearch(); // Initial search
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API}/performers/filters`);
      if (response.data.success) {
        setFilterOptions(response.data.filter_options);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const performSearch = async (params = searchParams) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/performers/search`, params);
      
      if (response.data.success) {
        setSearchResults({
          performers: response.data.performers,
          pagination: response.data.pagination,
          filters_applied: response.data.filters_applied
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        performers: [],
        pagination: { current_page: 1, total_pages: 1, total_count: 0 },
        filters_applied: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    const newParams = { ...searchParams, [field]: value, page: 1 };
    setSearchParams(newParams);
    
    // Debounced search for text input
    if (field === 'query') {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => performSearch(newParams), 500);
    } else {
      performSearch(newParams);
    }
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = searchParams[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleSearchChange(field, newValues);
  };

  const handlePageChange = (page) => {
    const newParams = { ...searchParams, page };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  const clearFilters = () => {
    const defaultParams = {
      query: '',
      country: '',
      state: '',
      city: '',
      radius_km: 50,
      min_age: 18,
      max_age: 65,
      gender: [],
      sexual_preference: [],
      ethnicity: [],
      online_only: false,
      verified_only: false,
      sort_by: 'popularity',
      sort_order: 'desc',
      page: 1,
      limit: 20
    };
    setSearchParams(defaultParams);
    performSearch(defaultParams);
  };

  const formatLocation = (performer) => {
    return performer.display_location || 'Location not specified';
  };

  const formatGender = (gender) => {
    return gender.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSexualPreference = (preference) => {
    return preference.charAt(0).toUpperCase() + preference.slice(1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Find Performers
          </h1>
          <p className="text-gray-400 mt-2">Discover amazing performers in your area and beyond</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filters */}
        <div className="mb-8">
          
          {/* Main Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => handleSearchChange('query', e.target.value)}
                placeholder="Search by name, bio, or specialties..."
                className="w-full p-4 pl-12 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => handleSearchChange('online_only', !searchParams.online_only)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                searchParams.online_only
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              🟢 Online Only
            </button>
            
            <button
              onClick={() => handleSearchChange('verified_only', !searchParams.verified_only)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                searchParams.verified_only
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              ✓ Verified Only
            </button>

            <select
              value={searchParams.sort_by}
              onChange={(e) => handleSearchChange('sort_by', e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="last_active">Recently Active</option>
              <option value="alphabetical">A-Z</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 transition-colors"
            >
              🔧 Advanced Filters
            </button>

            {(Object.values(searchResults.filters_applied).some(Boolean) || searchParams.query) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Location Filters */}
                <div>
                  <h4 className="font-medium mb-3 text-pink-400">📍 Location</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={searchParams.country}
                      onChange={(e) => handleSearchChange('country', e.target.value)}
                      placeholder="Country"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      value={searchParams.state}
                      onChange={(e) => handleSearchChange('state', e.target.value)}
                      placeholder="State/Province"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      value={searchParams.city}
                      onChange={(e) => handleSearchChange('city', e.target.value)}
                      placeholder="City"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <h4 className="font-medium mb-3 text-purple-400">👤 Demographics</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Age Range</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={searchParams.min_age}
                          onChange={(e) => handleSearchChange('min_age', parseInt(e.target.value))}
                          min="18"
                          max="99"
                          className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={searchParams.max_age}
                          onChange={(e) => handleSearchChange('max_age', parseInt(e.target.value))}
                          min="18"
                          max="99"
                          className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Gender</label>
                      <div className="space-y-1">
                        {filterOptions.genders.map(gender => (
                          <label key={gender} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={searchParams.gender.includes(gender)}
                              onChange={() => handleMultiSelectChange('gender', gender)}
                              className="text-pink-500"
                            />
                            <span className="text-sm">{formatGender(gender)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="font-medium mb-3 text-yellow-400">💖 Preferences</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Sexual Preference</label>
                      <div className="space-y-1">
                        {filterOptions.sexual_preferences.map(pref => (
                          <label key={pref} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={searchParams.sexual_preference.includes(pref)}
                              onChange={() => handleMultiSelectChange('sexual_preference', pref)}
                              className="text-pink-500"
                            />
                            <span className="text-sm">{formatSexualPreference(pref)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Ethnicity</label>
                      <div className="space-y-1">
                        {filterOptions.ethnicities.map(ethnicity => (
                          <label key={ethnicity} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={searchParams.ethnicity.includes(ethnicity)}
                              onChange={() => handleMultiSelectChange('ethnicity', ethnicity)}
                              className="text-pink-500"
                            />
                            <span className="text-sm">{formatGender(ethnicity)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Search Results
                {searchResults.pagination.total_count > 0 && (
                  <span className="text-gray-400 ml-2">
                    ({searchResults.pagination.total_count} performers found)
                  </span>
                )}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.performers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No performers found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-2 rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Performer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {searchResults.performers.map(performer => (
                  <div key={performer.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                    
                    {/* Profile Image */}
                    <div className="relative h-48 bg-gray-700">
                      {performer.profile_image ? (
                        <img 
                          src={performer.profile_image} 
                          alt={performer.stage_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          👤
                        </div>
                      )}
                      
                      {/* Online Status */}
                      {performer.is_online && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          🟢 Online
                        </div>
                      )}

                      {/* Verified Badge */}
                      {performer.is_verified && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    {/* Performer Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{performer.stage_name}</h3>
                      
                      {/* Location */}
                      <p className="text-sm text-gray-400 mb-2">
                        📍 {formatLocation(performer)}
                      </p>

                      {/* Demographics */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {performer.age} years
                        </span>
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {formatGender(performer.gender)}
                        </span>
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {formatSexualPreference(performer.sexual_preference)}
                        </span>
                        {performer.ethnicity && (
                          <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                            {formatGender(performer.ethnicity)}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                        <span>👁️ {performer.total_views} views</span>
                        <span>⭐ {performer.average_rating.toFixed(1)} ({performer.rating_count})</span>
                      </div>

                      {/* Bio */}
                      {performer.bio && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {performer.bio}
                        </p>
                      )}

                      {/* Action Button */}
                      <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {searchResults.pagination.total_pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(searchResults.pagination.current_page - 1)}
                    disabled={!searchResults.pagination.has_prev}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, searchResults.pagination.total_pages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            page === searchResults.pagination.current_page
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                              : 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(searchResults.pagination.current_page + 1)}
                    disabled={!searchResults.pagination.has_next}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPerformerSearch;