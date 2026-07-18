"""
Groq AI Service

Handles all interactions with the Groq API for fast LLM inference.
Uses the official groq Python SDK with the Chat Completions API.

Authentication: Requires a Groq API key.
Get one at: https://console.groq.com/keys
"""

import asyncio
from typing import Optional, AsyncGenerator

from groq import Groq, APIConnectionError, APIStatusError, RateLimitError, APITimeoutError

from app.core.config import settings
from app.core.logger import app_logger

# Primary model — best quality/speed balance on Groq
PRIMARY_MODEL = "llama-3.3-70b-versatile"
# Fallback model — smaller, faster, used if primary is unavailable
FALLBACK_MODEL = "llama-3.1-8b-instant"

# Max tokens for responses
DEFAULT_MAX_TOKENS = 2048
# Request timeout in seconds
REQUEST_TIMEOUT = 60.0


def validate_groq_api_key(key: str) -> tuple[bool, str]:
    """
    Validate that GROQ_API_KEY is present and has the expected format.

    Groq API keys start with 'gsk_'.

    Returns:
        (is_valid: bool, reason: str)
    """
    if not key:
        return False, (
            "GROQ_API_KEY is empty or not set. "
            "Get a key at: https://console.groq.com/keys"
        )

    if not key.startswith("gsk_"):
        return False, (
            f"GROQ_API_KEY has unexpected format (starts with '{key[:6]}...'). "
            "Expected a Groq API key starting with 'gsk_'. "
            "Get a key at: https://console.groq.com/keys"
        )

    if len(key) < 40:
        return False, "GROQ_API_KEY is too short to be a valid Groq API key."

    return True, "Key format is valid."


