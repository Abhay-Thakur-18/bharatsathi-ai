from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    UserUpdateProfile, UserChangePassword
)
from app.models.user import UserModel
from app.api.auth.service import hash_password, verify_password
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_profile,
    update_user_password,
    update_last_login,
)
from app.utils.jwt import create_access_token
from app.dependencies.auth import get_current_user, get_current_user_id
from app.core.logger import app_logger


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user."""
    app_logger.info(f"Registration attempt for email: {user.email}")

    existing_user = await get_user_by_email(user.email)
    if existing_user:
        app_logger.warning(f"Registration failed - email already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_data = UserModel.create_document(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password)
    )

    user_id = await create_user(user_data)
    app_logger.info(f"User registered successfully: {user.email}")

    # Return token on registration so frontend can auto-login
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": user.full_name,
            "email": user.email
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return JWT access token."""
    app_logger.info(f"Login attempt for email: {credentials.email}")

    user = await get_user_by_email(credentials.email)
    if not user:
        app_logger.warning(f"Login failed - user not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not verify_password(credentials.password, user["password"]):
        app_logger.warning(f"Login failed - invalid password: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user["email"]})
    app_logger.info(f"Login successful: {credentials.email}")

    # Stamp last_login timestamp in MongoDB
    await update_last_login(str(user["_id"]))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user.get("full_name", user.get("name", "")),
            "email": user["email"]
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """Get current authenticated user information."""
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user.get("full_name", current_user.get("name", "")),
        "email": current_user["email"]
    }


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UserUpdateProfile,
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id)
):
    """Update the current user's profile information."""
    success = await update_user_profile(user_id, data.full_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    return {
        "id": str(current_user["_id"]),
        "full_name": data.full_name,
        "email": current_user["email"]
    }


@router.put("/change-password")
async def change_password(
    data: UserChangePassword,
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id)
):
    """Change the current user's password."""
    if not verify_password(data.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    success = await update_user_password(user_id, hash_password(data.new_password))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

    return {"message": "Password changed successfully"}


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id)
):
    """Get dashboard statistics for the current user."""
    from app.repositories import chat_repository
    from app.repositories.healthcare_repository import count_user_healthcare_queries
    from app.repositories.career_repository import count_user_career_queries
    from app.repositories.agriculture_repository import count_user_agriculture_queries

    conv_count = await chat_repository.count_user_conversations(user_id)
    health_count = await count_user_healthcare_queries(user_id)
    career_count = await count_user_career_queries(user_id)
    agriculture_count = await count_user_agriculture_queries(user_id)

    return {
        "conversations": conv_count,
        "schemes_explored": 0,
        "health_queries": health_count,
        "career_assessments": career_count,
        "agriculture_queries": agriculture_count,
    }
