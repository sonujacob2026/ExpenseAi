import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseDebug = () => {
  const [configStatus, setConfigStatus] = useState({});
  const [connectionTest, setConnectionTest] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      apiUrl: import.meta.env.VITE_API_URL
    };

    const status = {};
    Object.entries(config).forEach(([key, value]) => {
      status[key] = {
        value: value || 'Not set',
        isValid: value && value !== 'your_supabase_project_url_here' && value !== 'your-anon-key-here',
        message: value ? '✅ Set' : '❌ Missing'
      };
    });

    setConfigStatus(status);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test Supabase connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setConnectionTest({
          success: false,
          error: error.message,
          details: 'Failed to connect to Supabase'
        });
      } else {
        setConnectionTest({
          success: true,
          message: 'Successfully connected to Supabase',
          session: data.session ? 'Active session' : 'No active session'
        });
      }
    } catch (error) {
      setConnectionTest({
        success: false,
        error: error.message,
        details: 'Exception occurred during connection test'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 Supabase Configuration Debug</h1>
          
          {/* Configuration Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(configStatus).map(([key, status]) => (
                <div key={key} className={`p-4 rounded-lg border ${
                  status.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className={`text-sm font-medium ${
                      status.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {status.message}
                    </span>
                  </div>
                  <div className="mt-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {status.value}
                    </code>
                    {status.isValid && (
                      <button
                        onClick={() => copyToClipboard(status.value)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Test</h2>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Supabase Connection'}
            </button>
            
            {connectionTest.success !== undefined && (
              <div className={`mt-4 p-4 rounded-lg ${
                connectionTest.success 
                  ? 'border-green-200 bg-green-50 text-green-800' 
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                <div className="font-medium">
                  {connectionTest.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div className="text-sm mt-1">
                  {connectionTest.message || connectionTest.error}
                </div>
                {connectionTest.details && (
                  <div className="text-sm mt-1 opacity-75">
                    {connectionTest.details}
                  </div>
                )}
                {connectionTest.session && (
                  <div className="text-sm mt-1 opacity-75">
                    Session: {connectionTest.session}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Setup Instructions</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">To fix configuration issues:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Create a `.env` file in your Finance directory</li>
                <li>Add your Supabase URL and anon key</li>
                <li>Restart your development server</li>
                <li>Check the configuration status above</li>
              </ol>
              <div className="mt-3">
                <a 
                  href="/SUPABASE_SETUP.md" 
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  View detailed setup guide →
                </a>
              </div>
            </div>
          </div>

          {/* Environment Variables Template */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables Template</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`# Create a .env file in your Finance directory
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:5000`}
              </pre>
              <button
                onClick={() => copyToClipboard(`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:5000`)}
                className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Copy Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebug;