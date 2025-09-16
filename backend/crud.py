from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from models import Movie, MovieCreate, MovieUpdate, MovieStats, GenreStats

logger = logging.getLogger(__name__)

def _serialize(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Normalize a Mongo document into the API shape: id (str) instead of _id.
    Returns None if doc is None.
    """
    if not doc:
        return None

    _id = doc.get("_id")
    base = {k: v for k, v in doc.items() if k != "_id"}
    base["id"] = str(_id) if isinstance(_id, ObjectId) else (str(_id) if _id is not None else "")
    
    logger.info(f"Serializing document: _id={_id}, id={base['id']}")
    return base


def _to_object_id(movie_id: str) -> ObjectId:
    """Convert incoming id to ObjectId or raise ValueError.
    We raise so the route layer can translate to 404 cleanly.
    """
    try:
        return ObjectId(movie_id)
    except Exception as e:
        logger.error("Invalid ObjectId format: %s, error: %s", movie_id, e)
        raise ValueError("Invalid ObjectId")

class MovieCRUD:
    async def get_movies(
        self,
        db: AsyncIOMotorDatabase,
        status: Optional[str] = None,
        genre: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Movie]:
        """Get all movies with optional filtering."""
        logger.info("get_movies called - this should NOT create new movies")
        collection = db.movies
        filt: Dict[str, Any] = {}

        if status:
            filt["status"] = status
        if genre:
            filt["genre"] = genre
        if search:
            filt["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"notes": {"$regex": search, "$options": "i"}},
            ]

        cursor = collection.find(filt).sort("created_at", DESCENDING)
        items: List[Movie] = []
        async for doc in cursor:
            logger.info(f"Processing document: _id={doc['_id']}, title={doc.get('title')}")
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            items.append(Movie(**doc))
        logger.info(f"get_movies returning {len(items)} movies")
        return items

    async def get_movie(self, db: AsyncIOMotorDatabase, movie_id: str) -> Optional[Movie]:
        """Get a specific movie by ID."""
        logger.info("Getting movie with ID: %s", movie_id)
        try:
            oid = _to_object_id(movie_id)
            logger.info("Converted to ObjectId: %s", oid)
        except ValueError as e:
            logger.error("Failed to convert to ObjectId: %s", e)
            return None

        doc = await db.movies.find_one({"_id": oid})
        if not doc:
            logger.warning("Movie not found in database: %s", movie_id)
            return None

        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return Movie(**doc)

    async def create_movie(self, db: AsyncIOMotorDatabase, movie: MovieCreate) -> Movie:
        """Create a new movie."""
        logger.info("create_movie called - this should only happen when adding new movies")
        collection = db.movies
        now = datetime.utcnow()

        payload = movie.dict()
        payload["created_at"] = now
        payload["updated_at"] = now

        res = await collection.insert_one(payload)
        doc = await collection.find_one({"_id": res.inserted_id})
        ser = _serialize(doc)
        assert ser is not None, "Inserted movie not found right after insert"
        return Movie(**ser)

    async def update_movie(
        self,
        db: AsyncIOMotorDatabase,
        movie_id: str,
        movie_update: MovieUpdate,
    ) -> Optional[Movie]:
        """Update a movie and return the updated model (or None if not found)."""
        try:
            oid = _to_object_id(movie_id)
        except ValueError:
            return None

        update = {k: v for k, v in movie_update.dict(exclude_unset=True).items() if v is not None}
        update["updated_at"] = datetime.utcnow()

        result = await db.movies.update_one({"_id": oid}, {"$set": update})
        if result.matched_count == 0:
            return None

        doc = await db.movies.find_one({"_id": oid})
        ser = _serialize(doc)
        return Movie(**ser) if ser else None

    async def delete_movie(self, db: AsyncIOMotorDatabase, movie_id: str) -> bool:
        """Delete a movie. Returns True if a document was deleted."""
        try:
            oid = _to_object_id(movie_id)
        except ValueError:
            return False

        res = await db.movies.delete_one({"_id": oid})
        return res.deleted_count > 0

    async def get_movie_stats(self, db: AsyncIOMotorDatabase) -> MovieStats:
        """Get aggregated movie statistics for the dashboard."""
        collection = db.movies

        total_movies = await collection.count_documents({})
        to_watch_count = await collection.count_documents({"status": "to_watch"})
        watched_count = await collection.count_documents({"status": "watched"})

        rated_movies_cursor = collection.find({"personal_rating": {"$ne": None}})
        rated_movies = 0
        total_rating = 0
        async for m in rated_movies_cursor:
            pr = m.get("personal_rating")
            if pr is not None:
                rated_movies += 1
                total_rating += pr
        avg_personal_rating = (total_rating / rated_movies) if rated_movies > 0 else None

        pipeline = [
            {"$group": {"_id": "$genre", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        genres: List[GenreStats] = []
        async for g in collection.aggregate(pipeline):
            genres.append(GenreStats(genre=str(g.get("_id", "Unknown")), count=g.get("count", 0)))

        return MovieStats(
            total_movies=total_movies,
            to_watch_count=to_watch_count,
            watching_count=0,  
            watched_count=watched_count,
            avg_personal_rating=avg_personal_rating,
            rated_movies=rated_movies,
            genres=genres,
        )


movie_crud = MovieCRUD()
