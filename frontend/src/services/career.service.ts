/**
 * Career Service
 * Handles all career guidance API calls
 */

import { api } from './api'
import type {
  CareerAdviceRequest,
  ResumeReviewRequest,
  SkillAssessmentRequest,
  InterviewPrepRequest,
} from '@/types'

export interface CareerAdviceResponse {
  career_paths: { title: string; description: string }[]
  skill_recommendations: string[]
  courses_certifications: string[]
  job_market_insights: string
  action_plan: string[]
}

export interface ResumeReviewResponse {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keyword_recommendations: string[]
}

export interface SkillAssessmentResponse {
  target_role: string
  required_skills: string[]
  skill_gaps: string[]
  learning_path: { step: string; resource: string }[]
  estimated_time: string
}

export interface InterviewPrepResponse {
  common_questions: string[]
  preparation_tips: string[]
  resources: string[]
}

export interface CareerProgram {
  name: string
  description: string
  website: string
}

export const careerService = {
  async getCareerAdvice(data: CareerAdviceRequest): Promise<CareerAdviceResponse> {
    const response = await api.post<CareerAdviceResponse>('/career/advice', {
      current_status: data.current_role || 'Not specified',
      education: data.education,
      interests: [],
      skills: data.skills,
      location: null,
      query: `Target role: ${data.target_role}`,
    })
    return response.data
  },

  async reviewResume(data: ResumeReviewRequest): Promise<ResumeReviewResponse> {
    const response = await api.post<ResumeReviewResponse>('/career/resume-review', {
      resume_text: data.resume_text,
      target_role: data.target_role,
      experience_years: data.experience_years,
    })
    return response.data
  },

  async assessSkills(data: SkillAssessmentRequest): Promise<SkillAssessmentResponse> {
    const response = await api.post<SkillAssessmentResponse>('/career/skill-assessment', {
      target_role: data.target_role,
      current_skills: data.current_skills,
      experience_years: data.experience_years,
    })
    return response.data
  },

  async getInterviewPrep(data: InterviewPrepRequest): Promise<InterviewPrepResponse> {
    const response = await api.post<InterviewPrepResponse>('/career/interview-prep', {
      job_role: data.role,
      company_type: data.company_type,
      interview_type: null,
    })
    return response.data
  },

  async getGovernmentPrograms(): Promise<{ programs: CareerProgram[] }> {
    const response = await api.get<{ programs: CareerProgram[] }>('/career/government-programs')
    return response.data
  },
}
