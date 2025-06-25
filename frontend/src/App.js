import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { 
  HomePage, 
  LoginPage, 
  SignUpPage, 
  PerformerDashboard, 
  MemberDashboard,
  ProfilePage,
  StorePage,
  StreamingPage,
  DiscoverPage
} from './components';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'member' or 'performer'

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={login} />} />
          <Route path="/signup" element={<SignUpPage onSignUp={login} />} />
          <Route path="/discover" element={<DiscoverPage />} />
          
          {/* Member Routes */}
          <Route 
            path="/member-dashboard" 
            element={user && userType === 'member' ? 
              <MemberDashboard user={user} onLogout={logout} /> : 
              <Navigate to="/login" />
            } 
          />
          
          {/* Performer Routes */}
          <Route 
            path="/performer-dashboard" 
            element={user && userType === 'performer' ? 
              <PerformerDashboard user={user} onLogout={logout} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/profile/:id" 
            element={<ProfilePage />} 
          />
          
          <Route 
            path="/store/:id" 
            element={<StorePage />} 
          />
          
          <Route 
            path="/stream/:id" 
            element={<StreamingPage />} 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;