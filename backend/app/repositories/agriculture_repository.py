"""
Agriculture Repository

Database operations for the 'agriculture_queries' collection.
Persists every crop advice, pest identification, and fertilizer query.
"""

from bson import ObjectId
from datetime import datetime
from typing import Optional, List

from app.db.database import db
from app.core.logger import app_logger


agriculture_collection = db["agriculture_queries"]


async def initialize_agriculture_indexes() -> None:
    """Create indexes for agriculture_queries collection."""
    try:
        await agriculture_collection.create_index("user_id")
        await agriculture_collection.create_index("query_type")
        await agriculture_collection.create_index([("user_id", 1), ("created_at", -1)])
        app_logger.info("Agriculture collection indexes created successfully")
    except Exception as exc:
        app_logger.warning(f"Agriculture index creation skipped or failed: {exc}")


async def log_agriculture_query(
    user_id: str,
    query_type: str,
    query_data: dict,
    response_data: dict,
) -> str:
    """
    Persist an agriculture query and its AI response.

    Args:
        user_id: Authenticated user's ID
        query_type: 'crop_advice' | 'pest_disease' | 'fertilizer'
        query_data: Original request payload
        response_data: AI-generated response

    Returns:
        Inserted document _id as string
    """
    doc = {
        "user_id": user_id,
        "query_type": query_type,
        "query_data": query_data,
        "response_data": response_data,
        "created_at": datetime.utcnow(),
    }
    result = await agriculture_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_user_agriculture_history(
    user_id: str,
    skip: int = 0,
    limit: int = 20,
) -> List[dict]:
    """Return paginated agriculture query history for a user."""
    try:
        cursor = agriculture_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching agriculture history: {exc}")
        return []


async def count_user_agriculture_queries(user_id: str) -> int:
    """Count total agriculture queries for a user."""
    return await agriculture_collection.count_documents({"user_id": user_id})


async def get_query_by_id(query_id: str) -> Optional[dict]:
    """Fetch a single agriculture query document."""
    try:
        return await agriculture_collection.find_one({"_id": ObjectId(query_id)})
    except Exception as exc:
        app_logger.error(f"Error fetching agriculture query '{query_id}': {exc}")
        return None
