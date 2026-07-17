from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, max_length=100, description="User's password (min 6 characters)")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserUpdateProfile(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")


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