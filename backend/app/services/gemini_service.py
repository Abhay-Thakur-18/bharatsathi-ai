"""
Google Gemini AI Service

Handles all interactions with Google's Gemini AI API for chat and text generation.
Uses the google-generativeai SDK (Google AI Studio).

Authentication: Requires a Google AI Studio API key (starts with AIza...).
Get one at: https://aistudio.google.com/app/apikey
"""

import asyncio
from typing import Optional, AsyncGenerator
import google.generativeai as genai

from app.core.config import settings
from app.core.logger import app_logger

# The single model name used throughout — change here to affect all methods
GEMINI_MODEL = "gemini-2.0-flash"


def validate_gemini_api_key(key: str) -> tuple[bool, str]:
    """
    Validate that the GEMINI_API_KEY is the correct type for this SDK.

    google-generativeai (Google AI Studio) requires keys that start with 'AIza'.
    Keys starting with 'AQ.' or 'ya29.' are OAuth access tokens — wrong type.

    Returns:
        (is_valid: bool, reason: str)
    """
    if not key:
        return False, "GEMINI_API_KEY is empty or not set."

    if key.startswith("AQ.") or key.startswith("ya29."):
        return False, (
            "GEMINI_API_KEY appears to be an OAuth access token (starts with 'AQ.' or 'ya29.'). "
            "The google-generativeai SDK requires a Google AI Studio API key starting with 'AIza'. "
            "Get the correct key at: https://aistudio.google.com/app/apikey"
        )

    if not key.startswith("AIza"):
        return False, (
            f"GEMINI_API_KEY has unexpected format (starts with '{key[:6]}...'). "
            "Expected a Google AI Studio API key starting with 'AIza'. "
            "Get the correct key at: https://aistudio.google.com/app/apikey"
        )

    if len(key) < 30:
        return False, "GEMINI_API_KEY is too short to be a valid Google AI Studio key."

    return True, "Key format is valid."


class GeminiService:
    """Service for interacting with Google Gemini AI (Google AI Studio)."""

    def __init__(self):
        self.model = None
        self._initialized = False

    def _ensure_initialized(self):
        """
        Lazy-initialize Gemini so the API key is read after .env is loaded.
        Validates key format before attempting to configure the SDK.
        """
        if self._initialized:
            return
        self._initialized = True

        is_valid, reason = validate_gemini_api_key(settings.GEMINI_API_KEY)
        if not is_valid:
            app_logger.error(f"[GeminiService] Invalid API key — {reason}")
            self.model = None
            return

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        app_logger.info(f"[GeminiService] Initialized with model: {GEMINI_MODEL}")

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate a single response from Gemini."""
        self._ensure_initialized()
        if not self.model:
            raise Exception(
                "Gemini API key is not configured or is invalid. "
                "Set a valid AIza... key in GEMINI_API_KEY. "
                "See: https://aistudio.google.com/app/apikey"
            )

        try:
            app_logger.info(f"[GeminiService] Generating response (prompt length: {len(prompt)})")

            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )

            # Use system_instruction via GenerativeModel param — not injected into prompt string
            if system_instruction:
                model = genai.GenerativeModel(
                    GEMINI_MODEL,
                    system_instruction=system_instruction
                )
            else:
                model = self.model

            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=generation_config
            )

            app_logger.info("[GeminiService] Response generated successfully")
            return response.text

        except Exception as e:
            app_logger.error(f"[GeminiService] API error: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")

    async def generate_chat_response(
        self,
        message: str,
        chat_history: Optional[list] = None,
        system_instruction: Optional[str] = None
    ) -> str:
        """Generate a context-aware chat response using conversation history."""
        self._ensure_initialized()
        if not self.model:
            raise Exception(
                "Gemini API key is not configured or is invalid. "
                "Set a valid AIza... key in GEMINI_API_KEY."
            )

        try:
            app_logger.info(
                f"[GeminiService] Generating chat response "
                f"(history messages: {len(chat_history or [])})"
            )

            # Build conversation context from last 10 messages
            context = ""
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "User" if msg["role"] == "user" else "Assistant"
                    context += f"{role}: {msg['content']}\n"

            # Compose full prompt — system instruction is passed to generate_response
            # which applies it via GenerativeModel's system_instruction parameter
            full_prompt = ""
            if context:
                full_prompt += f"Previous conversation:\n{context}\n"
            full_prompt += f"User: {message}\nAssistant:"

            response = await self.generate_response(
                full_prompt,
                system_instruction=system_instruction,
                temperature=0.8,
                max_tokens=2048
            )

            return response

        except Exception as e:
            app_logger.error(f"[GeminiService] Chat generation error: {str(e)}")
            raise

    async def stream_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response chunk by chunk.
        Wrapped in asyncio.to_thread to avoid blocking the async event loop.
        """
        self._ensure_initialized()
        if not self.model:
            raise Exception("Gemini API key is not configured or is invalid.")

        try:
            app_logger.info("[GeminiService] Starting streaming response")

            model = (
                genai.GenerativeModel(GEMINI_MODEL, system_instruction=system_instruction)
                if system_instruction
                else self.model
            )

            # Run sync streaming call in a thread
            response = await asyncio.to_thread(
                model.generate_content, prompt, stream=True
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            app_logger.error(f"[GeminiService] Streaming error: {str(e)}")
            raise


async def startup_gemini_validation() -> bool:
    """
    Run on application startup to validate the Gemini API key and
    confirm the SDK can reach the API before the server accepts traffic.

    Returns True if healthy, False if misconfigured.
    Call this inside the FastAPI lifespan startup block.
    """
    app_logger.info("[GeminiService] Running startup API key validation...")

    is_valid, reason = validate_gemini_api_key(settings.GEMINI_API_KEY)
    if not is_valid:
        app_logger.error(f"[GeminiService] STARTUP VALIDATION FAILED — {reason}")
        app_logger.error(
            "[GeminiService] AI features will be unavailable. "
            "Fix GEMINI_API_KEY in .env and restart."
        )
        return False

    # Trigger initialization
    gemini_service._ensure_initialized()
    if not gemini_service.model:
        app_logger.error("[GeminiService] STARTUP VALIDATION FAILED — model not initialized.")
        return False

    # Send a minimal test request to confirm the key actually works
    try:
        test_response = await asyncio.to_thread(
            gemini_service.model.generate_content,
            "Say 'ok' in one word.",
            generation_config=genai.types.GenerationConfig(max_output_tokens=5)
        )
        app_logger.info(
            f"[GeminiService] STARTUP VALIDATION PASSED — "
            f"test response: '{test_response.text.strip()}'"
        )
        return True
    except Exception as e:
        app_logger.error(f"[GeminiService] STARTUP VALIDATION FAILED — test request failed: {e}")
        app_logger.error(
            "[GeminiService] Check that your AIza... key is active, not rate-limited, "
            "and has the Generative Language API enabled in Google Cloud Console."
        )
        return False


# Singleton instance
gemini_service = GeminiService()
