import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext'
import { ProfileProvider } from './context/ProfileContext'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import ForgotPasswordDemo from './components/ForgotPasswordDemo'
import EmailTest from './components/EmailTest'
import SupabaseDebug from './components/SupabaseDebug'
import PasswordResetTest from './components/PasswordResetTest'
import AutoPasswordReset from './components/AutoPasswordReset'
import SimplePasswordReset from './components/SimplePasswordReset'
import EmailPasswordReset from './components/EmailPasswordReset'
import PasswordResetIndex from './components/PasswordResetIndex'
import EmailDiagnostic from './components/EmailDiagnostic'
import URLDebugger from './components/URLDebugger'
import QuickPasswordResetTest from './components/QuickPasswordResetTest'
import HashParameterTest from './components/HashParameterTest'
import Questionnaire from './components/Questionnaire'
import Dashboard from './components/Dashboard'

const AppRoutes = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={
          <AuthPage suppressAutoRedirect={true} />
        }
      />

      {/* Dedicated signup route so Landing "Sign Up Free" always opens signup form */}
      <Route
        path="/signup"
        element={
          <AuthPage suppressAutoRedirect={true} initialMode="signup" />
        }
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/auth/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/auth/callback"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/demo/forgot-password"
        element={<ForgotPasswordDemo />}
      />
      <Route
        path="/test/email"
        element={<EmailTest />}
      />
      <Route
        path="/debug/supabase"
        element={<SupabaseDebug />}
      />
      <Route
        path="/test/password-reset"
        element={<PasswordResetTest />}
      />
      <Route
        path="/auto-password-reset"
        element={<AutoPasswordReset />}
      />
      <Route
        path="/simple-password-reset"
        element={<SimplePasswordReset />}
      />
      <Route
        path="/email-password-reset"
        element={<EmailPasswordReset />}
      />
      <Route
        path="/password-reset-options"
        element={<PasswordResetIndex />}
      />
      <Route
        path="/email-diagnostic"
        element={<EmailDiagnostic />}
      />
      <Route
        path="/url-debug"
        element={<URLDebugger />}
      />
      <Route
        path="/quick-test"
        element={<QuickPasswordResetTest />}
      />
      <Route
        path="/hash-test"
        element={<HashParameterTest />}
      />
      <Route
        path="/questionnaire"
        element={
          user ? (
            user.user_metadata?.onboarding_completed ? (
              <Navigate to="/dashboard" />
            ) : (
              <Questionnaire />
            )
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard />
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <SupabaseAuthProvider>
      <ProfileProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ProfileProvider>
    </SupabaseAuthProvider>
  )
}

export default App
