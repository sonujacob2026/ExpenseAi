import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const QuickPasswordResetTest = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const createAndConfirmUser = async () => {
    setLoading(true);
    setMessage('Creating test user...');

    try {
      // Step 1: Create user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/url-debug`
        }
      });

      if (signUpError) {
        setMessage(`❌ Error creating user: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      setMessage('✅ User created! Check your email for confirmation link.');
      setStep(2);
      
    } catch (error) {
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    setLoading(true);
    setMessage('Sending password reset email...');

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/url-debug`
      });

      if (error) {
        setMessage(`❌ Error sending reset email: ${error.message}`);
        
        // Provide specific guidance based on error
        if (error.message.includes('User not found')) {
          setMessage(`❌ User not found. Please create the user first or check the email address.`);
        } else if (error.message.includes('Email not confirmed')) {
          setMessage(`❌ Email not confirmed. Please check your email and click the confirmation link first.`);
        } else if (error.message.includes('rate limit')) {
          setMessage(`❌ Rate limit exceeded. Please wait a few minutes before trying again.`);
        }
        
        setLoading(false);
        return;
      }

      setMessage('✅ Password reset email sent! Check your email and click the reset link.');
      setStep(3);
      
    } catch (error) {
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectSession = async () => {
    setLoading(true);
    setMessage('Testing current session...');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage(`❌ Session error: ${error.message}`);
        setLoading(false);
        return;
      }

      if (session) {
        setMessage(`✅ Active session found for user: ${session.user.email}`);
      } else {
        setMessage('ℹ️ No active session');
      }
      
    } catch (error) {
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 Quick Password Reset Test
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>1</div>
            <span className="text-sm">Create User</span>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>2</div>
            <span className="text-sm">Confirm Email</span>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>3</div>
            <span className="text-sm">Reset Password</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for testing"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={createAndConfirmUser}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '1. Create Test User'}
            </button>

            <button
              onClick={sendPasswordReset}
              disabled={loading || !email}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : '2. Send Password Reset'}
            </button>

            <button
              onClick={testDirectSession}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : '3. Check Current Session'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : message.includes('ℹ️')
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                {message}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">📋 Test Process:</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Create a test user with the email</li>
            <li>Confirm the email (check your inbox)</li>
            <li>Send password reset email</li>
            <li>Click the reset link to see URL parameters</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/url-debug"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Go to URL Debugger →
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickPasswordResetTest;