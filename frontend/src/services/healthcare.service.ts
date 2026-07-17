/**
 * Healthcare Service
 * Handles all healthcare-related API calls
 */

import { api } from './api'
import type { SymptomCheckRequest, HealthAskRequest } from '@/types'

export interface SymptomCheckResponse {
  analysis: string
  possible_conditions: string[]
  recommendations: string[]
  when_to_see_doctor: string
  disclaimer: string
}

export interface HealthQueryResponse {
  query: string
  answer: string
  sources: string[]
  disclaimer: string
}

export interface GovernmentHealthScheme {
  name: string
  description: string
  website: string
}

export interface EmergencyNumber {
  service: string
  number: string
}

export const healthcareService = {
  async checkSymptoms(data: SymptomCheckRequest): Promise<SymptomCheckResponse> {
    const response = await api.post<SymptomCheckResponse>('/healthcare/symptom-check', {
      symptoms: data.symptoms,
      age: data.age,
      gender: data.gender,
      medical_history: data.medical_history,
    })
    return response.data
  },

  async askHealthQuestion(data: HealthAskRequest): Promise<HealthQueryResponse> {
    const response = await api.post<HealthQueryResponse>('/healthcare/ask', {
      query: data.question,
    })
    return response.data
  },

  async getGovernmentHealthSchemes(): Promise<{ schemes: GovernmentHealthScheme[] }> {
    const response = await api.get<{ schemes: GovernmentHealthScheme[] }>(
      '/healthcare/government-health-schemes'
    )
    return response.data
  },

  async getEmergencyNumbers(): Promise<{ emergency_numbers: EmergencyNumber[] }> {
    const response = await api.get<{ emergency_numbers: EmergencyNumber[] }>(
      '/healthcare/emergency-numbers'
    )
    return response.data
  },
}
