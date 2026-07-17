"""
Government Scheme Schemas

Request/response models for scheme API endpoints.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict
from datetime import datetime


class SchemeSearch(BaseModel):
    """Schema for scheme search"""
    query: str = Field(..., min_length=2, max_length=200, description="Search query")
    category: Optional[str] = Field(None, description="Filter by category")
    state: Optional[str] = Field(None, description="Filter by state")
    is_central: Optional[bool] = Field(None, description="Filter central/state schemes")


class SchemeResponse(BaseModel):
    """Schema for scheme details"""
    id: str
    name: str
    description: str
    category: str
    eligibility: List[str]
    benefits: List[str]
    how_to_apply: str
    official_website: Optional[str] = None
    contact_info: Dict = {}
    documents_required: List[str] = []
    target_audience: List[str] = []
    ministry: Optional[str] = None
    state: Optional[str] = None
    is_central: bool
    views_count: int = 0


class SchemeListResponse(BaseModel):
    """Schema for list of schemes"""
    schemes: List[SchemeResponse]
    total: int
    page: int
    per_page: int


class SchemeEligibilityCheck(BaseModel):
    """Schema for checking eligibility"""
    scheme_id: str
    user_profile: Dict = Field(..., description="User profile data for eligibility check")


class SchemeEligibilityResponse(BaseModel):
    """Schema for eligibility check response"""
    scheme_name: str
    is_eligible: bool
    matched_criteria: List[str]
    unmatched_criteria: List[str]
    ai_explanation: str


class AISchemeRecommendationRequest(BaseModel):
    """Schema for AI-powered scheme recommendations"""
    user_query: str = Field(..., min_length=10, max_length=500)
    user_context: Optional[Dict] = Field(None, description="User context (age, occupation, location, etc.)")


class AISchemeRecommendationResponse(BaseModel):
    """Schema for AI scheme recommendations"""
    query: str
    recommendations: List[SchemeResponse]
    ai_explanation: str
