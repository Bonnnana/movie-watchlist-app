import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    'mongodb://username:pass123@movie-watchlist-mongodb:27017/movie_watchlist?authSource=movie_watchlist'
)

client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None

async def connect_to_database():
    """Create database connection to the database"""
    global client, database
    try:
        client = AsyncIOMotorClient(DATABASE_URL)
        database = client.movie_watchlist
        
        await client.admin.command('ping')
        logger.info("Connected to database successfully")
        
        return database
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        raise

async def close_database_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        logger.info("Disconnected from database")

async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance from the database"""
    global database
    if database is None:
        await connect_to_database()
    return database

async def verify_database_connection():
    """Verify database connection and log status"""
    try:
        db = await get_database()
        
        await db.command("ping")
        logger.info("Database connection verified")
        
        movies_count = await db.movies.count_documents({})
        logger.info(f"Movies collection contains {movies_count} documents")
        
        return True
    except Exception as e:
        logger.error(f"Database verification failed: {str(e)}")
        return False
