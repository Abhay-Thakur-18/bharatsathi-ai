/**
 * Authentication Context
 * Manages user authentication state globally
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [])

  // Listen for global auth:logout event dispatched by Axios 401 interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      navigate('/login')
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])

  /**
   * Load user from localStorage or fetch from API
   */
  async function loadUser() {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        // Try to use stored user first
        setUser(JSON.parse(storedUser))
        
        // Then refresh in background
        try {
          const freshUser = await authService.getCurrentUser()
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
        } catch {
          // If refresh fails, keep using stored user
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login user
   */
  async function login(data: LoginRequest) {
    const response = await authService.login(data)
    
    // Store token and user
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    
    setUser(response.user)
    navigate('/dashboard')
  }

  /**
   * Register new user
   */
  async function register(data: RegisterRequest) {
    const response = await authService.register(data)
    
    // Store token and user
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    
    setUser(response.user)
    navigate('/dashboard')
  }

  /**
   * Logout user
   */
  function logout() {
    authService.logout()
    setUser(null)
    navigate('/login')
  }

  /**
   * Refresh user data
   */
  async function refreshUser() {
    try {
      const freshUser = await authService.getCurrentUser()
      setUser(freshUser)
      localStorage.setItem('user', JSON.stringify(freshUser))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
