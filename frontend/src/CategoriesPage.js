import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useSearchParams } from 'react-router-dom';

const categories = [
  { id: "medical", name: "Medical & Health", icon: "🏥", count: 3, description: "Doctors, therapists, and health professionals", demand: "high" },
  { id: "insurance", name: "Insurance", icon: "🛡️", count: 2, description: "Life insurance agents and protection specialists", demand: "medium" },
  { id: "business", name: "Business Consulting", icon: "💼", count: 2, description: "Strategy consultants and business advisors", demand: "high" },
  { id: "education", name: "Education & Tutoring", icon: "📚", count: 3, description: "Teachers, tutors, and academic coaches", demand: "medium" },
  { id: "marketing", name: "Marketing & Advertising", icon: "📱", count: 2, description: "Digital marketers and brand strategists", demand: "medium" },
  { id: "home_services", name: "Home Services", icon: "🔧", count: 1, description: "Contractors, handymen, and home repair", demand: "low" },
  { id: "fitness", name: "Fitness & Wellness", icon: "💪", count: 1, description: "Personal trainers and wellness coaches", demand: "low" },
  { id: "legal", name: "Legal Services", icon: "⚖️", count: 1, description: "Attorneys and legal advisors", demand: "high" },
  { id: "technology", name: "Technology & IT", icon: "💻", count: 1, description: "IT support and tech consultants", demand: "high" },
  { id: "real_estate", name: "Real Estate", icon: "🏠", count: 1, description: "Real estate agents and property advisors", demand: "medium" },
  { id: "automotive", name: "Automotive", icon: "🚗", count: 1, description: "Auto mechanics and car experts", demand: "low" },
  { id: "pet_care", name: "Pet Care", icon: "🐕", count: 1, description: "Veterinarians and pet specialists", demand: "low" },
  { id: "financial", name: "Financial Planning", icon: "💰", count: 1, description: "Financial planners and investment advisors", demand: "high" }
];

const CategoriesPage = () => {
  const [searchParams] = useSearchParams();
  const [locationInfo, setLocationInfo] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical'); // 'alphabetical' or 'demand'

  useEffect(() => {
    const location = searchParams.get('location');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const zip = searchParams.get('zip');
    const radius = searchParams.get('radius');

    if (location === 'national') {
      setLocationInfo('National experts');
    } else if (location === 'radius') {
      if (zip && radius) {
        setLocationInfo(`Local experts within ${radius} miles of ${zip}`);
      } else if (city && radius) {
        setLocationInfo(`Local experts within ${radius} miles of ${city}`);
      } else {
        setLocationInfo('Local experts in specified area');
      }
    } else if (city && state && zip) {
      // Show both city and zip when both are available (from geo IP)
      setLocationInfo(`Local experts in ${city}, ${state} (${zip})`);
    } else if (city && state) {
      setLocationInfo(`Local experts in ${city}, ${state}`);
    } else if (location === 'local') {
      setLocationInfo('Local experts in your area');
    } else {
      setLocationInfo('All experts');
    }
  }, [searchParams]);

  // Sort categories based on selected option
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'demand') {
      const demandOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return demandOrder[b.demand] - demandOrder[a.demand];
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Choose Your <span className="text-green-600">Expert Category</span>
          </h1>
          <p className="text-lg text-green-600 font-medium mb-4">{locationInfo}</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the type of professional you need. All experts pay for visibility to better serve you.
          </p>
        </div>

        {/* Location Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-blue-600">📍</span>
            <span className="text-blue-800 font-medium">{locationInfo}</span>
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm underline ml-4"
            >
              Change location
            </a>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            Showing {sortedCategories.length} categories
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="demand">High Demand</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedCategories.map(category => (
            <a
              key={category.id}
              href={`/discover?category=${category.id}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`}
              className="bg-white rounded-lg border border-gray-200 p-2 hover:shadow-lg transition-all group hover:border-green-300"
            >
              <div className="text-center">
                <div className="text-xl mb-1">{category.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-xs mb-1">{category.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {category.count} expert{category.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 text-green-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View experts →
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Search */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Or search directly for what you need
          </h3>
          <div className="flex gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Search by specialty, name, or service..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
            <button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-2 rounded-lg transition-all">
              Search
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need help choosing?
          </h2>
          <p className="text-white mb-6 opacity-90">
            Not sure which category fits your needs? Browse all experts or contact our support team.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href={`/discover?${searchParams.toString()}`}
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Browse All Experts
            </a>
            <a
              href="/help"
              className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;