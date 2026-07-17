from app.db.database import db
from app.core.logger import app_logger


users_collection = db["users"]


async def initialize_indexes():
    """Create database indexes for optimized queries"""
    try:
        await users_collection.create_index("email", unique=True)
        app_logger.info("User collection indexes created successfully")
    except Exception as e:
        app_logger.warning(f"Index creation skipped or failed: {str(e)}")


async def create_user(user_data: dict):
    result = await users_collection.insert_one(user_data)
    return str(result.inserted_id)


async def get_user_by_email(email: str):
    user = await users_collection.find_one(
        {"email": email}
    )
    return user


async def get_user_by_id(user_id: str):
    """
    Fetch user by ObjectId
    
    Args:
        user_id: User's MongoDB ObjectId as string
        
    Returns:
        User document or None
    """
    from bson import ObjectId
    
    try:
        user = await users_collection.find_one(
            {"_id": ObjectId(user_id)}
        )
        return user
    except Exception as e:
        app_logger.error(f"Error fetching user by ID: {str(e)}")
        return None