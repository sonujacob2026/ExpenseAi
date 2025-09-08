import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const EmailTest = () => {
  const { resetPasswordForEmail } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (log) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${log}`]);
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');
    addLog(`Starting password reset test for: ${email}`);

    try {
      addLog('Calling resetPasswordForEmail...');
      const result = await resetPasswordForEmail(email);
      addLog(`Result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        setMessage('✅ Password reset email sent successfully!');
        addLog('SUCCESS: Email sent successfully');
      } else {
        setMessage(`❌ Error: ${result.error}`);
        addLog(`ERROR: ${result.error}`);
      }
    } catch (error) {
      addLog(`EXCEPTION: ${error.message}`);
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('Test completed');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Reset Test</h1>
          
          <form onSubmit={handleTest} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Password Reset Email'}
            </button>
          </form>

          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Debug Logs</h3>
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
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Configuration Check:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</li>
              <li>• Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
              <li>• Environment: {import.meta.env.MODE}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;