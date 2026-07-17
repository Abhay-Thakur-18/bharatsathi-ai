"""
Chat Schemas

Request/response models for chat API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageCreate(BaseModel):
    """Schema for creating a new chat message"""
    message: str = Field(..., min_length=1, max_length=4000, description="User's message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID (optional)")
    category: Optional[str] = Field("general", description="Chat category")


class MessageResponse(BaseModel):
    """Schema for a single message"""
    id: str
    role: str
    content: str
    created_at: datetime


class ConversationResponse(BaseModel):
    """Schema for conversation metadata"""
    id: str
    title: str
    category: str
    message_count: int
    created_at: datetime
    updated_at: datetime


class ChatResponse(BaseModel):
    """Schema for chat API response"""
    conversation_id: str
    user_message: MessageResponse
    assistant_message: MessageResponse


class ConversationHistoryResponse(BaseModel):
    """Schema for conversation history with messages"""
    conversation: ConversationResponse
    messages: List[MessageResponse]


class ConversationListResponse(BaseModel):
    """Schema for listing conversations"""
    conversations: List[ConversationResponse]
    total: int


class UpdateConversationTitle(BaseModel):
    """Schema for updating conversation title"""
    title: str = Field(..., min_length=1, max_length=200)
