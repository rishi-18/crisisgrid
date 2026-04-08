import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('crisigrid_user')) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem('crisigrid_token') || null
  );
  const [loading, setLoading] = useState(false);

  // Sync state with storage on mount/change
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('crisigrid_token', token);
      localStorage.setItem('crisigrid_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('crisigrid_token');
      localStorage.removeItem('crisigrid_user');
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}`);
      return true;
    } catch (err) {
      // Errors handled by axios interceptor
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      setUser(res.data.user);
      setToken(res.data.token);
      toast.success("Account created successfully");
      return true;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('crisigrid_token');
    localStorage.removeItem('crisigrid_user');
    toast.success("Logged out successfully");
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      hasRole, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
