import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordDebug = () => {
  const [searchParams] = useSearchParams();
  const [showDebug, setShowDebug] = useState(false);

  // Get all URL parameters
  const queryParams = Object.fromEntries(searchParams.entries());
  
  // Get hash parameters
  const hash = window.location.hash.substring(1);
  const hashParams = Object.fromEntries(new URLSearchParams(hash).entries());

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
      >
        🐛 Debug URL
      </button>
      
      {showDebug && (
        <div className="absolute top-10 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">URL Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-gray-700">Full URL:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 break-all text-xs">
                {window.location.href}
              </div>
            </div>
            
            <div>
              <strong className="text-gray-700">Query Parameters:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                {Object.keys(queryParams).length > 0 
                  ? JSON.stringify(queryParams, null, 2)
                  : 'No query parameters'
                }
              </pre>
            </div>
            
            <div>
              <strong className="text-gray-700">Hash Parameters:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                {Object.keys(hashParams).length > 0 
                  ? JSON.stringify(hashParams, null, 2)
                  : 'No hash parameters'
                }
              </pre>
            </div>
            
            <div>
              <strong className="text-gray-700">Expected for Reset:</strong>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• access_token (required)</li>
                <li>• refresh_token (required)</li>
                <li>• type: "recovery" (required)</li>
              </ul>
            </div>
            
            <div>
              <strong className="text-gray-700">Status:</strong>
              <div className="mt-1">
                {(queryParams.access_token || hashParams.access_token) && 
                 (queryParams.refresh_token || hashParams.refresh_token) && 
                 (queryParams.type === 'recovery' || hashParams.type === 'recovery') ? (
                  <span className="text-green-600 text-xs">✅ Valid reset link</span>
                ) : (
                  <span className="text-red-600 text-xs">❌ Invalid or missing tokens</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordDebug;
