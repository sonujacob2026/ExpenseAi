import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPasswordPage = () => {
  const { resetPasswordForEmail, updatePassword, sendOtp, verifyOtp } = useSupabaseAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Check for access token in URL (from email link) and handle Supabase session
  useEffect(() => {
    const handlePasswordResetLink = async () => {
      console.log('🔍 Processing password reset link...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 Location pathname:', location.pathname);
      console.log('📍 Search params:', Object.fromEntries(searchParams.entries()));
      console.log('📍 Hash:', window.location.hash);

      // Check for existing session first
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('✅ Found existing Supabase session');
          console.log('User email:', session.user.email);
          
          // If we have a session on the reset-password page, it's likely a password recovery
          setStep('reset');
          setMessage('Please enter your new password.');
          setEmail(session.user.email);
          return;
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }

      // Check for different parameter formats Supabase might use
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('🔍 URL Parameters:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        type,
        token: !!token,
        code: !!code,
        error,
        errorDescription
      });

      // Check for errors first
      if (error) {
        console.error('❌ URL contains error:', error, errorDescription);
        setMessage(`Error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
        setStep('email');
        return;
      }

      // Method 1: Standard Supabase format (access_token + refresh_token + type=recovery)
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          console.log('🔐 Setting up session for password reset...');
          
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            setMessage('Invalid or expired reset link. Please request a new password reset.');
            setStep('email');
            return;
          }

          console.log('✅ Session set successfully:', data);
          
          // User clicked the reset password link from email
          setStep('reset');
          setMessage('Please enter your new password.');
          setEmail(data.user?.email || '');
          
          // Clear URL parameters for security
          window.history.replaceState({}, document.title, window.location.pathname);
          
        } catch (error) {
          console.error('❌ Exception handling reset link:', error);
          setMessage('Error processing reset link. Please try again.');
          setStep('email');
        }
      }
      // Method 2: Check for other token formats
      else if (token && type === 'recovery') {
        console.log('🔐 Found token parameter, attempting to use as access token...');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token // Sometimes the same token is used for both
          });

          if (error) {
            console.error('❌ Error with token parameter:', error);
            setMessage('Invalid or expired reset link. Please request a new password reset.');
            setStep('email');
            return;
          }

          console.log('✅ Session set with token parameter');
          setStep('reset');
          setMessage('Please enter your new password.');
          setEmail(data.user?.email || '');
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('❌ Exception with token parameter:', error);
          setMessage('Error processing reset link. Please try again.');
          setStep('email');
        }
      }
      // Method 3: Check for code parameter (OAuth-style)
      else if (code) {
        console.log('🔐 Found code parameter, attempting OAuth exchange...');
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('❌ Error with code exchange:', error);
            setMessage('Invalid or expired reset link. Please request a new password reset.');
            setStep('email');
            return;
          }

          console.log('✅ Session set via code exchange');
          setStep('reset');
          setMessage('Please enter your new password.');
          setEmail(data.user?.email || '');
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('❌ Exception with code exchange:', error);
          setMessage('Error processing reset link. Please try again.');
          setStep('email');
        }
      }
      // Method 4: Check URL hash for parameters (sometimes Supabase uses hash)
      else if (window.location.hash) {
        console.log('🔍 Checking URL hash for parameters...');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');

        console.log('Hash parameters:', {
          accessToken: !!hashAccessToken,
          refreshToken: !!hashRefreshToken,
          type: hashType
        });

        if (hashAccessToken && hashRefreshToken && hashType === 'recovery') {
          try {
            console.log('🔐 Setting up session from hash parameters...');
            const { data, error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken
            });

            if (error) {
              console.error('❌ Error with hash parameters:', error);
              setMessage('Invalid or expired reset link. Please request a new password reset.');
              setStep('email');
              return;
            }

            console.log('✅ Session set from hash parameters');
            setStep('reset');
            setMessage('Please enter your new password.');
            setEmail(data.user?.email || '');
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('❌ Exception with hash parameters:', error);
            setMessage('Error processing reset link. Please try again.');
            setStep('email');
          }
        }
      }
      // Method 5: Check for recovery-related parameters
      else if (type === 'recovery') {
        console.log('⚠️ Recovery type found but missing tokens');
        setMessage('Incomplete reset link. Please request a new password reset.');
        setStep('email');
      }
      else {
        // No reset parameters found, show normal email form
        console.log('ℹ️ No reset parameters found, showing email form');
        setStep('email');
      }
    };

    handlePasswordResetLink();
  }, [searchParams, location]);

  // Set up auth state listener for password recovery events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ PASSWORD_RECOVERY event detected');
        setStep('reset');
        setMessage('Please enter your new password.');
        setEmail(session?.user?.email || '');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('✅ SIGNED_IN event detected, checking if this is password recovery');
        // Check if this is a password recovery session
        setStep('reset');
        setMessage('Please enter your new password.');
        setEmail(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('ℹ️ User signed out, showing email form');
        setStep('email');
        setMessage('');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Password strength validation
  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length * 20;
    return { score, checks };
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    if (value.length > 0) {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error } = await resetPasswordForEmail(email);
      if (!success) {
        setMessage(error || 'Failed to send reset email. Please try again.');
        setLoading(false);
        return;
      }
      setStep('success');
      setMessage('Password reset email sent! Please check your inbox and click the link to reset your password.');
    } catch (error) {
      setMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error } = await sendOtp(email);
      if (!success) {
        setMessage(error || 'Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }
      setStep('otp');
      setMessage('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      setMessage(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage('Please enter the OTP');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error, user } = await verifyOtp(email, otp);
      if (!success) {
        setMessage(error || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      setStep('reset');
      setMessage('OTP verified. Please enter your new password.');
    } catch (error) {
      setMessage(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (passwordStrength && passwordStrength.score < 60) {
      setMessage('Password is too weak. Please choose a stronger password.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error } = await updatePassword(newPassword);
      if (!success) {
        setMessage(error || 'Failed to reset password. Please try again.');
        setLoading(false);
        return;
      }
      setStep('success');
      setMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' && "Choose how you'd like to reset your password"}
            {step === 'otp' && "Enter the OTP sent to your email"}
            {step === 'reset' && "Enter your new password"}
            {step === 'success' && "Password reset successful"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') || message.includes('sent') || message.includes('Please enter') || message.includes('verified')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {message.includes('successfully') || message.includes('sent') || message.includes('Please enter') || message.includes('verified') ? (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message}
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSendResetEmail}
                  disabled={loading || !email}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Choose between a reset link (sent to your email) or an OTP code for passwordless reset.
              </p>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !otp || otp.length !== 6}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <div>
              <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  minLength={8}
                  required
                />
                {passwordStrength && (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  minLength={8}
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword || (passwordStrength && passwordStrength.score < 60)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Password reset successful! You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
