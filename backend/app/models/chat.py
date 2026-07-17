"""
Chat Data Models

MongoDB document structures for chat conversations and messages.
"""

from datetime import datetime
from typing import List, Optional


class ChatModel:
    """Chat conversation model"""
    
    @staticmethod
    def create_conversation(
        user_id: str,
        title: str = "New Conversation",
        category: Optional[str] = None
    ) -> dict:
        """
        Create a new chat conversation document.
        
        Args:
            user_id: User's ID
            title: Conversation title
            category: Optional category (general, schemes, health, agriculture, career)
            
        Returns:
            Chat conversation document
        """
        return {
            "user_id": user_id,
            "title": title,
            "category": category or "general",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "message_count": 0
        }
    
    @staticmethod
    def create_message(
        conversation_id: str,
        role: str,
        content: str,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Create a chat message document.
        
        Args:
            conversation_id: Parent conversation ID
            role: Message role (user or assistant)
            content: Message content
            metadata: Optional metadata (tokens, model, etc.)
            
        Returns:
            Message document
        """
        return {
            "conversation_id": conversation_id,
            "role": role,  # "user" or "assistant"
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.utcnow()
        }
