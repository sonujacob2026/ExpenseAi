import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const DebugAuth = () => {
  const { user, session, loading } = useSupabaseAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();

        setDebugInfo({
          sessionData,
          sessionError,
          userData,
          userError,
          contextUser: user,
          contextSession: session,
          contextLoading: loading,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    getDebugInfo();
  }, [user, session, loading]);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('_realtime').select('*').limit(1);
      console.log('Connection test:', { data, error });
      alert(error ? `Connection failed: ${error.message}` : 'Connection successful!');
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Connection test failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Auth Debug</h3>
        <button
          onClick={testConnection}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Connection
        </button>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        <div>
          <strong>Session:</strong> {session ? '✅ Active' : '❌ None'}
        </div>
        
        <div>
          <strong>Supabase URL:</strong> {debugInfo.supabaseUrl || 'Not set'}
        </div>
        
        <div>
          <strong>Anon Key:</strong> {debugInfo.hasAnonKey ? '✅ Set' : '❌ Missing'}
        </div>
        
        {user && (
          <div>
            <strong>User Email:</strong> {user.email}
          </div>
        )}
        
        {user?.user_metadata && (
          <div>
            <strong>Full Name:</strong> {user.user_metadata.full_name || 'Not set'}
          </div>
        )}

        {user && (
          <div>
            <strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}
          </div>
        )}
        
        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">Raw Debug Data</summary>
          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default DebugAuth;
