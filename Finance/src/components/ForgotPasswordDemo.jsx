import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const ForgotPasswordDemo = () => {
  const { resetPasswordForEmail, sendOtp } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendResetEmail = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error } = await resetPasswordForEmail(email);
      if (success) {
        setMessage('✅ Reset email sent successfully! Check your inbox.');
      } else {
        setMessage(`❌ Error: ${error}`);
      }
    } catch (error) {
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { success, error } = await sendOtp(email);
      if (success) {
        setMessage('✅ OTP sent successfully! Check your inbox.');
      } else {
        setMessage(`❌ Error: ${error}`);
      }
    } catch (error) {
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          OTP & Password Reset Demo
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for testing"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSendResetEmail}
              disabled={loading || !email}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Email Link'}
            </button>

            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send OTP Code'}
            </button>
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p><strong>Reset Email Link:</strong> Sends a secure link to reset password</p>
            <p><strong>OTP Code:</strong> Sends a 6-digit code for passwordless reset</p>
            <p className="text-yellow-600">⚠️ Make sure your Supabase project has email templates configured!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordDemo;
