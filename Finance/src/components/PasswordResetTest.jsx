import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';

const PasswordResetTest = () => {
  const { resetPasswordForEmail, updatePassword } = useSupabaseAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState('send');
  const [sessionInfo, setSessionInfo] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    checkUrlParams();
    checkSession();
  }, []);

  const checkUrlParams = () => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    addLog(`URL Parameters: access_token=${!!accessToken}, refresh_token=${!!refreshToken}, type=${type}`);
    
    if (accessToken && refreshToken && type === 'recovery') {
      setCurrentStep('reset');
      addLog('Reset link detected in URL', 'success');
      handleResetLink(accessToken, refreshToken);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Session error: ${error.message}`, 'error');
      } else {
        setSessionInfo(session);
        addLog(`Current session: ${session ? 'Active' : 'None'}`);
        if (session) {
          addLog(`User ID: ${session.user?.id}`);
          addLog(`Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        }
      }
    } catch (error) {
      addLog(`Session check error: ${error.message}`, 'error');
    }
  };

  const handleResetLink = async (accessToken, refreshToken) => {
    try {
      addLog('Setting session with tokens from URL...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        addLog(`Session setup error: ${error.message}`, 'error');
        return;
      }

      addLog('Session set successfully', 'success');
      setSessionInfo(data.session);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      addLog('URL parameters cleared');
      
    } catch (error) {
      addLog(`Exception setting session: ${error.message}`, 'error');
    }
  };

  const sendResetEmail = async () => {
    if (!email) {
      addLog('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    addLog(`Sending reset email to: ${email}`);

    try {
      const result = await resetPasswordForEmail(email);
      
      if (result.success) {
        addLog('Reset email sent successfully!', 'success');
        addLog('Check your email for the reset link');
        setCurrentStep('waiting');
      } else {
        addLog(`Failed to send email: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Exception: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) {
      addLog('Please enter a new password', 'error');
      return;
    }

    if (newPassword.length < 8) {
      addLog('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);
    addLog('Attempting to update password...');

    try {
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        addLog('Password updated successfully!', 'success');
        setCurrentStep('success');
      } else {
        addLog(`Failed to update password: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Exception: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testDirectReset = async () => {
    if (!email || !newPassword) {
      addLog('Please enter both email and new password', 'error');
      return;
    }

    setLoading(true);
    addLog('Testing direct password reset...');

    try {
      // First send reset email
      const resetResult = await resetPasswordForEmail(email);
      if (!resetResult.success) {
        addLog(`Failed to send reset email: ${resetResult.error}`, 'error');
        return;
      }

      addLog('Reset email sent. In a real scenario, you would click the link in the email.', 'success');
      
    } catch (error) {
      addLog(`Exception: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Password Reset Flow Test</h1>
          
          {/* Current Step Indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'send' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                1. Send Email
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                2. Check Email
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'reset' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                3. Reset Password
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                4. Success
              </div>
            </div>
          </div>

          {/* Session Info */}
          {sessionInfo && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Active Session</h3>
              <div className="text-sm text-green-700">
                <div>User ID: {sessionInfo.user?.id}</div>
                <div>Email: {sessionInfo.user?.email}</div>
                <div>Expires: {new Date(sessionInfo.expires_at * 1000).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Test Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Send Reset Email */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Send Reset Email</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="space-y-2">
                <button
                  onClick={sendResetEmail}
                  disabled={loading || !email}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  onClick={testDirectReset}
                  disabled={loading || !email}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Test Full Flow
                </button>
              </div>
            </div>

            {/* Reset Password */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Reset Password</h3>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={resetPassword}
                disabled={loading || !newPassword || !sessionInfo}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              {!sessionInfo && (
                <p className="text-sm text-gray-600">
                  You need an active session (from clicking a reset link) to update the password.
                </p>
              )}
            </div>
          </div>

          {/* Configuration Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Configuration</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Current URL: {window.location.href}</div>
              <div>Origin: {window.location.origin}</div>
              <div>Redirect URL: {window.location.origin}/reset-password</div>
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Test Logs</h3>
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
        </div>
      </div>
    </div>
  );
};

export default PasswordResetTest;