class GroqService:
    """
    Service for interacting with Groq's LLM API.

    Provides the same public interface as the previous GeminiService
    so all routers continue working without modification:
        - generate_response()
        - generate_chat_response()
        - stream_response()
    """

    def __init__(self):
        self._client: Optional[Groq] = None
        self._initialized = False
        self._active_model = PRIMARY_MODEL

    def _ensure_initialized(self):
        """
        Lazy-initialize the Groq client after .env is loaded.
        Validates the API key format before creating the client.
        """
        if self._initialized:
            return
        self._initialized = True

        is_valid, reason = validate_groq_api_key(settings.GROQ_API_KEY)
        if not is_valid:
            app_logger.error(f"[GroqService] Invalid API key — {reason}")
            self._client = None
            return

        self._client = Groq(
            api_key=settings.GROQ_API_KEY,
            timeout=REQUEST_TIMEOUT,
            max_retries=2,
        )
        app_logger.info(
            f"[GroqService] Initialized — primary model: {PRIMARY_MODEL}, "
            f"fallback: {FALLBACK_MODEL}"
        )

    def _build_messages(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> list[dict]:
        """
        Build the messages array for Groq Chat Completions API.

        Structure:
            [system]          <- optional system instruction
            [history...]      <- previous user/assistant turns
            [user: prompt]    <- current user message
        """
        messages = []

        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})

        if chat_history:
            for msg in chat_history:
                role = msg.get("role", "user")
                # Normalise role — Groq only accepts "user" or "assistant"
                if role not in ("user", "assistant"):
                    role = "user"
                messages.append({"role": role, "content": msg["content"]})

        messages.append({"role": "user", "content": prompt})
        return messages

    async def _call_groq(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        model: Optional[str] = None,
    ) -> str:
        """
        Internal method — runs the blocking Groq SDK call in a thread pool.

        Tries PRIMARY_MODEL first; falls back to FALLBACK_MODEL automatically
        if the primary is unavailable or returns a model-not-found error.
        """
        target_model = model or self._active_model

        def _sync_call(mdl: str) -> str:
            completion = self._client.chat.completions.create(
                model=mdl,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return completion.choices[0].message.content

        try:
            return await asyncio.to_thread(_sync_call, target_model)

        except APIStatusError as e:
            # Model not found or decommissioned — try fallback
            if e.status_code == 404 and target_model == PRIMARY_MODEL:
                app_logger.warning(
                    f"[GroqService] Primary model '{PRIMARY_MODEL}' unavailable "
                    f"(404). Falling back to '{FALLBACK_MODEL}'."
                )
                self._active_model = FALLBACK_MODEL
                return await asyncio.to_thread(_sync_call, FALLBACK_MODEL)
            raise

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ) -> str:
        """
        Generate a single text response from Groq.

        Drop-in replacement for GeminiService.generate_response().
        """
        self._ensure_initialized()
        if not self._client:
            raise Exception(
                "Groq client is not initialised. "
                "Set a valid gsk_... key in GROQ_API_KEY. "
                "See: https://console.groq.com/keys"
            )

        try:
            app_logger.info(
                f"[GroqService] generate_response — prompt length: {len(prompt)}, "
                f"model: {self._active_model}"
            )

            messages = self._build_messages(prompt, system_instruction=system_instruction)
            result = await self._call_groq(messages, temperature=temperature, max_tokens=max_tokens)

            app_logger.info("[GroqService] Response generated successfully")
            return result

        except RateLimitError as e:
            app_logger.error(f"[GroqService] Rate limit exceeded: {e}")
            raise Exception("AI service is temporarily busy. Please try again in a moment.")

        except APITimeoutError as e:
            app_logger.error(f"[GroqService] Request timed out: {e}")
            raise Exception("AI request timed out. Please try again.")

        except APIConnectionError as e:
            app_logger.error(f"[GroqService] Connection error: {e}")
            raise Exception("Cannot connect to AI service. Check your internet connection.")

        except APIStatusError as e:
            app_logger.error(f"[GroqService] API status error {e.status_code}: {e.message}")
            raise Exception(f"AI service error ({e.status_code}): {e.message}")

        except Exception as e:
            app_logger.error(f"[GroqService] Unexpected error: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")

    async def generate_chat_response(
        self,
        message: str,
        chat_history: Optional[list] = None,
        system_instruction: Optional[str] = None,
    ) -> str:
        """
        Generate a context-aware chat response using full conversation history.

        Drop-in replacement for GeminiService.generate_chat_response().

        Groq natively supports multi-turn conversation through the messages array,
        so we pass history directly instead of manually building a prompt string.
        """
        self._ensure_initialized()
        if not self._client:
            raise Exception(
                "Groq client is not initialised. "
                "Set a valid gsk_... key in GROQ_API_KEY."
            )

        try:
            history_len = len(chat_history) if chat_history else 0
            app_logger.info(
                f"[GroqService] generate_chat_response — "
                f"history messages: {history_len}, model: {self._active_model}"
            )

            # Use last 20 messages for context (10 turns = 20 messages)
            recent_history = (chat_history or [])[-20:]

            messages = self._build_messages(
                prompt=message,
                system_instruction=system_instruction,
                chat_history=recent_history,
            )

            result = await self._call_groq(
                messages,
                temperature=0.8,
                max_tokens=DEFAULT_MAX_TOKENS,
            )

            app_logger.info("[GroqService] Chat response generated successfully")
            return result

        except RateLimitError as e:
            app_logger.error(f"[GroqService] Rate limit exceeded: {e}")
            raise Exception("AI service is temporarily busy. Please try again in a moment.")

        except APITimeoutError as e:
            app_logger.error(f"[GroqService] Request timed out: {e}")
            raise Exception("AI request timed out. Please try again.")

        except APIConnectionError as e:
            app_logger.error(f"[GroqService] Connection error: {e}")
            raise Exception("Cannot connect to AI service. Check your internet connection.")

        except APIStatusError as e:
            app_logger.error(f"[GroqService] API status error {e.status_code}: {e.message}")
            raise Exception(f"AI service error ({e.status_code}): {e.message}")

        except Exception as e:
            app_logger.error(f"[GroqService] Chat generation error: {str(e)}")
            raise

    async def stream_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response chunk by chunk.

        Drop-in replacement for GeminiService.stream_response().
        Runs the blocking SDK call in a thread to avoid blocking the event loop.
        """
        self._ensure_initialized()
        if not self._client:
            raise Exception("Groq client is not initialised.")

        try:
            app_logger.info(
                f"[GroqService] stream_response — model: {self._active_model}"
            )

            messages = self._build_messages(prompt, system_instruction=system_instruction)

            def _sync_stream():
                return self._client.chat.completions.create(
                    model=self._active_model,
                    messages=messages,
                    stream=True,
                    max_tokens=DEFAULT_MAX_TOKENS,
                )

            stream = await asyncio.to_thread(_sync_stream)

            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta

        except Exception as e:
            app_logger.error(f"[GroqService] Streaming error: {str(e)}")
            raise


async def startup_groq_validation() -> bool:
    """
    Run at application startup to validate the Groq API key and
    confirm the client can reach the API before serving traffic.

    Returns True if healthy, False if misconfigured.
    """
    app_logger.info("[GroqService] Running startup API key validation...")

    is_valid, reason = validate_groq_api_key(settings.GROQ_API_KEY)
    if not is_valid:
        app_logger.error(f"[GroqService] STARTUP VALIDATION FAILED — {reason}")
        app_logger.error(
            "[GroqService] AI features will be unavailable until GROQ_API_KEY "
            "is set correctly in .env. Restart the server after fixing."
        )
        return False

    # Trigger client initialization
    groq_service._ensure_initialized()
    if not groq_service._client:
        app_logger.error("[GroqService] STARTUP VALIDATION FAILED — client not initialized.")
        return False

    # Send a minimal test request to confirm the key actually works
    try:
        test_response = await groq_service.generate_response(
            prompt="Say 'ok' in one word.",
            max_tokens=5,
            temperature=0.0,
        )
        app_logger.info(
            f"[GroqService] STARTUP VALIDATION PASSED — "
            f"test response: '{test_response.strip()}' | "
            f"active model: {groq_service._active_model}"
        )
        return True

    except Exception as e:
        app_logger.error(
            f"[GroqService] STARTUP VALIDATION FAILED — test request failed: {e}"
        )
        app_logger.error(
            "[GroqService] Check that your gsk_... key is active and has not "
            "exceeded its quota at: https://console.groq.com/keys"
        )
        return False


# Singleton instance — imported by all routers
groq_service = GroqService()
