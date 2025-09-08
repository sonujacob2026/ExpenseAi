import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EmailDiagnostic = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [supabaseConfig, setSupabaseConfig] = useState({});
  const [testResults, setTestResults] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setLogs(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`);
    return logEntry;
  };

  const addTestResult = (test, status, details) => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    checkSupabaseConfig();
  }, []);

  const checkSupabaseConfig = () => {
    const config = {
      url: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      mode: import.meta.env.MODE,
      origin: window.location.origin,
      currentUrl: window.location.href
    };
    setSupabaseConfig(config);
    addLog(`Supabase URL: ${config.url}`);
    addLog(`Anon Key: ${config.hasAnonKey ? 'Present' : 'Missing'} (${config.anonKeyLength} chars)`);
    addLog(`Environment: ${config.mode}`);
    addLog(`Origin: ${config.origin}`);
  };

  const testSupabaseConnection = async () => {
    addLog('Testing Supabase connection...', 'info');
    addTestResult('Connection Test', 'Running', 'Checking Supabase connection');

    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`Connection error: ${error.message}`, 'error');
        addTestResult('Connection Test', 'Failed', error.message);
        return false;
      }

      addLog('Supabase connection successful', 'success');
      addTestResult('Connection Test', 'Passed', 'Successfully connected to Supabase');
      return true;
    } catch (error) {
      addLog(`Connection exception: ${error.message}`, 'error');
      addTestResult('Connection Test', 'Failed', `Exception: ${error.message}`);
      return false;
    }
  };

  const testEmailConfiguration = async () => {
    addLog('Testing email configuration...', 'info');
    addTestResult('Email Config Test', 'Running', 'Checking email settings');

    try {
      // Try to get auth settings (this might not work with client-side access)
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`Cannot check email config: ${error.message}`, 'error');
        addTestResult('Email Config Test', 'Failed', 'Cannot access auth settings');
        return false;
      }

      addLog('Email configuration check completed', 'info');
      addTestResult('Email Config Test', 'Info', 'Email settings must be checked in Supabase dashboard');
      return true;
    } catch (error) {
      addLog(`Email config error: ${error.message}`, 'error');
      addTestResult('Email Config Test', 'Failed', error.message);
      return false;
    }
  };

  const testPasswordResetEmail = async (testEmail) => {
    addLog(`Testing password reset email for: ${testEmail}`, 'info');
    addTestResult('Password Reset Test', 'Running', `Sending reset email to ${testEmail}`);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        addLog(`Password reset error: ${error.message}`, 'error');
        addTestResult('Password Reset Test', 'Failed', error.message);
        
        // Check for common error messages
        if (error.message.includes('Email not confirmed')) {
          addLog('❌ Email not confirmed. User needs to verify their email first.', 'error');
        } else if (error.message.includes('User not found')) {
          addLog('❌ User not found. Make sure the user exists in your Supabase auth.users table.', 'error');
        } else if (error.message.includes('Email rate limit')) {
          addLog('❌ Email rate limit exceeded. Wait before trying again.', 'error');
        } else if (error.message.includes('SMTP')) {
          addLog('❌ SMTP configuration issue. Check your Supabase email settings.', 'error');
        }
        
        return false;
      }

      addLog('Password reset email request sent successfully!', 'success');
      addTestResult('Password Reset Test', 'Passed', 'Reset email request was successful');
      addLog('✅ If configured correctly, the email should be sent.', 'success');
      return true;
    } catch (error) {
      addLog(`Password reset exception: ${error.message}`, 'error');
      addTestResult('Password Reset Test', 'Failed', `Exception: ${error.message}`);
      return false;
    }
  };

  const checkUserExists = async (testEmail) => {
    addLog(`Checking if user exists: ${testEmail}`, 'info');
    addTestResult('User Check', 'Running', `Verifying user exists for ${testEmail}`);

    try {
      // We can't directly check users with client-side access
      // But we can try to sign in with a dummy password to see if user exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'dummy-password-for-testing-user-existence'
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          addLog('✅ User exists (got invalid credentials error)', 'success');
          addTestResult('User Check', 'Passed', 'User exists in the system');
          return true;
        } else if (error.message.includes('Email not confirmed')) {
          addLog('⚠️ User exists but email not confirmed', 'warning');
          addTestResult('User Check', 'Warning', 'User exists but email not confirmed');
          return true;
        } else if (error.message.includes('User not found')) {
          addLog('❌ User does not exist', 'error');
          addTestResult('User Check', 'Failed', 'User not found in the system');
          return false;
        } else {
          addLog(`User check error: ${error.message}`, 'error');
          addTestResult('User Check', 'Failed', error.message);
          return false;
        }
      }

      // This shouldn't happen with a dummy password
      addLog('Unexpected success with dummy password', 'warning');
      addTestResult('User Check', 'Warning', 'Unexpected result');
      return true;
    } catch (error) {
      addLog(`User check exception: ${error.message}`, 'error');
      addTestResult('User Check', 'Failed', `Exception: ${error.message}`);
      return false;
    }
  };

  const runFullDiagnostic = async () => {
    if (!email) {
      addLog('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    setTestResults([]);
    addLog('=== Starting Full Email Diagnostic ===', 'info');

    try {
      // Test 1: Supabase Connection
      await testSupabaseConnection();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 2: Email Configuration
      await testEmailConfiguration();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 3: User Existence
      await checkUserExists(email);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 4: Password Reset Email
      await testPasswordResetEmail(email);

      addLog('=== Diagnostic Complete ===', 'info');
    } catch (error) {
      addLog(`Diagnostic error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  const createTestUser = async () => {
    if (!email) {
      addLog('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    addLog(`Creating test user: ${email}`, 'info');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });

      if (error) {
        addLog(`User creation error: ${error.message}`, 'error');
        return;
      }

      if (data.user) {
        addLog('✅ Test user created successfully!', 'success');
        addLog('Check your email for confirmation link', 'info');
      }
    } catch (error) {
      addLog(`User creation exception: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">📧 Email Diagnostic Tool</h1>
          
          {/* Configuration Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Supabase URL:</span>
                <div className="text-blue-600 break-all">{supabaseConfig.url || 'Not set'}</div>
              </div>
              <div>
                <span className="font-medium text-blue-700">API Key:</span>
                <div className="text-blue-600">
                  {supabaseConfig.hasAnonKey ? `✅ Set (${supabaseConfig.anonKeyLength} chars)` : '❌ Not set'}
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-700">Environment:</span>
                <div className="text-blue-600">{supabaseConfig.mode}</div>
              </div>
              <div>
                <span className="font-medium text-blue-700">Current URL:</span>
                <div className="text-blue-600 break-all">{supabaseConfig.currentUrl}</div>
              </div>
            </div>
          </div>

          {/* Test Form */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to test"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-4">
              <button
                onClick={runFullDiagnostic}
                disabled={loading || !email}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
              </button>
              
              <button
                onClick={createTestUser}
                disabled={loading || !email}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Test User
              </button>
              
              <button
                onClick={clearLogs}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.status === 'Passed' ? 'bg-green-500' :
                        result.status === 'Failed' ? 'bg-red-500' :
                        result.status === 'Warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{result.test}</div>
                        <div className="text-sm text-gray-600">{result.details}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic Logs</h3>
              <span className="text-sm text-gray-600">{logs.length} entries</span>
            </div>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a diagnostic to see detailed information.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Common Issues */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🔍 Common Email Issues & Solutions</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <div><strong>User not found:</strong> Create the user first or check if email is correct</div>
              <div><strong>Email not confirmed:</strong> User must confirm their email before password reset</div>
              <div><strong>SMTP not configured:</strong> Check Supabase dashboard → Authentication → Email Templates</div>
              <div><strong>Rate limit exceeded:</strong> Wait a few minutes before trying again</div>
              <div><strong>Invalid redirect URL:</strong> Add your URL to Supabase → Authentication → URL Configuration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDiagnostic;