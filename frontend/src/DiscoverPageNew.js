import React from 'react';
import { Header } from './components';

function DiscoverPageNew() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          Discover Amazing Creators
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Find your favorite content creators and explore exclusive content
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Female Performers */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Isabella Rose</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white">
                ♀️ female
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Sophia Dreams</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white">
                ♀️ female
              </span>
            </div>
          </div>
          
          {/* Male Performers */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Alex Storm</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                ♂️ male
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Dylan Phoenix</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                ♂️ male
              </span>
            </div>
          </div>
          
          {/* Trans Performers */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Zara Moon</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                🏳️‍⚧️ trans
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">Phoenix Vale</h3>
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                🏳️‍⚧️ trans
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscoverPageNew;