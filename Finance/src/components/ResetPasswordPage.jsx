import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ResetPasswordDebug from './ResetPasswordDebug';

const ResetPasswordPage = () => {
  const { forgotPassword } = useSupabaseAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'reset', or 'success'
  const [isFromEmail, setIsFromEmail] = useState(false);

  useEffect(() => {
    // Check if this is a password reset from email link
    let accessToken = searchParams.get('access_token');
    let refreshToken = searchParams.get('refresh_token');
    let type = searchParams.get('type');

    // Also check URL hash for tokens (Supabase sometimes uses hash)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    if (!accessToken) accessToken = hashParams.get('access_token');
    if (!refreshToken) refreshToken = hashParams.get('refresh_token');
    if (!type) type = hashParams.get('type');

    // Debug: Log all URL parameters
    console.log('🔍 Reset Password URL Parameters:', {
      accessToken: accessToken ? 'Present' : 'Missing',
      refreshToken: refreshToken ? 'Present' : 'Missing',
      type,
      queryParams: Object.fromEntries(searchParams.entries()),
      hashParams: Object.fromEntries(hashParams.entries()),
      fullURL: window.location.href
    });

    // Check for different possible parameter formats
    if (type === 'recovery' && accessToken && refreshToken) {
      console.log('✅ Valid recovery link detected');
      // User clicked reset link from email
      setIsFromEmail(true);
      setStep('reset');
      setMessage('Please enter your new password below.');

      // Set the session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('❌ Session error:', error);
          setMessage('Invalid or expired reset link. Please request a new one.');
          setStep('email');
        } else {
          console.log('✅ Session set successfully');
        }
      });
    } else if (searchParams.has('token') || searchParams.has('code')) {
      // Alternative token formats
      console.log('🔄 Alternative token format detected');
      setStep('reset');
      setMessage('Please enter your new password below.');
    } else {
      console.log('📧 No reset tokens found, showing email form');
      setStep('email');
    }
  }, [searchParams]);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('📧 Reset email sent to:', email);
      console.log('🔗 Redirect URL:', `${window.location.origin}/reset-password`);

      if (error) {
        throw error;
      }

      setStep('success');
      setMessage('Password reset email sent! Please check your inbox and click the link to reset your password.');
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage(error.message || 'Failed to send reset email. Please try again.');
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

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage('Password reset successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <ResetPasswordDebug />
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={() => navigate('/auth')}
            className="absolute left-0 top-0 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' && "Enter your email to receive a password reset link"}
            {step === 'reset' && "Enter your new password"}
            {step === 'success' && "Check your email for the reset link"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🔍 Debug Info:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Current Step:</strong> {step}</div>
                <div><strong>URL Parameters:</strong></div>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
                </pre>
                <div><strong>Current URL:</strong> {window.location.href}</div>
              </div>
            </div>
          )}

          {/* Error/Success Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') || message.includes('sent') || message.includes('Please enter')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {message.includes('successfully') || message.includes('sent') ? (
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

          {/* Email Form */}
          {step === 'email' && (
            <form onSubmit={handleSendResetEmail} className="space-y-6">
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
                <p className="mt-2 text-sm text-gray-600">
                  We'll send you a password reset link to this email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Success Message */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Check your email and click the reset link to continue.
              </p>
              <button
                onClick={() => {
                  setStep('email');
                  setMessage('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Send another email
              </button>
            </div>
          )}

          {/* Password Reset Form */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  minLength={8}
                />
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
                />
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
