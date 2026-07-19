/**
 * Profile Service
 * Handles all profile-related API calls against /profile/*
 */

import { api } from './api'
import type {
  FullProfile,
  ProfileUpdateRequest,
  PreferencesUpdateRequest,
  ProfileStats,
  ProfileActivity,
} from '@/types'

export const profileService = {
  /** GET /profile/ — full merged profile */
  async getProfile(): Promise<FullProfile> {
    const response = await api.get<FullProfile>('/profile/')
    return response.data
  },

  /** PUT /profile/ — update personal info */
  async updateProfile(data: ProfileUpdateRequest): Promise<FullProfile> {
    const response = await api.put<FullProfile>('/profile/', data)
    return response.data
  },

  /** PUT /profile/preferences — update AI/UI preferences */
  async updatePreferences(data: PreferencesUpdateRequest): Promise<FullProfile> {
    const response = await api.put<FullProfile>('/profile/preferences', data)
    return response.data
  },

  /** POST /profile/avatar — upload profile picture */
  async uploadAvatar(file: File): Promise<FullProfile> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<FullProfile>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /** GET /profile/statistics — real usage counts */
  async getStatistics(): Promise<ProfileStats> {
    const response = await api.get<ProfileStats>('/profile/statistics')
    return response.data
  },

  /** GET /profile/activity — recent activity across all modules */
  async getActivity(): Promise<ProfileActivity> {
    const response = await api.get<ProfileActivity>('/profile/activity')
    return response.data
  },

  /** PUT /profile/change-password */
  async changePassword(current_password: string, new_password: string): Promise<void> {
    await api.put('/profile/change-password', { current_password, new_password })
  },

  /** POST /profile/logout-all */
  async logoutAll(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/profile/logout-all')
    return response.data
  },

  /** DELETE /profile/ — deactivate account */
  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/profile/')
    return response.data
  },

  /** Legacy compat — used by old ProfilePage and DashboardPage */
  async getDashboardStats() {
    const response = await api.get('/auth/dashboard-stats')
    return response.data
  },
}
