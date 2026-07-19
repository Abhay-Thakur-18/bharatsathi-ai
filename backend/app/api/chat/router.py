"""
Chat API Router

Endpoints for AI-powered chat conversations.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional

from app.schemas.chat import (
    ChatMessageCreate,
    ChatResponse,
    ConversationHistoryResponse,
    ConversationListResponse,
    MessageResponse,
    ConversationResponse,
    UpdateConversationTitle
)
from app.models.chat import ChatModel
from app.repositories import chat_repository
from app.services.gemini_service import gemini_service
from app.core.exceptions import GeminiError
from app.utils.gemini_error_handler import raise_gemini_http_error
from app.dependencies.auth import get_current_user_id
from app.core.logger import app_logger


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)


SYSTEM_INSTRUCTION = """You are BharatSathi AI, a helpful multilingual assistant for Indian citizens.
You help with government schemes, healthcare guidance, agriculture support, and career guidance.
Be concise, accurate, and culturally aware. Provide information in a friendly, accessible manner.
If you don't know something, admit it and suggest where the user might find accurate information."""


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    chat_data: ChatMessageCreate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Send a message and get AI response.
    
    Creates a new conversation if conversation_id is not provided.
    Maintains conversation history for context-aware responses.
    """
    app_logger.info(f"Chat request from user: {user_id}")
    
    try:
        # Get or create conversation
        conversation_id = chat_data.conversation_id
        
        if conversation_id:
            # Verify conversation exists and belongs to user
            conversation = await chat_repository.get_conversation_by_id(conversation_id)
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
            if conversation["user_id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this conversation"
                )
        else:
            # Create new conversation
            conversation_data = ChatModel.create_conversation(
                user_id=user_id,
                title=chat_data.message[:50] + "..." if len(chat_data.message) > 50 else chat_data.message,
                category=chat_data.category
            )
            conversation_id = await chat_repository.create_conversation(conversation_data)
            app_logger.info(f"New conversation created: {conversation_id}")
        
        # Save user message
        user_message_data = ChatModel.create_message(
            conversation_id=conversation_id,
            role="user",
            content=chat_data.message
        )
        user_message_id = await chat_repository.create_message(user_message_data)
        
        # Get conversation history for context
        history = await chat_repository.get_recent_messages(conversation_id, limit=10)
        chat_history = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in history
        ]
        
        # Generate AI response
        try:
            ai_response = await gemini_service.generate_chat_response(
                message=chat_data.message,
                feature="chat",
                user_id=user_id,
                chat_history=chat_history,
                system_instruction=SYSTEM_INSTRUCTION
            )
        except GeminiError as exc:
            raise_gemini_http_error(exc, context="chat/send_message")
        
        # Save assistant message
        assistant_message_data = ChatModel.create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_response
        )
        assistant_message_id = await chat_repository.create_message(assistant_message_data)
        
        # Update conversation timestamp
        await chat_repository.update_conversation_timestamp(conversation_id)
        
        app_logger.info(f"Chat response generated for conversation: {conversation_id}")
        
        return {
            "conversation_id": conversation_id,
            "user_message": {
                "id": user_message_id,
                "role": "user",
                "content": chat_data.message,
                "created_at": user_message_data["created_at"]
            },
            "assistant_message": {
                "id": assistant_message_id,
                "role": "assistant",
                "content": ai_response,
                "created_at": assistant_message_data["created_at"]
            }
        }
    
    except HTTPException:
        raise
    except GeminiError as exc:
        raise_gemini_http_error(exc, context="chat/send_message")
    except Exception as exc:
        app_logger.error(f"Chat error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message.",
        )


@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    skip: int = 0,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all conversations for the current user.
    
    Returns conversations sorted by most recent activity.
    """
    conversations = await chat_repository.get_user_conversations(user_id, skip, limit)
    total = await chat_repository.count_user_conversations(user_id)
    
    return {
        "conversations": [
            {
                "id": str(conv["_id"]),
                "title": conv["title"],
                "category": conv["category"],
                "message_count": conv["message_count"],
                "created_at": conv["created_at"],
                "updated_at": conv["updated_at"]
            }
            for conv in conversations
        ],
        "total": total
    }


@router.get("/conversations/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific conversation with all messages.
    """
    # Verify conversation exists and belongs to user
    conversation = await chat_repository.get_conversation_by_id(conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if conversation["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )
    
    # Get all messages
    messages = await chat_repository.get_conversation_messages(conversation_id)
    
    return {
        "conversation": {
            "id": str(conversation["_id"]),
            "title": conversation["title"],
            "category": conversation["category"],
            "message_count": conversation["message_count"],
            "created_at": conversation["created_at"],
            "updated_at": conversation["updated_at"]
        },
        "messages": [
            {
                "id": str(msg["_id"]),
                "role": msg["role"],
                "content": msg["content"],
                "created_at": msg["created_at"]
            }
            for msg in messages
        ]
    }


@router.patch("/conversations/{conversation_id}/title")
async def update_conversation_title_endpoint(
    conversation_id: str,
    data: UpdateConversationTitle,
    user_id: str = Depends(get_current_user_id)
):
    """Update conversation title"""
    # Verify ownership
    conversation = await chat_repository.get_conversation_by_id(conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if conversation["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this conversation"
        )
    
    # Update title
    success = await chat_repository.update_conversation_title(conversation_id, data.title)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update conversation title"
        )
    
    return {"message": "Title updated successfully"}


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation_endpoint(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a conversation and all its messages"""
    # Verify ownership
    conversation = await chat_repository.get_conversation_by_id(conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if conversation["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this conversation"
        )
    
    # Delete conversation
    success = await chat_repository.delete_conversation(conversation_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )
    
    app_logger.info(f"Conversation deleted: {conversation_id}")
