import React, { useState } from 'react';

const ForgotPasswordDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          📧 Demo: Forgot Password
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🔐 Forgot Password Demo
          </h3>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">✅ How It Works:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Forgot your password?" on login page</li>
              <li>2. Enter your email address</li>
              <li>3. Check your email for reset link</li>
              <li>4. Click the link to set new password</li>
              <li>5. Login with your new password</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">🔧 Features:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Secure email-based password reset</li>
              <li>• Powered by Supabase authentication</li>
              <li>• Automatic session management</li>
              <li>• User-friendly interface</li>
              <li>• Real-time validation</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">📧 Email Setup:</h4>
            <p className="text-sm text-yellow-700">
              Make sure your Supabase project has email templates configured for password reset emails to work properly.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🧪 Test It:</h4>
            <p className="text-sm text-purple-700 mb-2">
              Try the forgot password flow with a real email address:
            </p>
            <div className="text-xs text-purple-600 bg-purple-100 rounded p-2">
              <strong>Note:</strong> You'll receive an actual email with a reset link that redirects back to this app.
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => {
              setShowDemo(false);
              window.location.href = '/auth';
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try It Now
          </button>
          <button
            onClick={() => setShowDemo(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordDemo;
