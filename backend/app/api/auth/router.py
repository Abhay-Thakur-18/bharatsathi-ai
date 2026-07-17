from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.models.user import UserModel
from app.api.auth.service import hash_password, verify_password
from app.repositories.user_repository import (
    create_user,
    get_user_by_email
)
from app.utils.jwt import create_access_token
from app.dependencies.auth import get_current_user
from app.core.logger import app_logger


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """
    Register a new user.
    
    Creates a new user account with hashed password.
    Email must be unique.
    """
    app_logger.info(f"Registration attempt for email: {user.email}")
    
    existing_user = await get_user_by_email(user.email)

    if existing_user:
        app_logger.warning(f"Registration failed - email already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_data = UserModel.create_document(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    user_id = await create_user(user_data)
    
    app_logger.info(f"User registered successfully: {user.email}")

    return {
        "message": "User registered successfully",
        "user_id": user_id
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT access token.
    
    Validates email and password, returns JWT token on success.
    """
    app_logger.info(f"Login attempt for email: {credentials.email}")
    
    # Fetch user by email
    user = await get_user_by_email(credentials.email)
    
    if not user:
        app_logger.warning(f"Login failed - user not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        app_logger.warning(f"Login failed - invalid password: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user["email"]}
    )
    
    app_logger.info(f"Login successful: {credentials.email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    """
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"]
    }