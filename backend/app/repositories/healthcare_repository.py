"""
Healthcare Repository

Database operations for the 'healthcare_queries' collection.
Persists every symptom check and health question for analytics / history.
"""

from bson import ObjectId
from datetime import datetime
from typing import Optional, List

from app.db.database import db
from app.core.logger import app_logger


healthcare_collection = db["healthcare_queries"]


async def initialize_healthcare_indexes() -> None:
    """Create indexes for healthcare_queries collection."""
    try:
        await healthcare_collection.create_index("user_id")
        await healthcare_collection.create_index("query_type")
        await healthcare_collection.create_index([("user_id", 1), ("created_at", -1)])
        app_logger.info("Healthcare collection indexes created successfully")
    except Exception as exc:
        app_logger.warning(f"Healthcare index creation skipped or failed: {exc}")


async def log_healthcare_query(
    user_id: str,
    query_type: str,
    query_data: dict,
    response_data: dict,
) -> str:
    """
    Persist a healthcare query and its AI response.

    Args:
        user_id: Authenticated user's ID
        query_type: 'symptom_check' | 'health_question'
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
    result = await healthcare_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_user_healthcare_history(
    user_id: str,
    skip: int = 0,
    limit: int = 20,
) -> List[dict]:
    """Return paginated healthcare query history for a user."""
    try:
        cursor = healthcare_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching healthcare history: {exc}")
        return []


async def count_user_healthcare_queries(user_id: str) -> int:
    """Count total healthcare queries for a user."""
    return await healthcare_collection.count_documents({"user_id": user_id})


async def get_query_by_id(query_id: str) -> Optional[dict]:
    """Fetch a single healthcare query document."""
    try:
        return await healthcare_collection.find_one({"_id": ObjectId(query_id)})
    except Exception as exc:
        app_logger.error(f"Error fetching healthcare query '{query_id}': {exc}")
        return None
