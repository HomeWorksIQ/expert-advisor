import React from 'react';
import { DiscoverPage as EnhancedDiscoverPage } from './enhanced-components';

// This is a wrapper component to fix potential circular dependency issues
const DiscoverPage = () => {
  return <EnhancedDiscoverPage />;
};

export default DiscoverPage;