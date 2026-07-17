/**
 * Scheme Service
 * Handles all government scheme-related API calls
 */

import { api } from './api'
import type { Scheme, SchemeSearchParams, SchemeRecommendRequest } from '@/types'

export const schemeService = {
  /**
   * Search schemes
   */
  async searchSchemes(params: SchemeSearchParams = {}): Promise<Scheme[]> {
    const response = await api.get<Scheme[]>('/schemes/', { params })
    return response.data
  },

  /**
   * Get scheme by ID
   */
  async getScheme(id: string): Promise<Scheme> {
    const response = await api.get<Scheme>(`/schemes/${id}`)
    return response.data
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/schemes/categories')
    return response.data
  },

  /**
   * Get scheme recommendations
   */
  async getRecommendations(data: SchemeRecommendRequest): Promise<{ recommendations: string }> {
    const response = await api.post<{ recommendations: string }>('/schemes/recommend', data)
    return response.data
  },

  /**
   * Get AI explanation for a scheme
   */
  async getExplanation(id: string): Promise<{ explanation: string }> {
    const response = await api.post<{ explanation: string }>(`/schemes/explain/${id}`)
    return response.data
  },
}
