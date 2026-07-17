"""
Healthcare Schemas

Request/response models for healthcare guidance API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class SymptomCheck(BaseModel):
    """Schema for symptom checker"""
    symptoms: str = Field(..., min_length=10, max_length=1000, description="Description of symptoms")
    age: Optional[int] = Field(None, ge=0, le=150, description="Patient age")
    gender: Optional[str] = Field(None, description="Patient gender")
    medical_history: Optional[str] = Field(None, description="Relevant medical history")


class SymptomCheckResponse(BaseModel):
    """Schema for symptom check response"""
    analysis: str
    possible_conditions: List[str]
    recommendations: List[str]
    when_to_see_doctor: str
    disclaimer: str


class HealthQuery(BaseModel):
    """Schema for general health queries"""
    query: str = Field(..., min_length=5, max_length=500, description="Health related question")
    context: Optional[str] = Field(None, description="Additional context")


class HealthQueryResponse(BaseModel):
    """Schema for health query response"""
    query: str
    answer: str
    sources: List[str] = []
    disclaimer: str
