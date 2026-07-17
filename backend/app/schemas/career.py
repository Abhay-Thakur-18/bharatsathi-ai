"""
Career Schemas

Request/response models for career guidance API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class CareerAdviceRequest(BaseModel):
    """Schema for career advice request"""
    current_status: str = Field(..., description="Student/Working Professional/Unemployed/etc.")
    education: str = Field(..., description="Educational qualifications")
    interests: Optional[List[str]] = Field(None, description="Areas of interest")
    skills: Optional[List[str]] = Field(None, description="Current skills")
    location: Optional[str] = Field(None, description="Preferred work location")
    query: Optional[str] = Field(None, description="Specific career question")


class CareerAdviceResponse(BaseModel):
    """Schema for career advice response"""
    career_paths: List[Dict[str, str]]
    skill_recommendations: List[str]
    courses_certifications: List[str]
    job_market_insights: str
    action_plan: List[str]


class ResumeReviewRequest(BaseModel):
    """Schema for resume review"""
    resume_text: str = Field(..., min_length=50, max_length=10000, description="Resume content")
    target_role: Optional[str] = Field(None, description="Target job role")
    experience_years: Optional[int] = Field(None, ge=0, le=50)


class ResumeReviewResponse(BaseModel):
    """Schema for resume review response"""
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    keyword_recommendations: List[str]


class SkillAssessmentRequest(BaseModel):
    """Schema for skill gap assessment"""
    target_role: str
    current_skills: List[str]
    experience_years: int = Field(0, ge=0, le=50)


class SkillAssessmentResponse(BaseModel):
    """Schema for skill assessment response"""
    target_role: str
    required_skills: List[str]
    skill_gaps: List[str]
    learning_path: List[Dict[str, str]]
    estimated_time: str


class InterviewPrepRequest(BaseModel):
    """Schema for interview preparation"""
    job_role: str
    company_type: Optional[str] = Field(None, description="Startup/MNC/Government/etc.")
    interview_type: Optional[str] = Field(None, description="Technical/HR/Behavioral")


class InterviewPrepResponse(BaseModel):
    """Schema for interview prep response"""
    common_questions: List[str]
    preparation_tips: List[str]
    resources: List[str]
