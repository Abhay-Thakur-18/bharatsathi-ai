"""
Authentication Dependencies

Provides dependency injection for protected routes requiring authentication.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.jwt import decode_token
from app.repositories.user_repository import get_user_by_email
from app.core.logger import app_logger


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Dependency to extract and validate current authenticated user.
    
    Validates JWT token from Authorization header and retrieves user from database.
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        User document from database
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Decode and verify token
    user_email = decode_token(token)
    
    if user_email is None:
        app_logger.warning("Invalid or expired token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    user = await get_user_by_email(user_email)
    
    if user is None:
        app_logger.warning(f"User not found for email: {user_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    app_logger.info(f"User authenticated: {user_email}")
    
    return user


async def get_current_user_id(
    user: dict = Depends(get_current_user)
) -> str:
    """
    Dependency to extract only user ID from authenticated user.
    
    Args:
        user: User document from get_current_user dependency
        
    Returns:
        User ID as string
    """
    return str(user["_id"])
