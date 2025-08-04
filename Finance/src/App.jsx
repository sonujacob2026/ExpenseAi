import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import ResetPasswordPage from './components/ResetPasswordPage'
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
          user ? (
            user.user_metadata?.onboarding_completed ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/questionnaire" />
            )
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
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
            user.user_metadata?.onboarding_completed ? (
              <Dashboard />
            ) : (
              <Navigate to="/questionnaire" />
            )
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
      <Router>
        <AppRoutes />
      </Router>
    </SupabaseAuthProvider>
  )
}

export default App
