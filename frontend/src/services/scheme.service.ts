/**
 * Scheme Service
 * Handles all government scheme-related API calls
 */

import { api } from './api'
import type { Scheme, SchemeSearchParams, SchemeRecommendRequest } from '@/types'

export interface SchemeListResponse {
  schemes: Scheme[]
  total: number
  page: number
  per_page: number
}

export interface SchemeRecommendResponse {
  query: string
  recommendations: Scheme[]
  ai_explanation: string
}

export const schemeService = {
  /**
   * Search schemes — returns paginated list
   */
  async searchSchemes(params: SchemeSearchParams = {}): Promise<SchemeListResponse> {
    const response = await api.get<SchemeListResponse>('/schemes/', { params })
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
    const response = await api.get<{ categories: string[] }>('/schemes/categories')
    return response.data.categories
  },

  /**
   * Get scheme recommendations
   */
  async getRecommendations(data: SchemeRecommendRequest): Promise<SchemeRecommendResponse> {
    const response = await api.post<SchemeRecommendResponse>('/schemes/recommend', {
      user_query: `Age: ${data.age}, Gender: ${data.gender}, State: ${data.state}, Occupation: ${data.occupation}, Income: ${data.income_bracket}${data.category ? ', Category: ' + data.category : ''}`,
      user_context: {
        age: data.age,
        gender: data.gender,
        state: data.state,
        occupation: data.occupation,
        income_bracket: data.income_bracket,
      },
    })
    return response.data
  },

  /**
   * Get AI explanation for a scheme
   */
  async getExplanation(id: string): Promise<{ scheme_id: string; scheme_name: string; ai_explanation: string }> {
    const response = await api.post<{ scheme_id: string; scheme_name: string; ai_explanation: string }>(
      `/schemes/explain/${id}`
    )
    return response.data
  },
}
