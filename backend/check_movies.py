import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def check_movies():
    database_url = os.getenv('DATABASE_URL', 'mongodb://localhost:27017/movie_watchlist')
    client = AsyncIOMotorClient(database_url)
    db = client.movie_watchlist
    
    count = await db.movies.count_documents({})
    print(f'Total movies in database: {count}')
    
    docs = await db.movies.find({}).to_list(length=10)
    print('All movies:')
    for doc in docs:
        print(f'  ID: {doc["_id"]}, Title: {doc.get("title", "No title")}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_movies())
