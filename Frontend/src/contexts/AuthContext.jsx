// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the app loads to check for an active session
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/check_session', { withCredentials: true })
      .then(response => {
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        }
      })
      .catch(error => console.error("Session check failed:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await axios.post('http://127.0.0.1:8000/api/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);