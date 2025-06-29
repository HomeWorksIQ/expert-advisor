import React from 'react';
import { Header } from './components';

const DiscoverPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          Discover Amazing Creators
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Test page - Discover functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default DiscoverPage;