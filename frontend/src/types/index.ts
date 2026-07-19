/**
 * Core TypeScript types and interfaces for BharatSathi AI
 */

// User Types
export interface User {
  id: string
  email: string
  full_name: string
  created_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Full Profile (merged users + user_profiles)
export interface FullProfile {
  id: string
  full_name: string
  email: string
  phone?: string | null
  gender?: string | null
  date_of_birth?: string | null
  state?: string | null
  district?: string | null
  occupation?: string | null
  language: string
  address?: string | null
  bio?: string | null
  profile_image?: string | null
  role: string
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
  last_login?: string | null
  // Preferences
  default_language?: string | null
  response_style?: 'short' | 'medium' | 'detailed'
  theme?: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  voice_output: boolean
  auto_save_chats: boolean
  // Computed
  profile_completion: number
}

export interface ProfileUpdateRequest {
  full_name?: string
  phone?: string
  gender?: string
  date_of_birth?: string
  state?: string
  district?: string
  occupation?: string
  language?: string
  address?: string
  bio?: string
}

export interface PreferencesUpdateRequest {
  default_language?: string
  response_style?: 'short' | 'medium' | 'detailed'
  theme?: 'light' | 'dark' | 'system'
  notifications_enabled?: boolean
  voice_output?: boolean
  auto_save_chats?: boolean
}

export interface ProfileStats {
  total_chats: number
  healthcare_queries: number
  agriculture_queries: number
  career_sessions: number
  scheme_searches: number
  account_age_days: number
  last_active?: string | null
}

export interface ActivityItem {
  id: string
  title: string
  category: string
  date: string
  detail?: string
}

export interface ProfileActivity {
  chats: ActivityItem[]
  healthcare: ActivityItem[]
  agriculture: ActivityItem[]
  career: ActivityItem[]
  schemes: ActivityItem[]
}

// Chat Types
export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface ChatRequest {
  message: string
  conversation_id?: string
}

export interface ChatResponse {
  conversation_id: string
  message: Message
  ai_response: Message
}

// Scheme Types
export interface Scheme {
  id: string
  name: string
  description: string
  category: string
  ministry?: string
  benefits: string[]
  eligibility: string[]
  how_to_apply: string
  official_website?: string
  documents_required?: string[]
  target_audience?: string[]
  state?: string
  is_central: boolean
  views_count?: number
  created_at?: string
}

export interface SchemeSearchParams {
  search?: string
  category?: string
  state?: string
  is_central?: boolean
  skip?: number
  limit?: number
}

export interface SchemeRecommendRequest {
  age: number
  gender: string
  state: string
  occupation: string
  income_bracket: string
  category?: string
}

// Healthcare Types
export interface SymptomCheckRequest {
  symptoms: string
  age: number
  gender: string
  medical_history?: string
}

export interface HealthAskRequest {
  question: string
}

// Agriculture Types
export interface CropAdviceRequest {
  crop_name: string
  soil_type?: string
  state?: string
  season?: string
}

export interface PestDiseaseRequest {
  crop_name: string
  symptoms: string
  state?: string
}

export interface FertilizerRequest {
  crop_name: string
  soil_type: string
  growth_stage?: string
}

// Career Types
export interface CareerAdviceRequest {
  current_role?: string
  target_role: string
  education: string
  experience_years: number
  skills: string[]
}

export interface ResumeReviewRequest {
  resume_text: string
  target_role: string
  experience_years?: number
}

export interface SkillAssessmentRequest {
  current_role: string
  target_role: string
  current_skills: string[]
  experience_years?: number
}

export interface InterviewPrepRequest {
  role: string
  experience_level: string
  company_type?: string
}

// API Response Types
export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

// UI Types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

export interface DashboardCard {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}

// Chat Types
export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface ChatRequest {
  message: string
  conversation_id?: string
}

export interface ChatResponse {
  conversation_id: string
  message: Message      // user_message from backend (mapped by service)
  ai_response: Message  // assistant_message from backend
}

// Scheme Types
export interface Scheme {
  id: string
  name: string
  description: string
  category: string
  ministry?: string
  benefits: string[]
  eligibility: string[]
  how_to_apply: string
  official_website?: string
  documents_required?: string[]
  target_audience?: string[]
  state?: string
  is_central: boolean
  views_count?: number
  created_at?: string
}

export interface SchemeSearchParams {
  search?: string
  category?: string
  state?: string
  is_central?: boolean
  skip?: number
  limit?: number
}

export interface SchemeRecommendRequest {
  age: number
  gender: string
  state: string
  occupation: string
  income_bracket: string
  category?: string
}

// Healthcare Types
export interface SymptomCheckRequest {
  symptoms: string
  age: number
  gender: string
  medical_history?: string
}

export interface HealthAskRequest {
  question: string
}

// Agriculture Types
export interface CropAdviceRequest {
  crop_name: string
  soil_type?: string
  state?: string
  season?: string
}

export interface PestDiseaseRequest {
  crop_name: string
  symptoms: string
  state?: string
}

export interface FertilizerRequest {
  crop_name: string
  soil_type: string
  growth_stage?: string
}

// Career Types
export interface CareerAdviceRequest {
  current_role?: string
  target_role: string
  education: string
  experience_years: number
  skills: string[]
}

export interface ResumeReviewRequest {
  resume_text: string
  target_role: string
  experience_years?: number
}

export interface SkillAssessmentRequest {
  current_role: string
  target_role: string
  current_skills: string[]
  experience_years?: number
}

export interface InterviewPrepRequest {
  role: string
  experience_level: string
  company_type?: string
}

// API Response Types
export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

// UI Types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

export interface DashboardCard {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}
