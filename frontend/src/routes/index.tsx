/**
 * Application routing configuration
 * Defines all routes and their corresponding components
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui'

// Pages (will be created next)
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ChatPage from '@/pages/ChatPage'
import SchemesPage from '@/pages/SchemesPage'
import SchemeDetailPage from '@/pages/SchemeDetailPage'
import HealthcarePage from '@/pages/HealthcarePage'
import AgriculturePage from '@/pages/AgriculturePage'
import CareerPage from '@/pages/CareerPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import AboutPage from '@/pages/AboutPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route Component (redirect to dashboard if logged in)
interface PublicRouteProps {
  children: React.ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schemes" 
          element={
            <ProtectedRoute>
              <SchemesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schemes/:id" 
          element={
            <ProtectedRoute>
              <SchemeDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/healthcare" 
          element={
            <ProtectedRoute>
              <HealthcarePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agriculture" 
          element={
            <ProtectedRoute>
              <AgriculturePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/career" 
          element={
            <ProtectedRoute>
              <CareerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
