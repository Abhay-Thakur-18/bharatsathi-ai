"""
Google Gemini AI Service

Handles all interactions with Google's Gemini AI API for chat and text generation.
"""

from typing import Optional, AsyncGenerator
import google.generativeai as genai

from app.core.config import settings
from app.core.logger import app_logger


class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        """Initialize Gemini AI with API key"""
        if not settings.GEMINI_API_KEY:
            app_logger.warning("GEMINI_API_KEY not set in environment")
            self.model = None
            return
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        app_logger.info("Gemini AI service initialized")
    
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """
        Generate a text response from Gemini AI.
        
        Args:
            prompt: User's input prompt
            system_instruction: Optional system instruction to guide the model
            temperature: Randomness in response (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated text response
            
        Raises:
            Exception: If API call fails
        """
        if not self.model:
            raise Exception("Gemini API key not configured")
        
        try:
            app_logger.info(f"Generating response for prompt (length: {len(prompt)})")
            
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            if system_instruction:
                model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
            else:
                response = self.model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
            
            app_logger.info("Response generated successfully")
            return response.text
        
        except Exception as e:
            app_logger.error(f"Gemini API error: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")
    
    async def generate_chat_response(
        self,
        message: str,
        chat_history: Optional[list] = None,
        system_instruction: Optional[str] = None
    ) -> str:
        """
        Generate a chat response with conversation history.
        
        Args:
            message: Current user message
            chat_history: List of previous messages (user/assistant pairs)
            system_instruction: Optional system instruction
            
        Returns:
            Generated response text
        """
        if not self.model:
            raise Exception("Gemini API key not configured")
        
        try:
            app_logger.info(f"Generating chat response with history: {len(chat_history or [])}")
            
            # Build context from history
            context = ""
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    role = "User" if msg["role"] == "user" else "Assistant"
                    context += f"{role}: {msg['content']}\n"
            
            # Combine system instruction, context, and current message
            full_prompt = ""
            if system_instruction:
                full_prompt += f"{system_instruction}\n\n"
            if context:
                full_prompt += f"Previous conversation:\n{context}\n"
            full_prompt += f"User: {message}\nAssistant:"
            
            response = await self.generate_response(
                full_prompt,
                temperature=0.8,
                max_tokens=2048
            )
            
            return response
        
        except Exception as e:
            app_logger.error(f"Chat generation error: {str(e)}")
            raise
    
    async def stream_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response chunk by chunk (for future real-time chat).
        
        Args:
            prompt: User's input prompt
            system_instruction: Optional system instruction
            
        Yields:
            Text chunks as they are generated
        """
        if not self.model:
            raise Exception("Gemini API key not configured")
        
        try:
            app_logger.info("Starting streaming response")
            
            if system_instruction:
                model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
                response = model.generate_content(prompt, stream=True)
            else:
                response = self.model.generate_content(prompt, stream=True)
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            app_logger.error(f"Streaming error: {str(e)}")
            raise


# Singleton instance
gemini_service = GeminiService()
