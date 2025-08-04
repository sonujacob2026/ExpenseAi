import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';


const AuthPage = () => {
  const { user, signUp, signIn, signInWithGoogle, validateUsername, validateEmail, validatePassword } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.user_metadata?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/questionnaire');
      }
    }
  }, [user, navigate]);


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
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setValidationErrors({});

    try {
      if (isSignUp) {
        const { error, message } = await signUp(email, password, fullName, username);
        if (error) {
          setMessage(error);
          return;
        }
        setMessage(message || 'Account created successfully! Please check your email for confirmation.');
      } else {
        const { user: loggedInUser, error } = await signIn(email, password);
        if (error) {
          setMessage(error);
          return;
        }

        // Successful login - redirect based on onboarding status
        if (loggedInUser) {
          if (loggedInUser.user_metadata?.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/questionnaire');
          }
        }
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setMessage(error);
        setLoading(false);
        return;
      }

      setMessage('Redirecting to Google...');
      // Note: Supabase will handle the redirect automatically
      // The user will be redirected back to the app after authentication

    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      setMessage('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to reset password page
    navigate('/reset-password');
  };

  return (
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

          <form className="space-y-6" onSubmit={handleAuth}>
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
                onChange={(e) => isSignUp ? handleEmailChange(e.target.value) : setEmail(e.target.value)}
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
              <div className={`text-sm text-center p-3 rounded-lg ${
                message.includes('Check your email') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
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
  );
};

export default AuthPage;
