"""
Agriculture Schemas

Request/response models for agriculture support API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class CropAdviceRequest(BaseModel):
    """Schema for crop cultivation advice"""
    crop_name: str = Field(..., min_length=2, max_length=100)
    soil_type: Optional[str] = None
    state: Optional[str] = None
    season: Optional[str] = None
    query: Optional[str] = Field(None, description="Specific question about the crop")


class CropAdviceResponse(BaseModel):
    """Schema for crop advice response"""
    crop_name: str
    advice: str
    best_practices: List[str]
    common_issues: List[str]
    resources: List[str]


class PestDiseaseQuery(BaseModel):
    """Schema for pest/disease identification"""
    description: str = Field(..., min_length=10, max_length=500)
    crop: Optional[str] = None
    symptoms: Optional[str] = None


class PestDiseaseResponse(BaseModel):
    """Schema for pest/disease response"""
    possible_issues: List[str]
    solutions: List[str]
    preventive_measures: List[str]


class FertilizerRecommendation(BaseModel):
    """Schema for fertilizer recommendation"""
    crop: str
    soil_type: str
    state: Optional[str] = None
    farm_size: Optional[str] = None


class FertilizerResponse(BaseModel):
    """Schema for fertilizer recommendation response"""
    crop: str
    recommendations: List[dict]
    application_tips: List[str]
    organic_alternatives: List[str]
