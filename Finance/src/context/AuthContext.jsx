import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔗 Making API call to:', url);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('expenseai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('📤 API config:', config);

  try {
    const response = await fetch(url, config);
    console.log('📥 API response status:', response.status);

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'API request failed' };
      }
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    console.error('API Error:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('expenseai_user');
    const token = localStorage.getItem('expenseai_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, fullName, username) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          fullName
        }),
      });

      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem('expenseai_user', JSON.stringify(user));
        localStorage.setItem('expenseai_token', token);
        return { user, error: null };
      }
    } catch (error) {
      // Fallback to demo mode when backend is not available
      if (error.message.includes('Cannot connect to server')) {
        const newUser = {
          id: Date.now().toString(),
          email,
          fullName,
          username,
          createdAt: new Date().toISOString()
        };

        setUser(newUser);
        localStorage.setItem('expenseai_user', JSON.stringify(newUser));
        return { user: newUser, error: null };
      }
      return { user: null, error: error.message };
    }
  };

  const signIn = async (identifier, password) => {
    console.log('🔐 Attempting login with:', identifier);

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier, // Can be username or email
          password
        }),
      });

      console.log('🔐 Login API response:', response);

      if (response.success) {
        const { user, token } = response.data;
        console.log('✅ Login successful:', user);
        setUser(user);
        localStorage.setItem('expenseai_user', JSON.stringify(user));
        localStorage.setItem('expenseai_token', token);
        return { user, error: null };
      } else {
        console.log('❌ Login failed:', response.message);
        return { user: null, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      // NO MORE FALLBACK - Always return error for failed login
      return { user: null, error: error.message || 'Login failed. Please check your credentials.' };
    }
  };

  const signInWithGoogle = async (googleToken) => {
    try {
      const response = await apiCall('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          token: googleToken
        }),
      });

      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem('expenseai_user', JSON.stringify(user));
        localStorage.setItem('expenseai_token', token);
        return { user, error: null };
      }
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        return { success: true, error: null };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('expenseai_user');
      localStorage.removeItem('expenseai_token');
      localStorage.removeItem('expenseai_profile');
    }
  };

  // Validation functions with fallback
  const validateUsername = async (username) => {
    try {
      const response = await apiCall(`/auth/validate-username/${username}`);
      return response;
    } catch (error) {
      // Fallback validation when backend is not available
      const isValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(username) && username.length >= 3;
      return {
        success: true,
        available: isValid,
        message: isValid ? 'Username is available' : 'Username must start with a letter and contain only letters and numbers'
      };
    }
  };

  const validateEmail = async (email) => {
    try {
      const response = await apiCall(`/auth/validate-email/${email}`);
      return response;
    } catch (error) {
      // Fallback validation when backend is not available
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      return {
        success: true,
        available: isValid,
        message: isValid ? 'Email is valid' : 'Please enter a valid email address'
      };
    }
  };

  const validatePassword = async (password) => {
    try {
      const response = await apiCall('/auth/validate-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      return response;
    } catch (error) {
      // Fallback validation when backend is not available
      const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };

      const validCount = Object.values(checks).filter(Boolean).length;
      const score = Math.round((validCount / 5) * 100);
      const isValid = validCount === 5;

      return {
        success: true,
        data: {
          isValid,
          strength: score / 100,
          checks,
          score
        }
      };
    }
  };

  // Function to update user state (for onboarding completion)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('expenseai_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    forgotPassword,
    signOut,
    updateUser,
    validateUsername,
    validateEmail,
    validatePassword,
    apiCall
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
