/**
 * Agriculture Service
 * Handles all agriculture-related API calls
 */

import { api } from './api'
import type { CropAdviceRequest, PestDiseaseRequest, FertilizerRequest } from '@/types'

export interface CropAdviceResponse {
  crop_name: string
  advice: string
  best_practices: string[]
  common_issues: string[]
  resources: string[]
}

export interface PestDiseaseResponse {
  possible_issues: string[]
  solutions: string[]
  preventive_measures: string[]
}

export interface FertilizerResponse {
  crop: string
  recommendations: { recommendation: string }[]
  application_tips: string[]
  organic_alternatives: string[]
}

export interface AgriScheme {
  name: string
  description: string
  website: string
}

export interface AgriHelpline {
  service: string
  number: string
}

export const agricultureService = {
  async getCropAdvice(data: CropAdviceRequest): Promise<CropAdviceResponse> {
    const response = await api.post<CropAdviceResponse>('/agriculture/crop-advice', {
      crop_name: data.crop_name,
      soil_type: data.soil_type,
      state: data.state,
      season: data.season,
    })
    return response.data
  },

  async identifyPestDisease(data: PestDiseaseRequest): Promise<PestDiseaseResponse> {
    const response = await api.post<PestDiseaseResponse>('/agriculture/pest-disease', {
      description: data.symptoms,
      crop: data.crop_name,
      symptoms: data.symptoms,
    })
    return response.data
  },

  async getFertilizerRecommendation(data: FertilizerRequest): Promise<FertilizerResponse> {
    const response = await api.post<FertilizerResponse>('/agriculture/fertilizer', {
      crop: data.crop_name,
      soil_type: data.soil_type,
    })
    return response.data
  },

  async getGovernmentSchemes(): Promise<{ schemes: AgriScheme[] }> {
    const response = await api.get<{ schemes: AgriScheme[] }>('/agriculture/government-schemes')
    return response.data
  },

  async getHelplines(): Promise<{ helplines: AgriHelpline[] }> {
    const response = await api.get<{ helplines: AgriHelpline[] }>('/agriculture/helplines')
    return response.data
  },
}
