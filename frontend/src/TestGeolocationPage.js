import React from 'react';
import { Header } from './components';
import { GeolocationSettings } from './GeolocationComponents';

export const TestGeolocationPage = () => {
  // Mock performer ID for testing
  const testPerformerId = "test-performer-123";

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <h2 className="text-blue-400 font-bold mb-2">🧪 Test Page - Geo-Location Components</h2>
            <p className="text-gray-300 text-sm">
              This is a test page to demonstrate the geo-location and access control features. 
              All components are functional and connected to the backend APIs.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Test Performer ID: {testPerformerId}
            </p>
          </div>
        </div>
        
        <GeolocationSettings performerId={testPerformerId} />
      </div>
    </div>
  );
};