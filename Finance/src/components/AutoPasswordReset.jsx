import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const AutoPasswordReset = () => {
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

  // Send email using a service (you'll need to implement this)
  const sendPasswordEmail = async (email, newPassword) => {
    // For now, we'll simulate sending an email
    // In production, you would use a service like:
    // - EmailJS
    // - SendGrid
    // - Nodemailer with a backend
    // - Supabase Edge Functions
    
    addLog('Simulating email send...', 'info');
    
    // Simulate email content
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
    
    addLog('Email content prepared:', 'success');
    addLog(emailContent, 'info');
    
    // In a real implementation, you would send this email
    // For now, we'll just log it and return success
    return { success: true, error: null };
  };

  // Reset password using Supabase Admin API (requires backend)
  const resetPasswordDirectly = async (email, newPassword) => {
    try {
      addLog('Attempting to reset password directly...', 'info');
      
      // Method 1: Try using the standard reset flow but with auto-confirmation
      // This requires the user to exist in the system
      
      // First, check if user exists
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        addLog(`Error checking users: ${listError.message}`, 'error');
        return { success: false, error: listError.message };
      }
      
      const userExists = users.users.find(user => user.email === email);
      
      if (!userExists) {
        addLog('User not found in database', 'error');
        return { success: false, error: 'User not found. Please sign up first.' };
      }
      
      addLog(`User found: ${userExists.id}`, 'success');
      
      // Method 2: Use admin API to update user password
      const { data, error } = await supabase.auth.admin.updateUserById(
        userExists.id,
        { password: newPassword }
      );
      
      if (error) {
        addLog(`Error updating password: ${error.message}`, 'error');
        return { success: false, error: error.message };
      }
      
      addLog('Password updated successfully in Supabase', 'success');
      return { success: true, error: null };
      
    } catch (error) {
      addLog(`Exception: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Alternative method using Edge Functions (recommended for production)
  const resetPasswordViaEdgeFunction = async (email, newPassword) => {
    try {
      addLog('Calling Edge Function for password reset...', 'info');
      
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email, newPassword }
      });
      
      if (error) {
        addLog(`Edge Function error: ${error.message}`, 'error');
        return { success: false, error: error.message };
      }
      
      addLog('Password reset via Edge Function successful', 'success');
      return { success: true, error: null };
      
    } catch (error) {
      addLog(`Edge Function exception: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  const handleAutoPasswordReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');
    addLog(`Starting auto password reset for: ${email}`, 'info');

    try {
      // Step 1: Generate new password
      const newPassword = generateSecurePassword();
      addLog(`Generated new password: ${newPassword}`, 'success');

      // Step 2: Update password in Supabase
      addLog('Updating password in Supabase...', 'info');
      
      // Try the direct method first
      let resetResult = await resetPasswordDirectly(email, newPassword);
      
      // If direct method fails, try Edge Function method
      if (!resetResult.success) {
        addLog('Direct method failed, trying Edge Function...', 'info');
        resetResult = await resetPasswordViaEdgeFunction(email, newPassword);
      }
      
      if (!resetResult.success) {
        setMessage(`❌ Failed to reset password: ${resetResult.error}`);
        addLog(`Password reset failed: ${resetResult.error}`, 'error');
        return;
      }

      // Step 3: Send email with new password
      addLog('Sending email with new password...', 'info');
      const emailResult = await sendPasswordEmail(email, newPassword);
      
      if (!emailResult.success) {
        setMessage(`❌ Password was reset but failed to send email: ${emailResult.error}`);
        addLog(`Email sending failed: ${emailResult.error}`, 'error');
        return;
      }

      // Success
      setMessage(`✅ Password reset successfully! New password has been sent to ${email}`);
      addLog('Auto password reset completed successfully!', 'success');
      
    } catch (error) {
      addLog(`Exception in auto password reset: ${error.message}`, 'error');
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Auto Password Reset
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Enter your email address</li>
            <li>2. System generates a new secure password</li>
            <li>3. Password is automatically saved in Supabase</li>
            <li>4. New password is sent to your email</li>
            <li>5. Login with the new password</li>
          </ul>
        </div>
        
        <form onSubmit={handleAutoPasswordReset} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
              'Reset Password & Send Email'
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

        <div className="bg-gray-50 rounded-lg p-4">
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

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This method requires admin privileges in Supabase</li>
            <li>• Email sending is currently simulated (check logs)</li>
            <li>• In production, implement proper email service</li>
            <li>• Consider security implications of auto-generated passwords</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AutoPasswordReset;