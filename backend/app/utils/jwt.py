"""
JWT Token Management Utilities

Handles creation and validation of JWT tokens for authentication.
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

from app.core.config import settings
from app.core.logger import app_logger


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing user data to encode in token (typically user_id, email)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    app_logger.info(f"Access token created for user: {data.get('sub')}")
    
    return encoded_jwt


def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify and decode a JWT access token.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        return payload
    
    except JWTError as e:
        app_logger.warning(f"JWT verification failed: {str(e)}")
        return None
    
    except Exception as e:
        app_logger.error(f"Unexpected error during JWT verification: {str(e)}")
        return None


def decode_token(token: str) -> Optional[str]:
    """
    Decode token and extract user identifier.
    
    Args:
        token: JWT token string
        
    Returns:
        User identifier (email) if token is valid, None otherwise
    """
    payload = verify_access_token(token)
    
    if payload is None:
        return None
    
    user_email: str = payload.get("sub")
    
    if user_email is None:
        return None
    
    return user_email
