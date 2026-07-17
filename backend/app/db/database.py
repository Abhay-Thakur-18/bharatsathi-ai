from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings


client = AsyncIOMotorClient(settings.MONGODB_URI)

database = client[settings.DATABASE_NAME]


async def get_database():
    return database