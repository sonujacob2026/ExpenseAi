import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';


const AuthPage = ({ suppressAutoRedirect = false, initialMode } = {}) => {
  const { user, signUp, signIn, signInWithGoogle, validateUsername, validateEmail, validatePassword, resetPasswordForEmail } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const shouldShowPopup = useRef(false);
  
  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  // Redirect if user is already logged in (unless explicitly suppressed)
  useEffect(() => {
    console.log('🔍 User state changed:', user);
    if (!suppressAutoRedirect && user) {
      console.log('🔍 User exists, redirecting...');
      if (user.user_metadata?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/questionnaire');
      }
    }
  }, [user, navigate, suppressAutoRedirect]);

  // Debug message state changes
  useEffect(() => {
    console.log('🔍 Message state changed:', message);
  }, [message]);

  // Debug popup state changes
  useEffect(() => {
    console.log('🔍 Popup state changed:', { showErrorPopup, errorMessage });
  }, [showErrorPopup, errorMessage]);


  // Real-time validation functions
  const handleUsernameChange = async (value) => {
    setUsername(value);
    if (value.length >= 3) {
      try {
        const result = await validateUsername(value);
        setValidationErrors(prev => ({
          ...prev,
          username: result.available ? null : result.message
        }));
      } catch (error) {
        // Silently handle validation errors to prevent UI disruption
        console.log('Username validation error:', error);
      }
    } else {
      setValidationErrors(prev => ({
        ...prev,
        username: null
      }));
    }
  };

  const handleEmailChange = async (value) => {
    setEmail(value);
    if (value.includes('@')) {
      try {
        const result = await validateEmail(value);
        setValidationErrors(prev => ({
          ...prev,
          email: result.available ? null : result.message
        }));
      } catch (error) {
        // Silently handle validation errors
        console.log('Email validation error:', error);
      }
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email: null
      }));
    }
  };

  const handlePasswordChange = async (value) => {
    setPassword(value);
    
    // Clear error messages when user starts typing
    if (message) setMessage('');
    if (showErrorPopup) {
      setShowErrorPopup(false);
      setErrorMessage('');
    }
    
    if (value.length > 0) {
      try {
        const result = await validatePassword(value);
        setPasswordStrength(result.data);
        setValidationErrors(prev => ({
          ...prev,
          password: result.data?.isValid ? null : 'Password does not meet requirements'
        }));
      } catch (error) {
        // Silently handle validation errors
        console.log('Password validation error:', error);
      }
    } else {
      setPasswordStrength(null);
      setValidationErrors(prev => ({
        ...prev,
        password: null
      }));
    }
  };

  const handleFullNameChange = (value) => {
    setFullName(value);

    // Simple validation for full name
    if (value.length > 0) {
      if (value.length < 2) {
        setValidationErrors(prev => ({
          ...prev,
          fullName: 'Full name must be at least 2 characters'
        }));
      } else if (value.length > 100) {
        setValidationErrors(prev => ({
          ...prev,
          fullName: 'Full name must be less than 100 characters'
        }));
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          fullName: 'Full name can only contain letters, spaces, hyphens, and apostrophes'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          fullName: null
        }));
      }
    } else {
      setValidationErrors(prev => ({
        ...prev,
        fullName: null
      }));
    }
  };



  const handleAuth = async (e) => {
    console.log('🔐 handleAuth called, event:', e);
    
    // Prevent default behavior immediately
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔐 Form submitted, preventing default');
    
    // Clear any previous messages
    setMessage('');
    setShowErrorPopup(false);
    
    setLoading(true);
    setValidationErrors({});

    console.log('🔐 Starting authentication process...', { isSignUp, email, password });
    
    // Add a small delay to see if the loading state shows
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (isSignUp) {
        const { error, message } = await signUp(email, password, fullName, username);
        if (error) {
          // Enhanced signup error handling
          let errorMessage = '';
          
          if (error.includes('User already registered') || 
              error.includes('already exists') ||
              error.includes('already registered')) {
            errorMessage = '📧 This email is already registered. Please sign in instead or use a different email address.';
          } else if (error.includes('Invalid email') || 
                     error.includes('Email format')) {
            errorMessage = '📧 Please enter a valid email address.';
          } else if (error.includes('Password') && error.includes('weak')) {
            errorMessage = '🔒 Password is too weak. Please choose a stronger password with at least 8 characters.';
          } else if (error.includes('Network') || 
                     error.includes('Connection')) {
            errorMessage = '🌐 Network error. Please check your internet connection and try again.';
          } else if (error.includes('rate limit') || 
                     error.includes('too many')) {
            errorMessage = '⏰ Too many signup attempts. Please wait a few minutes before trying again.';
          } else {
            errorMessage = `❌ Signup failed: ${error}`;
          }
          
          // Show error popup instead of inline message
          setErrorMessage(errorMessage);
          setShowErrorPopup(true);
          return;
        }
        setMessage(message || 'Account created successfully! Please check your email for confirmation.');
      } else {
            console.log('🔐 Attempting sign in with:', { email, password });
            
            // Test with a simple error first - this should ALWAYS work
            if (email === 'test@error.com' || email.includes('test')) {
              console.log('🧪 Testing error handling...');
              const errorMessage = '❌ Test error: Invalid credentials for testing';
              console.log('🧪 Setting message:', errorMessage);
              setMessage(errorMessage);
              setErrorMessage(errorMessage);
              setShowErrorPopup(true);
              console.log('🧪 Message state should be:', errorMessage);
              setLoading(false);
              return;
            }
            
            const { user: loggedInUser, error } = await signIn(email, password);
            console.log('🔐 Sign in result:', { loggedInUser, error });
            
            if (error) {
              console.log('❌ Sign in error received:', error);
              console.log('🔍 Error type:', typeof error);
              console.log('🔍 Error content:', JSON.stringify(error));
              
              // ALWAYS show the error, regardless of content
              const errorMessage = `❌ Login failed: ${error}`;
              
              console.log('📝 Final error message:', errorMessage);
              console.log('🔍 About to show error...');
              
              // Show both inline message and popup for any error
              setMessage(errorMessage);
              setErrorMessage(errorMessage);
              setShowErrorPopup(true);
              shouldShowPopup.current = true;
              console.log('🔍 Error message set:', errorMessage);
              console.log('🔍 Message state after setting:', message);
              setLoading(false); // Make sure loading is set to false
              return;
            }

        // Successful login - redirect based on onboarding status
        if (loggedInUser) {
          console.log('✅ Login successful, redirecting user:', loggedInUser);
          if (loggedInUser.user_metadata?.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/questionnaire');
          }
        } else {
          console.log('⚠️ No error but also no user returned - this is unexpected');
          setMessage('❌ Login failed: No user returned');
          setLoading(false);
        }
      }
    } catch (error) {
      console.log('❌ Catch block error:', error);
      const errorMsg = error.message || 'An error occurred during authentication';
      setMessage(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    setShowErrorPopup(false);

    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const errorMessage = '❌ Supabase configuration is missing. Please check your environment variables.';
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
        setLoading(false);
        return;
      }

      const { error } = await signInWithGoogle();

      if (error) {
        // Enhanced Google sign-in error handling
        let errorMessage = '';
        
        if (error.message.includes('popup_closed') || error.message.includes('cancelled')) {
          errorMessage = '🔒 Google sign-in was cancelled. Please try again.';
        } else if (error.message.includes('popup_blocked')) {
          errorMessage = '🚫 Popup blocked. Please allow popups for this site and try again.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = '🌐 Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('account_exists') || 
                   error.message.includes('already exists')) {
          errorMessage = '⚠️ An account with this email already exists. Please sign in with your password.';
        } else if (error.message.includes('invalid_grant') || 
                   error.message.includes('access_denied')) {
          errorMessage = '🚫 Access denied. Please check your Google account settings and try again.';
        } else if (error.message.includes('invalid_client') || 
                   error.message.includes('unauthorized_client')) {
          errorMessage = '🔧 Google OAuth configuration error. Please contact support.';
        } else if (error.message.includes('user_not_found') || 
                   error.message.includes('does not exist')) {
          errorMessage = '🔍 This Google account does not exist or is not accessible. Please try a different account.';
        } else if (error.message.includes('supabase') || error.message.includes('configuration')) {
          errorMessage = '🔧 Supabase configuration error. Please check your environment variables and try again.';
        } else {
          errorMessage = `❌ Google sign-in failed: ${error.message}`;
        }
        
        // Show error popup instead of inline message
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
        setLoading(false);
        return;
      }

      setMessage('🔄 Redirecting to Google...');
      // Note: Supabase will handle the redirect automatically
      // The user will be redirected back to the app after authentication

    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      
      // Check for configuration errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        setErrorMessage('🌐 Network error. Please check your internet connection and Supabase configuration.');
      } else if (error.message.includes('supabase') || error.message.includes('client')) {
        setErrorMessage('🔧 Supabase client error. Please check your configuration and try again.');
      } else {
        setErrorMessage(`❌ Google sign-in failed: ${error.message}`);
      }
      
      setShowErrorPopup(true);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Pre-fill email if user has entered one
    setForgotPasswordEmail(email);
    setForgotPasswordMessage('');
    setShowForgotPasswordModal(true);
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const { success, error } = await resetPasswordForEmail(forgotPasswordEmail);
      
      if (success) {
        setForgotPasswordMessage('✅ Password reset email sent! Please check your inbox and click the link to reset your password.');
        // Clear the email field after successful send
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage('');
        }, 3000);
      } else {
        setForgotPasswordMessage(`❌ ${error || 'Failed to send reset email. Please try again.'}`);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setForgotPasswordMessage(`❌ ${error.message || 'Failed to send reset email. Please try again.'}`);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    setForgotPasswordLoading(false);
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
    shouldShowPopup.current = false;
  };

  const testPopup = () => {
    console.log('🧪 Testing popup...');
    setErrorMessage('🧪 This is a test error message');
    setShowErrorPopup(true);
    shouldShowPopup.current = true;
  };

  return (
    <>
      {/* Error Popup */}
      {console.log('🔍 Rendering popup check:', showErrorPopup, 'Error message:', errorMessage, 'Ref:', shouldShowPopup.current)}
      {(showErrorPopup || errorMessage || shouldShowPopup.current) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeErrorPopup}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Authentication Error</h3>
              </div>
              <button
                onClick={closeErrorPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeErrorPopup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeForgotPasswordModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              </div>
              <button
                onClick={closeForgotPasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={forgotPasswordLoading}
                />
              </div>

              {forgotPasswordMessage && (
                <div className={`p-4 rounded-lg ${
                  forgotPasswordMessage.includes('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {forgotPasswordMessage.includes('✅') ? (
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {forgotPasswordMessage}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  disabled={forgotPasswordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading || !forgotPasswordEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {forgotPasswordLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Start managing your finances today' : 'Welcome back to ExpenseAI'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Google Sign-In enabled */}
          {true && (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Continue with Google'
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form className="space-y-6" onSubmit={handleAuth} noValidate>
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      validationErrors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {validationErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={isSignUp}
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      validationErrors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Choose a username"
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Must start with a letter, only letters and numbers allowed
                  </p>
                </div>


              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {isSignUp ? 'Email address' : 'Email or Username'}
              </label>
              <input
                id="email"
                name="email"
                type={isSignUp ? "email" : "text"}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  if (isSignUp) {
                    handleEmailChange(e.target.value);
                  } else {
                    setEmail(e.target.value);
                    // Clear error messages when user starts typing
                    if (message) setMessage('');
                    if (showErrorPopup) {
                      setShowErrorPopup(false);
                      setErrorMessage('');
                    }
                  }
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={isSignUp ? "Enter your email address" : "Enter email or username"}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              {isSignUp && passwordStrength && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Password Strength</span>
                    <span>{passwordStrength.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 80 ? 'bg-green-500' :
                        passwordStrength.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Requirements: {passwordStrength.checks?.length ? '✓' : '✗'} 8+ chars,
                    {passwordStrength.checks?.uppercase ? ' ✓' : ' ✗'} uppercase,
                    {passwordStrength.checks?.lowercase ? ' ✓' : ' ✗'} lowercase,
                    {passwordStrength.checks?.number ? ' ✓' : ' ✗'} number,
                    {passwordStrength.checks?.special ? ' ✓' : ' ✗'} special char
                  </div>
                </div>
              )}
            </div>


            
            {message && (
              <div className={`text-sm text-center p-4 rounded-lg border-2 ${
                message.includes('Check your email') || message.includes('Redirecting')
                  ? 'bg-green-50 text-green-700 border-green-300' 
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{message}</span>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-green-600 hover:text-green-500 font-medium"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;
