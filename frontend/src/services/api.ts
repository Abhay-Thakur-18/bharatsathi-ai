/**
 * Axios API Client
 * Centralized HTTP client with request/response interceptors
 */

import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout — covers Gemini AI response latency
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Use React Router navigation instead of hard redirect to avoid full page reload
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden')
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error occurred')
    }

    return Promise.reject(error)
  }
)

// Helper function to get error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail: string }>
    return axiosError.response?.data?.detail || axiosError.message || 'An error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}
