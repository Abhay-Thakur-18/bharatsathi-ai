from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, max_length=100, description="User's password (min 6 characters)")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserUpdateProfile(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)


class UserChangePassword(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, max_length=100, description="New password (min 6 characters)")


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Extended profile schemas
# ---------------------------------------------------------------------------

class ProfileUpdateRequest(BaseModel):
    """Full profile update — all fields optional so partial updates work."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    date_of_birth: Optional[str] = Field(None, description="ISO date string YYYY-MM-DD")
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    occupation: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = Field(None, max_length=500)


class PreferencesUpdateRequest(BaseModel):
    default_language: Optional[str] = Field(None, max_length=10)
    response_style: Optional[str] = Field(None, pattern="^(short|medium|detailed)$")
    theme: Optional[str] = Field(None, pattern="^(light|dark|system)$")
    notifications_enabled: Optional[bool] = None
    voice_output: Optional[bool] = None
    auto_save_chats: Optional[bool] = None


class FullProfileResponse(BaseModel):
    """Full user profile — combines users + user_profiles collections."""
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    language: str = "en"
    address: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    role: str = "user"
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_login: Optional[str] = None
    # Extended preferences (from user_profiles)
    default_language: Optional[str] = None
    response_style: Optional[str] = "medium"
    theme: Optional[str] = "system"
    notifications_enabled: bool = True
    voice_output: bool = False
    auto_save_chats: bool = True
    # Computed
    profile_completion: int = 0


class ProfileStatsResponse(BaseModel):
    total_chats: int = 0
    healthcare_queries: int = 0
    agriculture_queries: int = 0
    career_sessions: int = 0
    scheme_searches: int = 0
    account_age_days: int = 0
    last_active: Optional[str] = None


class ActivityItem(BaseModel):
    id: str
    title: str
    category: str
    date: str
    detail: Optional[str] = None


class ProfileActivityResponse(BaseModel):
    chats: list = []
    healthcare: list = []
    agriculture: list = []
    career: list = []
    schemes: list = []