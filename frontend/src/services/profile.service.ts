/**
 * Profile Service
 * Handles profile update and password change API calls
 */

import { api } from './api'
import type { User } from '@/types'

export const profileService = {
  async updateProfile(full_name: string): Promise<User> {
    const response = await api.put<User>('/auth/profile', { full_name })
    return response.data
  },

  async changePassword(current_password: string, new_password: string): Promise<void> {
    await api.put('/auth/change-password', { current_password, new_password })
  },

  async getDashboardStats(): Promise<{
    conversations: number
    schemes_explored: number
    health_queries: number
    career_assessments: number
  }> {
    const response = await api.get('/auth/dashboard-stats')
    return response.data
  },
}
