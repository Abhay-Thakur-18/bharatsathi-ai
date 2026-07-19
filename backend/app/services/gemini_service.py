"""
Centralized Google Gemini AI Service

THE single module that owns all Gemini client setup and call logic.
Every AI feature in this project calls this service — no other file
should initialize a Gemini client or call genai.configure().

Guarantees
----------
- Client and api_key config happen ONCE via lazy singleton init.
- GEMINI_API_KEY is read exclusively from settings (pydantic-settings /
  .env).  It is never hardcoded and never appears in any log line.
- Every Gemini call is timed and its result (prompt, response text,
  feature tag, user_id, latency, success/failure) is persisted to the
  MongoDB ai_interactions collection via ai_repository.
- Raw SDK / network exceptions are classified into typed GeminiError
  subclasses.  Routers map those to clean HTTP responses — internal
  error details are never sent to the client.

Public API
----------
gemini_service.generate(prompt, feature, user_id, ...)  -> dict
    Core method.  Returns {"text": str, "latency_ms": float}.
    Raises a GeminiError subclass on any failure.

gemini_service.generate_response(prompt, feature, user_id, ...)  -> str
    Thin wrapper — returns text string directly.  Used by all routers.

gemini_service.generate_chat_response(message, feature, user_id, ...)  -> str
    Builds a history-aware prompt then delegates to generate().

gemini_service.verify_key()  -> dict
    Sends a minimal probe request and returns validation status.
    Safe to call from a health endpoint.
"""

import asyncio
import time
from typing import Optional

import google.generativeai as genai
from google.api_core import exceptions as _google_exc
from google.generativeai.types.generation_types import (
    BlockedPromptException,
    StopCandidateException,
)

from app.core.config import settings
from app.core.logger import app_logger
from app.core.exceptions import (
    GeminiError,
    GeminiNotConfiguredError,
    GeminiKeyInvalidError,
    GeminiQuotaExceededError,
    GeminiSafetyBlockError,
    GeminiTimeoutError,
    GeminiNetworkError,
)


# ---------------------------------------------------------------------------
# Error classifier
# ---------------------------------------------------------------------------

