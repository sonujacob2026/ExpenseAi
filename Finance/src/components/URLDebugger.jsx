import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const URLDebugger = () => {
  const [searchParams] = useSearchParams();
  const [urlInfo, setUrlInfo] = useState({});

  useEffect(() => {
    const info = {
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      searchParams: Object.fromEntries(searchParams.entries()),
      hashParams: window.location.hash ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries()) : {},
      timestamp: new Date().toLocaleString()
    };
    setUrlInfo(info);
    console.log('URL Debug Info:', info);
  }, [searchParams]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 URL Parameter Debugger</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
            <p className="text-blue-700 text-sm">
              When you click a password reset link from your email, it should redirect you to this page. 
              This tool will show you exactly what parameters are being passed in the URL.
            </p>
          </div>

          <div className="space-y-6">
            {/* Full URL */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">Full URL</h3>
                <button
                  onClick={() => copyToClipboard(urlInfo.fullUrl)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
              <code className="text-sm text-gray-700 break-all block bg-white p-2 rounded border">
                {urlInfo.fullUrl}
              </code>
            </div>

            {/* URL Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pathname</h3>
                <code className="text-sm text-gray-700 block bg-white p-2 rounded border">
                  {urlInfo.pathname || 'None'}
                </code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Search String</h3>
                <code className="text-sm text-gray-700 block bg-white p-2 rounded border">
                  {urlInfo.search || 'None'}
                </code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Hash</h3>
                <code className="text-sm text-gray-700 block bg-white p-2 rounded border">
                  {urlInfo.hash || 'None'}
                </code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Origin</h3>
                <code className="text-sm text-gray-700 block bg-white p-2 rounded border">
                  {urlInfo.origin}
                </code>
              </div>
            </div>

            {/* Search Parameters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">Search Parameters (Query String)</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(urlInfo.searchParams, null, 2))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy JSON
                </button>
              </div>
              {Object.keys(urlInfo.searchParams || {}).length === 0 ? (
                <div className="text-gray-500 text-sm bg-white p-2 rounded border">
                  No search parameters found
                </div>
              ) : (
                <div className="bg-white p-2 rounded border">
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(urlInfo.searchParams, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Hash Parameters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">Hash Parameters</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(urlInfo.hashParams, null, 2))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy JSON
                </button>
              </div>
              {Object.keys(urlInfo.hashParams || {}).length === 0 ? (
                <div className="text-gray-500 text-sm bg-white p-2 rounded border">
                  No hash parameters found
                </div>
              ) : (
                <div className="bg-white p-2 rounded border">
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(urlInfo.hashParams, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Expected Parameters */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Expected Parameters for Password Reset</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <div><strong>Method 1:</strong> <code>access_token</code>, <code>refresh_token</code>, <code>type=recovery</code> (in search params)</div>
                <div><strong>Method 2:</strong> <code>access_token</code>, <code>refresh_token</code>, <code>type=recovery</code> (in hash)</div>
                <div><strong>Method 3:</strong> <code>token</code>, <code>type=recovery</code></div>
                <div><strong>Method 4:</strong> <code>code</code> (OAuth-style)</div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Analysis</h3>
              <div className="text-sm text-green-700 space-y-2">
                {Object.keys(urlInfo.searchParams || {}).length === 0 && Object.keys(urlInfo.hashParams || {}).length === 0 ? (
                  <div className="text-red-700">❌ No parameters found! This means the reset link is not working correctly.</div>
                ) : (
                  <>
                    {(urlInfo.searchParams?.access_token || urlInfo.hashParams?.access_token) && (
                      <div>✅ Access token found</div>
                    )}
                    {(urlInfo.searchParams?.refresh_token || urlInfo.hashParams?.refresh_token) && (
                      <div>✅ Refresh token found</div>
                    )}
                    {(urlInfo.searchParams?.type === 'recovery' || urlInfo.hashParams?.type === 'recovery') && (
                      <div>✅ Recovery type found</div>
                    )}
                    {urlInfo.searchParams?.token && (
                      <div>✅ Token parameter found</div>
                    )}
                    {urlInfo.searchParams?.code && (
                      <div>✅ Code parameter found</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center text-sm text-gray-500">
              Last updated: {urlInfo.timestamp}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLDebugger;