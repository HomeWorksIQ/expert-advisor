import React, { useState } from 'react';
import { Header } from './components';

const categories = [
  { id: "medical", name: "Medical & Health", icon: "🏥", count: 3, description: "Doctors, therapists, and health professionals" },
  { id: "insurance", name: "Insurance", icon: "🛡️", count: 2, description: "Life insurance agents and protection specialists" },
  { id: "business", name: "Business Consulting", icon: "💼", count: 2, description: "Strategy consultants and business advisors" },
  { id: "education", name: "Education & Tutoring", icon: "📚", count: 3, description: "Teachers, tutors, and academic coaches" },
  { id: "marketing", name: "Marketing & Advertising", icon: "📱", count: 2, description: "Digital marketers and brand strategists" },
  { id: "home_services", name: "Home Services", icon: "🔧", count: 1, description: "Contractors, handymen, and home repair" },
  { id: "fitness", name: "Fitness & Wellness", icon: "💪", count: 1, description: "Personal trainers and wellness coaches" },
  { id: "legal", name: "Legal Services", icon: "⚖️", count: 1, description: "Attorneys and legal advisors" },
  { id: "technology", name: "Technology & IT", icon: "💻", count: 1, description: "IT support and tech consultants" },
  { id: "real_estate", name: "Real Estate", icon: "🏠", count: 1, description: "Real estate agents and property advisors" },
  { id: "automotive", name: "Automotive", icon: "🚗", count: 1, description: "Auto mechanics and car experts" },
  { id: "pet_care", name: "Pet Care", icon: "🐕", count: 1, description: "Veterinarians and pet specialists" },
  { id: "financial", name: "Financial Planning", icon: "💰", count: 1, description: "Financial planners and investment advisors" }
];

const CategoriesPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse by <span className="text-green-600">Category</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the right professional for your needs. All experts pay for visibility to better serve you.
          </p>
        </div>

        {/* Location Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            First, choose your location preference:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => setSelectedLocation('national')}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                selectedLocation === 'national' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              National
            </button>
            <button 
              onClick={() => setSelectedLocation('state')}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                selectedLocation === 'state' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              State-wide
            </button>
            <button 
              onClick={() => setSelectedLocation('local')}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                selectedLocation === 'local' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Local Area
            </button>
            <button 
              onClick={() => setSelectedLocation('city')}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                selectedLocation === 'city' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              City Only
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <a
              key={category.id}
              href={`/discover?category=${category.id}${selectedLocation ? `&location=${selectedLocation}` : ''}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {category.count} expert{category.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-white mb-6 opacity-90">
            Use our search to find experts by name, specialty, or specific skills.
          </p>
          <a
            href="/discover"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Search All Experts
          </a>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;