def _classify_error(exc: Exception) -> GeminiError:
    """
    Map a raw SDK / network exception to the correct GeminiError subclass.

    Three layers, in priority order:

    Layer 1 — SDK's own safety types (google.generativeai.types.generation_types)
      BlockedPromptException  raised when the prompt is blocked before any
                              output is produced.
      StopCandidateException  raised when generation stops with
                              finish_reason = SAFETY or RECITATION.

    Layer 2 — google.api_core typed HTTP exceptions (confirmed against
              google-generativeai==0.8.3 with a live bad-key call):
      InvalidArgument (HTTP 400)  — invalid API key ("API key not valid")
                                    or other bad-request conditions
      ResourceExhausted (HTTP 429) — quota / rate limit
      DeadlineExceeded  (HTTP 504) — request timeout
      GatewayTimeout    (HTTP 504) — gateway timeout (parent of DeadlineExceeded)
      ServiceUnavailable(HTTP 503) — transient server error
      ServerError       (HTTP 5xx) — generic server-side error

    Layer 3 — string-pattern fallback (last resort only)
      Catches cases where the SDK raises a plain Exception with a descriptive
      message instead of a typed class.

    NOTE: PermissionDenied / Unauthenticated are NOT raised by this SDK for
    invalid keys.  The SDK raises InvalidArgument (HTTP 400) with the message
    "400 API key not valid. Please pass a valid API key."
    """
    # --- Layer 1: SDK safety types ---
    if isinstance(exc, (BlockedPromptException, StopCandidateException)):
        return GeminiSafetyBlockError()

    # --- Layer 2: google.api_core typed exceptions ---
    if isinstance(exc, _google_exc.InvalidArgument):
        # InvalidArgument is the concrete class raised for a bad API key.
        # Check message to distinguish key errors from other 400s.
        msg = str(exc).lower()
        if any(k in msg for k in ("api_key", "api key", "key not valid", "key_invalid")):
            return GeminiKeyInvalidError()
        # Other 400-level bad-request errors fall through to generic GeminiError
        return GeminiError(f"Bad request to Gemini API ({type(exc).__name__})")

    if isinstance(exc, _google_exc.BadRequest):
        # Parent of InvalidArgument — catch any other 400 not already handled
        return GeminiError(f"Bad request to Gemini API ({type(exc).__name__})")

    if isinstance(exc, _google_exc.ResourceExhausted):   # HTTP 429
        return GeminiQuotaExceededError()

    if isinstance(exc, (_google_exc.DeadlineExceeded,    # HTTP 504
                        _google_exc.GatewayTimeout)):    # HTTP 504 parent
        return GeminiTimeoutError()

    if isinstance(exc, (_google_exc.ServiceUnavailable,  # HTTP 503
                        _google_exc.ServerError)):        # HTTP 5xx parent
        return GeminiNetworkError()

    # --- Layer 3: string-pattern fallback ---
    msg = str(exc).lower()

    if any(k in msg for k in ("api_key", "api key", "key not valid", "key_invalid",
                               "permission_denied", "unauthenticated")):
        return GeminiKeyInvalidError()

    if any(k in msg for k in ("quota", "rate limit", "resource_exhausted", "429")):
        return GeminiQuotaExceededError()

    if any(k in msg for k in ("safety", "blocked", "harm", "recitation")):
        return GeminiSafetyBlockError()

    if any(k in msg for k in ("deadline", "timeout", "timed out")):
        return GeminiTimeoutError()

    if any(k in msg for k in ("connection", "network", "unavailable", "503", "502")):
        return GeminiNetworkError()

    return GeminiError(f"Unclassified Gemini error ({type(exc).__name__})")


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class GeminiService:
    """Singleton wrapper around the google-generativeai SDK."""

    def __init__(self) -> None:
        self._model: Optional[genai.GenerativeModel] = None
        self._initialized: bool = False

    # ------------------------------------------------------------------
    # Lazy initialization
    # ------------------------------------------------------------------

    def _ensure_initialized(self) -> None:
        """
        Configure the SDK once, after .env has been loaded.
        Called at the top of every public method.
        Safe to call multiple times — does nothing after the first call.
        The API key value is never logged.
        """
        if self._initialized:
            return
        self._initialized = True

        key = settings.GEMINI_API_KEY
        if not key:
            app_logger.warning(
                "GEMINI_API_KEY is not set in .env — "
                "all AI features will return 503 until it is configured"
            )
            self._model = None
            return

        genai.configure(api_key=key)   # key value intentionally not logged
        self._model = genai.GenerativeModel("gemini-2.0-flash")
        app_logger.info("Gemini AI service initialized (model: gemini-2.0-flash)")

    # ------------------------------------------------------------------
    # Core generation method — every feature calls this
    # ------------------------------------------------------------------

    async def generate(
        self,
        prompt: str,
        feature: str,
        user_id: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> dict:
        """
        Call Gemini, time the request, and persist the interaction to MongoDB.

        Parameters
        ----------
        prompt             Full text sent to the model.
        feature            Tag for the feature that triggered this call:
                           "chat" | "healthcare" | "agriculture" |
                           "career" | "schemes" | "key_verify".
        user_id            Authenticated user's ID string.
        system_instruction Optional system prompt for this call only.
                           Does NOT mutate the shared self._model instance.
        temperature        Sampling temperature 0.0–1.0.
        max_tokens         Maximum output tokens.

        Returns
        -------
        dict  {"text": str, "latency_ms": float}

        Raises (never leaks raw SDK messages to callers)
        ------
        GeminiNotConfiguredError   GEMINI_API_KEY is blank
        GeminiKeyInvalidError      Key rejected by API (HTTP 400 InvalidArgument)
        GeminiQuotaExceededError   Quota / rate limit (HTTP 429)
        GeminiSafetyBlockError     Content policy block
        GeminiTimeoutError         Request timed out (HTTP 504)
        GeminiNetworkError         Service unavailable (HTTP 503/5xx)
        GeminiError                Any other AI error (HTTP 500)
        """
        # Deferred import avoids circular dependency at module load time
        # (ai_repository → db → settings, all of which are loaded before
        #  this method is ever called at runtime).
        from app.repositories.ai_repository import log_interaction

        self._ensure_initialized()

        # Key not configured — log failure record and raise immediately
        if self._model is None:
            await log_interaction(
                user_id=user_id,
                feature=feature,
                prompt=prompt,
                response="",
                success=False,
                latency_ms=0.0,
                error_type="GeminiNotConfiguredError",
            )
            raise GeminiNotConfiguredError()

        app_logger.info(
            f"Gemini call | feature={feature} user={user_id} "
            f"prompt_len={len(prompt)} temperature={temperature}"
        )

        start = time.monotonic()

        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )

            # Use a fresh model instance when a system instruction is given so
            # we never mutate the shared self._model object across requests.
            if system_instruction:
                model = genai.GenerativeModel(
                    "gemini-2.0-flash",
                    system_instruction=system_instruction,
                )
            else:
                model = self._model

            # Blocking SDK call runs in a thread — keeps the async event loop free
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=generation_config,
            )

            # Safety block: no candidates returned
            if not response.candidates:
                raise GeminiSafetyBlockError()

            # Safety block via finish_reason (3 = SAFETY, 4 = RECITATION)
            finish_reason = getattr(response.candidates[0], "finish_reason", None)
            if finish_reason in (3, 4):
                raise GeminiSafetyBlockError()

            text = response.text
            latency_ms = round((time.monotonic() - start) * 1000, 2)

            app_logger.info(
                f"Gemini success | feature={feature} latency={latency_ms}ms"
            )

            # Persist success record
            await log_interaction(
                user_id=user_id,
                feature=feature,
                prompt=prompt,
                response=text,
                success=True,
                latency_ms=latency_ms,
                error_type=None,
            )

            return {"text": text, "latency_ms": latency_ms}

        except GeminiError as typed_exc:
            # Already typed (e.g. GeminiSafetyBlockError raised above).
            # Log + persist with the correct subclass name, then re-raise.
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            error_type = type(typed_exc).__name__   # e.g. "GeminiSafetyBlockError"

            app_logger.warning(
                f"Gemini blocked | feature={feature} user={user_id} "
                f"error={error_type} latency={latency_ms}ms"
            )

            await log_interaction(
                user_id=user_id,
                feature=feature,
                prompt=prompt,
                response="",
                success=False,
                latency_ms=latency_ms,
                error_type=error_type,
            )
            raise  # re-raise the original typed exception unchanged

        except Exception as raw_exc:
            # Untyped SDK / network error — classify, log, persist, raise typed.
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            typed_exc = _classify_error(raw_exc)
            error_type = type(typed_exc).__name__

            # Server-side only: raw exception class (not message, not key)
            app_logger.error(
                f"Gemini error | feature={feature} user={user_id} "
                f"classified_as={error_type} latency={latency_ms}ms "
                f"raw_type={type(raw_exc).__name__}"
            )

            await log_interaction(
                user_id=user_id,
                feature=feature,
                prompt=prompt,
                response="",
                success=False,
                latency_ms=latency_ms,
                error_type=error_type,
            )

            raise typed_exc from None  # suppress raw SDK traceback from client

    # ------------------------------------------------------------------
    # Convenience wrappers — backward-compatible with existing routers
    # ------------------------------------------------------------------

    async def generate_response(
        self,
        prompt: str,
        feature: str = "unknown",
        user_id: str = "system",
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """
        Wrapper around generate() returning the text string directly.

        Existing routers call this method.  The new `feature` and `user_id`
        parameters default to safe fallback values so old call-sites continue
        to work; updated routers pass them explicitly.
        """
        result = await self.generate(
            prompt=prompt,
            feature=feature,
            user_id=user_id,
            system_instruction=system_instruction,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return result["text"]

    async def generate_chat_response(
        self,
        message: str,
        feature: str = "chat",
        user_id: str = "system",
        chat_history: Optional[list] = None,
        system_instruction: Optional[str] = None,
    ) -> str:
        """
        Build a history-aware prompt from chat_history, then delegate to
        generate().  Returns the response text string.
        """
        context = ""
        if chat_history:
            for msg in chat_history[-10:]:  # last 10 messages for context window
                role = "User" if msg["role"] == "user" else "Assistant"
                context += f"{role}: {msg['content']}\n"

        full_prompt = ""
        if system_instruction:
            full_prompt += f"{system_instruction}\n\n"
        if context:
            full_prompt += f"Previous conversation:\n{context}\n"
        full_prompt += f"User: {message}\nAssistant:"

        result = await self.generate(
            prompt=full_prompt,
            feature=feature,
            user_id=user_id,
            temperature=0.8,
            max_tokens=2048,
        )
        return result["text"]

    # ------------------------------------------------------------------
    # Key verification
    # ------------------------------------------------------------------

    async def verify_key(self) -> dict:
        """
        Send a minimal probe request to confirm the API key is valid and
        the service is reachable.

        Returns
        -------
        dict
            {
              "valid":      bool,
              "latency_ms": float,
              "error":      str | None   # None when valid=True
            }

        The API key value is never included in the return value or any log.
        """
        self._ensure_initialized()

        if self._model is None:
            return {"valid": False, "latency_ms": 0.0, "error": "GEMINI_API_KEY is not set"}

        try:
            result = await self.generate(
                prompt="Reply with exactly the single word: OK",
                feature="key_verify",
                user_id="system",
                temperature=0.0,
                max_tokens=5,
            )
            return {"valid": True, "latency_ms": result["latency_ms"], "error": None}

        except GeminiKeyInvalidError:
            return {"valid": False, "latency_ms": 0.0, "error": "API key is invalid or revoked"}
        except GeminiNotConfiguredError:
            return {"valid": False, "latency_ms": 0.0, "error": "GEMINI_API_KEY is not set"}
        except GeminiError as exc:
            return {"valid": False, "latency_ms": 0.0, "error": exc.client_message}


# ---------------------------------------------------------------------------
# Module-level singleton — the only instance that should ever exist
# ---------------------------------------------------------------------------
gemini_service = GeminiService()
