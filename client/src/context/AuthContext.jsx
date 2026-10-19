import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hommiez_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hommiez_token');
      const storedUser = localStorage.getItem('hommiez_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('hommiez_token', receivedToken);
    localStorage.setItem('hommiez_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Register handler (Student or Broker)
  const register = async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('hommiez_token', receivedToken);
    localStorage.setItem('hommiez_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('hommiez_token');
    localStorage.removeItem('hommiez_user');
    setToken(null);
    setUser(null);
  };

  const isStudent = user?.role === 'student';
  const isBroker = user?.role === 'broker';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isStudent,
        isBroker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Convenient custom hook for components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
