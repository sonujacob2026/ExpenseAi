import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const EmailPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

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

  // Send email using EmailJS (requires setup)
  const sendPasswordEmail = async (email, newPassword) => {
    try {
      addLog('Preparing to send email...', 'info');
      
      // Check if EmailJS is available
      if (typeof window.emailjs === 'undefined') {
        addLog('EmailJS not loaded. Loading script...', 'info');
        
        // Load EmailJS script dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
          addLog('EmailJS script loaded', 'success');
        };
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise(resolve => {
          script.onload = resolve;
        });
      }

      // Initialize EmailJS (you need to replace these with your actual values)
      const PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with your EmailJS public key
      const SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID

      if (PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        addLog('EmailJS not configured. Using mock email...', 'info');
        return await mockSendEmail(email, newPassword);
      }

      window.emailjs.init(PUBLIC_KEY);

      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        new_password: newPassword,
        login_url: `${window.location.origin}/auth`,
        from_name: 'ExpenseAI Team'
      };

      addLog('Sending email via EmailJS...', 'info');
      
      const response = await window.emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
      
      if (response.status === 200) {
        addLog('Email sent successfully via EmailJS', 'success');
        return { success: true, error: null };
      } else {
        addLog(`EmailJS error: ${response.text}`, 'error');
        return { success: false, error: response.text };
      }
      
    } catch (error) {
      addLog(`Email sending error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Mock email sending for demo purposes
  const mockSendEmail = async (email, newPassword) => {
    addLog('Using mock email service...', 'info');
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const emailContent = `
Subject: Your New Password - ExpenseAI

Hello,

Your password has been reset. Here are your new login credentials:

Email: ${email}
New Password: ${newPassword}

Please login with these credentials and change your password immediately.

Login here: ${window.location.origin}/auth

Best regards,
ExpenseAI Team
    `;
    
    addLog('Mock email content:', 'info');
    addLog(emailContent, 'info');
    
    // In a real scenario, this would be sent via email
    // For demo, we'll show it in the logs
    return { success: true, error: null };
  };

  // Update user password in Supabase (requires the user to be signed in)
  const updateUserPassword = async (email, newPassword) => {
    try {
      addLog('Attempting to update password in Supabase...', 'info');
      
      // Method 1: Try to sign in the user first, then update password
      // This requires knowing the current password, which we don't have
      
      // Method 2: Use the reset password flow
      // Send a reset email, then when user clicks the link, they can set the new password
      
      // For this demo, we'll simulate the password update
      addLog('Password update simulated (requires admin access in production)', 'info');
      
      // In a real implementation, you would:
      // 1. Use Supabase Admin API (server-side)
      // 2. Or use Edge Functions with service role key
      // 3. Or implement a custom backend endpoint
      
      return { success: true, error: null };
      
    } catch (error) {
      addLog(`Password update error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  const handleEmailPasswordReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');
    addLog(`Starting email password reset for: ${email}`, 'info');

    try {
      // Step 1: Generate new password
      const newPassword = generateSecurePassword();
      addLog(`Generated new password: ${newPassword}`, 'success');

      // Step 2: Update password in Supabase (simulated)
      const updateResult = await updateUserPassword(email, newPassword);
      
      if (!updateResult.success) {
        setMessage(`❌ Failed to update password: ${updateResult.error}`);
        return;
      }

      // Step 3: Send email with new password
      const emailResult = await sendPasswordEmail(email, newPassword);
      
      if (!emailResult.success) {
        setMessage(`❌ Password updated but failed to send email: ${emailResult.error}`);
        return;
      }

      // Success
      setMessage(`✅ New password generated and sent to ${email}! Check your email.`);
      addLog('Email password reset completed successfully!', 'success');
      
    } catch (error) {
      addLog(`Exception in email password reset: ${error.message}`, 'error');
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Email Password Reset
        </h2>
        
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">How it works:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>1. Enter your email address</li>
            <li>2. System generates a new secure password</li>
            <li>3. New password is sent to your email</li>
            <li>4. Login with the new password from your email</li>
            <li>5. Change to your preferred password after login</li>
          </ul>
        </div>
        
        <form onSubmit={handleEmailPasswordReset} className="space-y-4 mb-6">
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
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Email...
              </>
            ) : (
              'Generate & Email New Password'
            )}
          </button>
        </form>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
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

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Process Logs</h3>
            <button
              onClick={clearLogs}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-300'
                }`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📧 Email Setup Required:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sign up at EmailJS.com</li>
              <li>• Create email service & template</li>
              <li>• Update the configuration keys</li>
              <li>• Currently using mock email</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">🔐 Production Notes:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Requires Supabase admin access</li>
              <li>• Use Edge Functions for security</li>
              <li>• Implement rate limiting</li>
              <li>• Add email verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPasswordReset;