import React, { useState } from 'react';
import { Header } from './components';

const SimpleDiscoverPage = () => {
  const [gender, setGender] = useState('all');
  
  // Mock performers data
  const mockPerformers = [
    // FEMALE PERFORMERS
    { id: 1, name: "Isabella Rose", gender: "female" },
    { id: 2, name: "Sophia Dreams", gender: "female" },
    { id: 3, name: "Luna Nights", gender: "female" },
    { id: 4, name: "Maya Divine", gender: "female" },
    { id: 5, name: "Aria Star", gender: "female" },
    { id: 6, name: "Victoria Grace", gender: "female" },
    
    // MALE PERFORMERS
    { id: 7, name: "Alex Storm", gender: "male" },
    { id: 8, name: "Marcus King", gender: "male" },
    { id: 9, name: "Dylan Phoenix", gender: "male" },
    { id: 10, name: "Jake Rivers", gender: "male" },
    { id: 11, name: "Ryan Blake", gender: "male" },
    { id: 12, name: "Ethan Cross", gender: "male" },
    
    // TRANS PERFORMERS
    { id: 13, name: "Zara Moon", gender: "trans" },
    { id: 14, name: "River Sky", gender: "trans" },
    { id: 15, name: "Phoenix Vale", gender: "trans" },
    { id: 16, name: "Casey Nova", gender: "trans" },
    { id: 17, name: "Jamie Star", gender: "trans" },
    { id: 18, name: "Alex Dawn", gender: "trans" }
  ];
  
  // Filter performers by gender
  const filteredPerformers = gender === 'all' 
    ? mockPerformers 
    : mockPerformers.filter(performer => performer.gender === gender);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Creators
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Find your favorite content creators and explore exclusive content
          </p>
          
          {/* Gender Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="trans">Trans</option>
            </select>
          </div>
          
          {/* Results Count */}
          <div className="mb-4 text-gray-400">
            Showing {filteredPerformers.length} performers
          </div>
          
          {/* Performers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPerformers.map(performer => (
              <div key={performer.id} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold">{performer.name}</h3>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    performer.gender === 'female' ? 'bg-pink-500 text-white' :
                    performer.gender === 'male' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {performer.gender === 'female' ? '♀️' : performer.gender === 'male' ? '♂️' : '🏳️‍⚧️'}
                    {' '}{performer.gender}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDiscoverPage;