import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { UserContext, useUser } from './UserContext';
import { 
  HomePage, 
  LoginPage, 
  SignUpPage,
  ForgotPasswordPage,
  VerifyOTPPage,
  ProfileSetupPage,
  BankVerificationPage,
  PerformerDashboard, 
  MemberDashboard,
  ProfilePage,
  StorePage,
  StreamingPage,
  MessagingPage,
  SettingsPage,
  AdminLogin,
  PostDetailPage,
  SubscriptionPage,
  PaymentPage,
  WalletPage,
  NotificationsPage,
  PaymentSuccessPage,
  PaymentCancelledPage
} from './components';
import { DiscoverPage } from './enhanced-components';
import DiscoverPageSimple from './DiscoverPage';
import DiscoverPageNew from './DiscoverPageNew';
import AdminDashboard from './AdminDashboard';
import ChatSystem from './ChatSystem';
import AppointmentSystem from './AppointmentSystem';
// Import already exists above
import VideoConferenceSystem from './VideoConferenceSystem';
import EnhancedSignUpPage from './EnhancedSignUpPage';
import EnhancedPerformerSearch from './EnhancedPerformerSearch';
import CategoriesPage from './CategoriesPage';
import BookingPage from './BookingPage';
import ChatPage from './ChatPage';
import ProfilePageComponent from './ProfilePage';
import HelpSupportPage from './HelpSupportPage';
import { GeolocationSettingsPage } from './GeolocationSettingsPage';
import { ProfileAccessController } from './AccessControlComponents';
import { TestGeolocationPage } from './TestGeolocationPage';
import AffiliateDashboard from './AffiliateDashboard';
import CreditsPaymentComponent from './CreditsPaymentComponent';
import ExpertPayoutDashboard from './ExpertPayoutDashboard';

// Profile Page with Access Control
const ProfilePageWithAccessControl = () => {
  const { id } = useParams();
  return (
    <ProfileAccessController performerId={id}>
      <ProfilePage />
    </ProfileAccessController>
  );
};


// API Configuration
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${API_BASE_URL}/api`;

// Axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor for response handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize user from localStorage
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setUserType(parsedUser.userType);
          
          // Verify token with backend
          try {
            const response = await axios.get(`${API}/auth/verify`);
            if (response.data.valid) {
              setUser(response.data.user);
              setUserType(response.data.user.userType);
            } else {
              throw new Error('Invalid token');
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            logout();
          }
        }
      } catch (error) {
        console.error('User initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // WebSocket connection for real-time features
  useEffect(() => {
    if (user && isOnline) {
      const ws = new WebSocket(`ws://localhost:8001/ws?userId=${user.id}&token=${localStorage.getItem('authToken')}`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        ws.close();
      };
    }
  }, [user, isOnline]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'notification':
        setNotifications(prev => [...prev, data.payload]);
        break;
      case 'message':
        // Handle real-time messaging
        break;
      case 'tip':
        // Handle real-time tips
        break;
      case 'subscription':
        // Handle subscription updates
        break;
      default:
        break;
    }
  };

  const login = async (email, password, userType) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
        userType
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setUserType(userData.userType);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/signup`, userData);
      
      return { 
        success: true, 
        message: 'Account created successfully. Please verify your email.',
        data: response.data 
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const socialLogin = async (provider, accessToken) => {
    try {
      const response = await axios.post(`${API}/auth/social-login`, {
        provider,
        accessToken
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setUserType(userData.userType);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Social login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Social login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setUserType(null);
    setNotifications([]);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const contextValue = {
    user,
    userType,
    isLoading,
    notifications,
    isOnline,
    login,
    signup,
    socialLogin,
    logout,
    updateUser,
    clearNotification,
    API
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <p className="text-white text-lg">Loading The Experts...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      <div className="App">
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
            You are offline. Some features may not work properly.
          </div>
        )}
        
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={!user ? <EnhancedSignUpPage /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/discover" element={<DiscoverPageNew />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/book/:expertId" element={<BookingPage />} />
            <Route path="/chat/:expertId" element={<ChatPage />} />
            <Route path="/search" element={<EnhancedPerformerSearch />} />
            <Route path="/performer-search" element={<EnhancedPerformerSearch />} />
            <Route path="/profile/:id" element={<ProfilePageComponent />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/test-geolocation" element={<TestGeolocationPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
            />

            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/profile-setup" 
              element={user ? <ProfileSetupPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/bank-verification" 
              element={user ? <BankVerificationPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/messages" 
              element={user ? <MessagingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <ChatSystem /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/appointments" 
              element={user ? <AppointmentSystem /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/video-conference" 
              element={user ? <VideoConferenceSystem /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <SettingsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/notifications" 
              element={user ? <NotificationsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wallet" 
              element={user ? <WalletPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/subscription/:id" 
              element={user ? <SubscriptionPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/payment" 
              element={user ? <PaymentPage /> : <Navigate to="/login" />} 
            />

            {/* Member Routes */}
            <Route 
              path="/member-dashboard" 
              element={user?.userType === 'member' ? <MemberDashboard /> : <Navigate to="/login" />} 
            />

            {/* Performer Routes */}
            <Route 
              path="/performer-dashboard" 
              element={user?.userType === 'performer' ? <PerformerDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/performer/:performerId/geolocation-settings" 
              element={user?.userType === 'performer' ? <GeolocationSettingsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/store/:id" 
              element={user?.userType === 'performer' ? <StorePage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/stream/:id" 
              element={user?.userType === 'performer' ? <StreamingPage /> : <Navigate to="/login" />} 
            />

            {/* Profile Access with Geo-Location Control */}
            {/* Duplicate route removed - already defined above */}

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
}

export default App;