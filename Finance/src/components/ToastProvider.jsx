import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const api = useMemo(() => ({
    add: addToast,
    success: (msg, opts) => addToast(msg, { type: 'success', ...(opts || {}) }),
    error: (msg, opts) => addToast(msg, { type: 'error', ...(opts || {}) }),
    info: (msg, opts) => addToast(msg, { type: 'info', ...(opts || {}) }),
    remove: removeToast,
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'min-w-[220px] max-w-[360px] px-4 py-3 rounded-lg shadow-lg text-white flex items-start gap-3',
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800',
            ].join(' ')}
            role="status"
          >
            <span className="text-lg leading-none">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}
            </span>
            <div className="text-sm leading-5">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-auto text-white/80 hover:text-white text-sm"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;