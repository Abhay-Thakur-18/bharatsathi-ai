"""
Typed Exception Hierarchy — Gemini AI Errors

Each subclass carries:
  http_status     : int  — the HTTP status code routers should return
  client_message  : str  — safe, user-facing message (no internal details)

Usage in a router:
    except GeminiError as exc:
        raise HTTPException(status_code=exc.http_status, detail=exc.client_message)
"""


class GeminiError(Exception):
    """Base class for all Gemini-related errors."""

    http_status: int = 500
    client_message: str = "AI service error. Please try again."


class GeminiNotConfiguredError(GeminiError):
    """GEMINI_API_KEY is blank or missing from environment."""

    http_status = 503
    client_message = "AI service is not available. Please contact support."


class GeminiKeyInvalidError(GeminiError):
    """API key is invalid, expired, or revoked."""

    http_status = 503
    client_message = "AI service is not available. Please contact support."


class GeminiQuotaExceededError(GeminiError):
    """Rate limit or monthly quota has been exhausted."""

    http_status = 429
    client_message = (
        "AI service is temporarily busy due to high demand. "
        "Please wait a moment and try again."
    )


class GeminiSafetyBlockError(GeminiError):
    """Request was blocked by Gemini content safety filters."""

    http_status = 400
    client_message = (
        "Your request could not be processed due to content policy. "
        "Please rephrase your message and try again."
    )


class GeminiTimeoutError(GeminiError):
    """Request to Gemini exceeded the timeout threshold."""

    http_status = 504
    client_message = (
        "AI service took too long to respond. Please try again."
    )


class GeminiNetworkError(GeminiError):
    """Network-level failure connecting to Gemini."""

    http_status = 503
    client_message = (
        "AI service is temporarily unavailable. Please try again shortly."
    )
