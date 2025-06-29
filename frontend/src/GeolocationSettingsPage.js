import React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './App';
import { Header } from './components';
import { GeolocationSettings } from './GeolocationComponents';

export const GeolocationSettingsPage = () => {
  const { user } = useUser();
  const { performerId } = useParams();

  // Security check - only allow performers to access their own settings
  if (!user || user.userType !== 'performer' || user.id !== performerId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-6">You can only access your own geo-location settings.</p>
          <a href="/" className="text-pink-400 hover:text-pink-300">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="py-8">
        <GeolocationSettings performerId={performerId} />
      </div>
    </div>
  );
};