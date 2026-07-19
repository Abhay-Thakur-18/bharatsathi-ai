"""
Gemini Error → HTTP Response Mapper

Import `raise_gemini_http_error` in any router that calls the Gemini service.
Converts typed GeminiError subclasses to FastAPI HTTPException with correct
status codes and safe, user-facing messages — never leaks internal details.
"""

from fastapi import HTTPException
from app.core.exceptions import GeminiError
from app.core.logger import app_logger


def raise_gemini_http_error(exc: Exception, context: str = "") -> None:
    """
    Convert a GeminiError (or any unexpected exception) to an HTTPException.

    Args:
        exc     : The caught exception
        context : Short description of the operation for server-side logging
    """
    if isinstance(exc, GeminiError):
        app_logger.warning(
            f"Gemini error ({type(exc).__name__}) in {context}: {exc.client_message}"
        )
        raise HTTPException(
            status_code=exc.http_status,
            detail=exc.client_message,
        )

    # Unexpected error — log fully, return generic 500
    app_logger.error(f"Unexpected error in {context}: {type(exc).__name__}: {exc}")
    raise HTTPException(
        status_code=500,
        detail="An unexpected error occurred. Please try again.",
    )
