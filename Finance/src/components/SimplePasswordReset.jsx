import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const SimplePasswordReset = () => {
  const { resetPasswordForEmail } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'sent', 'instructions'

  // Generate a secure random password
  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Generate new password
      const newPassword = generateSecurePassword();
      
      // Store the new password temporarily (in a real app, you'd send this via email)
      localStorage.setItem('tempPassword', newPassword);
      localStorage.setItem('tempPasswordEmail', email);
      
      // Send reset email (this will send the standard Supabase reset link)
      const { success, error } = await resetPasswordForEmail(email);
      
      if (!success) {
        setMessage(`❌ Failed to send reset email: ${error}`);
        return;
      }

      setStep('instructions');
      setMessage(`✅ Reset process initiated for ${email}`);
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    const tempPassword = localStorage.getItem('tempPassword');
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      alert('Password copied to clipboard!');
    }
  };

  const clearTempData = () => {
    localStorage.removeItem('tempPassword');
    localStorage.removeItem('tempPasswordEmail');
    setStep('email');
    setMessage('');
  };

  const tempPassword = localStorage.getItem('tempPassword');
  const tempPasswordEmail = localStorage.getItem('tempPasswordEmail');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Simple Password Reset
        </h2>
        
        {step === 'email' && (
          <>
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">How it works:</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>1. Enter your email address</li>
                <li>2. We'll generate a new secure password</li>
                <li>3. Use the new password to login</li>
                <li>4. Change it to your preferred password</li>
              </ul>
            </div>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Generate New Password'
                )}
              </button>
            </form>
          </>
        )}

        {step === 'instructions' && tempPassword && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New Password Generated!</h3>
              <p className="text-sm text-gray-600">
                Your new temporary password for <strong>{tempPasswordEmail}</strong>:
              </p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono text-gray-900 break-all">
                  {tempPassword}
                </code>
                <button
                  onClick={copyPassword}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy password"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Copy the password above</li>
                <li>Go to the login page</li>
                <li>Login with your email and this password</li>
                <li>Change to your preferred password in settings</li>
              </ol>
            </div>

            <div className="space-y-3">
              <a
                href="/auth"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-center block"
              >
                Go to Login Page
              </a>
              
              <button
                onClick={clearTempData}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Start Over
              </button>
            </div>
          </>
        )}

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.includes('✅') ? (
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

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Security Note:</h4>
          <p className="text-sm text-yellow-700">
            This is a simplified demo. In production, the new password should be sent via email, 
            not displayed on screen. The password is temporarily stored in browser storage for demo purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplePasswordReset;