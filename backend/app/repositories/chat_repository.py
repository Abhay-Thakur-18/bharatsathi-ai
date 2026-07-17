"""
Chat Repository

Database operations for chat conversations and messages.
"""

from bson import ObjectId
from typing import Optional, List
from datetime import datetime

from app.db.database import db
from app.core.logger import app_logger


conversations_collection = db["conversations"]
messages_collection = db["messages"]


async def initialize_chat_indexes():
    """Create database indexes for chat collections"""
    try:
        # Conversations indexes
        await conversations_collection.create_index("user_id")
        await conversations_collection.create_index([("user_id", 1), ("updated_at", -1)])
        
        # Messages indexes
        await messages_collection.create_index("conversation_id")
        await messages_collection.create_index([("conversation_id", 1), ("created_at", 1)])
        
        app_logger.info("Chat collection indexes created successfully")
    except Exception as e:
        app_logger.warning(f"Chat index creation skipped or failed: {str(e)}")


# Conversation Operations

async def create_conversation(conversation_data: dict) -> str:
    """Create a new conversation"""
    result = await conversations_collection.insert_one(conversation_data)
    return str(result.inserted_id)


async def get_conversation_by_id(conversation_id: str) -> Optional[dict]:
    """Get conversation by ID"""
    try:
        conversation = await conversations_collection.find_one(
            {"_id": ObjectId(conversation_id)}
        )
        return conversation
    except Exception as e:
        app_logger.error(f"Error fetching conversation: {str(e)}")
        return None


async def get_user_conversations(
    user_id: str,
    skip: int = 0,
    limit: int = 50
) -> List[dict]:
    """
    Get all conversations for a user, sorted by most recent.
    
    Args:
        user_id: User's ID
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
        
    Returns:
        List of conversation documents
    """
    cursor = conversations_collection.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).skip(skip).limit(limit)
    
    conversations = await cursor.to_list(length=limit)
    return conversations


async def count_user_conversations(user_id: str) -> int:
    """Count total conversations for a user"""
    count = await conversations_collection.count_documents({"user_id": user_id})
    return count


async def update_conversation_title(conversation_id: str, title: str) -> bool:
    """Update conversation title"""
    try:
        result = await conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "title": title,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        app_logger.error(f"Error updating conversation title: {str(e)}")
        return False


async def update_conversation_timestamp(conversation_id: str):
    """Update conversation's updated_at timestamp"""
    try:
        await conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {"updated_at": datetime.utcnow()},
                "$inc": {"message_count": 1}
            }
        )
    except Exception as e:
        app_logger.error(f"Error updating conversation timestamp: {str(e)}")


async def delete_conversation(conversation_id: str) -> bool:
    """Delete a conversation and all its messages"""
    try:
        # Delete all messages
        await messages_collection.delete_many({"conversation_id": conversation_id})
        
        # Delete conversation
        result = await conversations_collection.delete_one(
            {"_id": ObjectId(conversation_id)}
        )
        
        return result.deleted_count > 0
    except Exception as e:
        app_logger.error(f"Error deleting conversation: {str(e)}")
        return False


# Message Operations

async def create_message(message_data: dict) -> str:
    """Create a new message"""
    result = await messages_collection.insert_one(message_data)
    return str(result.inserted_id)


async def get_conversation_messages(
    conversation_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    """
    Get all messages for a conversation, sorted chronologically.
    
    Args:
        conversation_id: Conversation ID
        skip: Number of messages to skip
        limit: Maximum messages to return
        
    Returns:
        List of message documents
    """
    cursor = messages_collection.find(
        {"conversation_id": conversation_id}
    ).sort("created_at", 1).skip(skip).limit(limit)
    
    messages = await cursor.to_list(length=limit)
    return messages


async def count_conversation_messages(conversation_id: str) -> int:
    """Count total messages in a conversation"""
    count = await messages_collection.count_documents(
        {"conversation_id": conversation_id}
    )
    return count


async def get_recent_messages(conversation_id: str, limit: int = 10) -> List[dict]:
    """Get most recent messages for context"""
    cursor = messages_collection.find(
        {"conversation_id": conversation_id}
    ).sort("created_at", -1).limit(limit)
    
    messages = await cursor.to_list(length=limit)
    return list(reversed(messages))  # Return in chronological order
