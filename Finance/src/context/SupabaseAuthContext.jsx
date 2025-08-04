import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth } from '../lib/supabase';

const SupabaseAuthContext = createContext({});

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, fullName, username) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signUp(email, password, {
        full_name: fullName,
        username: username,
        onboarding_completed: false
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await auth.signInWithGoogle();

      if (error) {
        return { user: null, error: error.message };
      }

      // Note: For OAuth, the user will be redirected and the auth state change will handle the rest
      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const forgotPassword = async (email) => {
    try {
      const { data, error } = await auth.resetPassword(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Mock validation functions (you can implement real validation if needed)
  const validateUsername = async (username) => {
    // Simple validation - you can enhance this
    if (username.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters' };
    }
    return { available: true, message: null };
  };

  const validateEmail = async (email) => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { available: false, message: 'Invalid email format' };
    }
    return { available: true, message: null };
  };

  const validatePassword = async (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length * 20;
    const isValid = score >= 80;

    return {
      data: {
        isValid,
        score,
        checks
      }
    };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword,
    validateUsername,
    validateEmail,
    validatePassword
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthContext;
