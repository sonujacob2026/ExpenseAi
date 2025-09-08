import React from 'react';
import { Link } from 'react-router-dom';

const PasswordResetIndex = () => {
  const resetOptions = [
    {
      title: "Standard Reset (Fixed)",
      path: "/auth",
      description: "Enhanced login page with forgot password modal that sends reset links",
      features: ["Modal-based reset", "Pre-fills email", "No page refresh", "Standard Supabase flow"],
      status: "✅ Working",
      color: "blue"
    },
    {
      title: "Simple Password Reset",
      path: "/simple-password-reset",
      description: "Generates a new password and shows it on screen (demo purposes)",
      features: ["Instant password generation", "Copy to clipboard", "No email required", "Demo only"],
      status: "🔧 Demo",
      color: "purple"
    },
    {
      title: "Email Password Reset",
      path: "/email-password-reset",
      description: "Generates new password and sends it via email (requires email service setup)",
      features: ["Auto-generated password", "Email delivery", "EmailJS integration", "Production ready"],
      status: "📧 Requires Setup",
      color: "green"
    },
    {
      title: "Auto Password Reset",
      path: "/auto-password-reset",
      description: "Advanced reset with Supabase admin API (requires backend/Edge Functions)",
      features: ["Admin API access", "Automatic password update", "Email notification", "Full automation"],
      status: "🔐 Admin Required",
      color: "indigo"
    },
    {
      title: "Reset Password Page",
      path: "/reset-password",
      description: "Enhanced reset page that handles email links properly",
      features: ["URL parameter handling", "Session management", "Debug information", "Link processing"],
      status: "✅ Fixed",
      color: "teal"
    },
    {
      title: "Password Reset Test",
      path: "/test/password-reset",
      description: "Comprehensive testing tool for the entire reset flow",
      features: ["Step-by-step testing", "Debug logs", "Session monitoring", "URL parameter check"],
      status: "🧪 Testing",
      color: "yellow"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      green: "bg-green-50 border-green-200 text-green-800",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
      teal: "bg-teal-50 border-teal-200 text-teal-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800"
    };
    return colors[color] || colors.blue;
  };

  const getButtonClasses = (color) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      teal: "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500",
      yellow: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Password Reset Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multiple approaches to password reset functionality, from simple demos to production-ready solutions.
            Choose the one that best fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {resetOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {option.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(option.color)}`}>
                  {option.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">
                {option.description}
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link
                to={option.path}
                className={`w-full text-white py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-center block ${getButtonClasses(option.color)}`}
              >
                Try This Option
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Implementation Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Start (Recommended)</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Start with the <strong>Standard Reset</strong> - it's already working</li>
                <li>Test it on the <strong>login page</strong> (/auth)</li>
                <li>Use the <strong>Password Reset Test</strong> to debug issues</li>
                <li>Check your Supabase email configuration</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 For Production</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Use <strong>Email Password Reset</strong> with proper email service</li>
                <li>Set up EmailJS or similar email service</li>
                <li>Implement <strong>Auto Password Reset</strong> with Edge Functions</li>
                <li>Add rate limiting and security measures</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Current Status</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ <strong>Fixed:</strong> Page refresh issue in forgot password</div>
              <div>✅ <strong>Fixed:</strong> Email link handling in reset page</div>
              <div>✅ <strong>Fixed:</strong> Port configuration (now using 5176)</div>
              <div>🔧 <strong>Next:</strong> Set up email service for automatic password delivery</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure your Supabase redirect URLs include: <code>http://localhost:5176/reset-password</code></li>
              <li>• Email templates must be configured in your Supabase dashboard</li>
              <li>• For production, use proper email services (not browser-based solutions)</li>
              <li>• Always implement rate limiting for password reset requests</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login Page (Recommended Start)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetIndex;