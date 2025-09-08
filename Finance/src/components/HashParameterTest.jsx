import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const HashParameterTest = () => {
  const [urlInfo, setUrlInfo] = useState({});
  const [authState, setAuthState] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setLogs(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    // Parse URL information
    const parseUrl = () => {
      const info = {
        fullUrl: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
        hashParams: window.location.hash ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries()) : {},
        timestamp: new Date().toLocaleString()
      };
      setUrlInfo(info);
      addLog(`URL parsed: ${info.fullUrl}`);
      
      if (Object.keys(info.hashParams).length > 0) {
        addLog(`Hash parameters found: ${JSON.stringify(info.hashParams)}`, 'success');
      } else if (Object.keys(info.searchParams).length > 0) {
        addLog(`Search parameters found: ${JSON.stringify(info.searchParams)}`, 'success');
      } else {
        addLog('No parameters found in URL', 'warning');
      }
    };

    parseUrl();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      addLog(`Auth state change: ${event}`, 'info');
      
      if (session) {
        addLog(`Session user: ${session.user.email}`, 'success');
        addLog(`Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`, 'info');
        
        setAuthState({
          event,
          user: session.user,
          expiresAt: session.expires_at
        });

        if (event === 'PASSWORD_RECOVERY') {
          addLog('🔐 PASSWORD_RECOVERY event detected!', 'success');
        } else if (event === 'SIGNED_IN') {
          addLog('✅ SIGNED_IN event detected', 'success');
        }
      } else {
        addLog('No session in auth state change', 'warning');
        setAuthState(null);
      }
    });

    // Check current session
    const checkCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addLog(`Session check error: ${error.message}`, 'error');
          return;
        }

        if (session) {
          addLog(`Current session found: ${session.user.email}`, 'success');
          setAuthState({
            event: 'EXISTING_SESSION',
            user: session.user,
            expiresAt: session.expires_at
          });
        } else {
          addLog('No current session', 'info');
        }
      } catch (error) {
        addLog(`Session check exception: ${error.message}`, 'error');
      }
    };

    checkCurrentSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const testPasswordReset = async () => {
    const testEmail = 'test@example.com';
    addLog(`Testing password reset for: ${testEmail}`, 'info');

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/hash-test`
      });

      if (error) {
        addLog(`Reset error: ${error.message}`, 'error');
      } else {
        addLog('Reset email sent successfully', 'success');
      }
    } catch (error) {
      addLog(`Reset exception: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Hash Parameter Test</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Purpose:</h3>
            <p className="text-blue-700 text-sm">
              This page tests if Supabase is passing parameters in the URL hash (#) instead of query parameters (?).
              When you click a password reset link, it should redirect here and show any parameters.
            </p>
          </div>

          {/* URL Information */}
          <div className="mb-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Current URL</h3>
              <code className="text-sm text-gray-700 break-all block bg-white p-2 rounded border">
                {urlInfo.fullUrl}
              </code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Search Parameters (?)</h3>
                {Object.keys(urlInfo.searchParams || {}).length === 0 ? (
                  <div className="text-gray-500 text-sm">None</div>
                ) : (
                  <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(urlInfo.searchParams, null, 2)}
                  </pre>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Hash Parameters (#)</h3>
                {Object.keys(urlInfo.hashParams || {}).length === 0 ? (
                  <div className="text-gray-500 text-sm">None</div>
                ) : (
                  <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(urlInfo.hashParams, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Auth State */}
          {authState && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Authentication State</h3>
              <div className="text-sm text-green-700 space-y-1">
                <div><strong>Event:</strong> {authState.event}</div>
                <div><strong>User:</strong> {authState.user.email}</div>
                <div><strong>Expires:</strong> {new Date(authState.expiresAt * 1000).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="mb-6">
            <button
              onClick={testPasswordReset}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Test Password Reset Email
            </button>
          </div>

          {/* Logs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Logs</h3>
              <button
                onClick={clearLogs}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
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
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Test Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Update your Supabase redirect URL to: <code>http://localhost:5176/hash-test</code></li>
              <li>Send a password reset email from your app</li>
              <li>Click the reset link in your email</li>
              <li>Check if parameters appear in the URL or auth state</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashParameterTest;