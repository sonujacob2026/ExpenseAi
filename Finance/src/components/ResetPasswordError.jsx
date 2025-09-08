import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const ResetPasswordError = () => {
  const navigate = useNavigate();
  const { resetPasswordForEmail } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { success, error } = await resetPasswordForEmail(email);
      
      if (success) {
        setMessage('✅ New password reset email sent! Please check your inbox and try the new link.');
      } else {
        setMessage(`❌ ${error || 'Failed to send email. Please try again.'}`);
      }
    } catch (error) {
      setMessage(`❌ ${error.message || 'Failed to send email. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Link Issue</h2>
          <p className="text-gray-600 mt-2">
            The password reset link appears to be invalid or expired
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Explanation */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Common Issues:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>The reset link has expired (links are valid for 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link was corrupted when copied</li>
              <li>There was a temporary server issue</li>
            </ul>
          </div>

          {/* Resend Form */}
          <form onSubmit={handleResendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll send you a fresh password reset link
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                message.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending New Link...' : 'Send New Reset Link'}
            </button>
          </form>

          {/* Alternative Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Need help with something else?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  ← Back to Sign In
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Success:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Check your spam/junk folder for the email</li>
              <li>Click the reset link within 1 hour of receiving it</li>
              <li>Use the link only once - request a new one if needed</li>
              <li>Make sure you're using the same device/browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordError;