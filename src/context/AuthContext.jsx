import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication context provides JWT state management across the app.
 * Stores token and user info in localStorage for persistence across refreshes.
 * Provides login, logout, and authentication status checking functions.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* Initialize state from localStorage if a previous session exists */
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  /**
   * Stores authentication data after successful login or registration.
   * Saves to both React state and localStorage for persistence.
   */
  const login = (authResponse) => {
    const userData = {
      userId: authResponse.userId,
      username: authResponse.username,
      fullName: authResponse.fullName,
    };
    setToken(authResponse.token);
    setUser(userData);
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /** Clears all authentication data and redirects to login page */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /** Returns true if a valid token exists */
  const isAuthenticated = () => !!token;

  const value = { user, token, login, logout, isAuthenticated };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Custom hook for accessing authentication context */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
