from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
import logging

load_dotenv()

from connection import verify_database_connection, get_database, close_database_connection
from models import Movie, MovieCreate, MovieUpdate, MovieStats
from crud import movie_crud

from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Movie Watchlist Backend...")
    await verify_database_connection()
    logger.info("Backend ready")
    yield
    logger.info("Shutting down Movie Watchlist Backend...")
    await close_database_connection()

app = FastAPI(
    title="Movie Watchlist API",
    description="A comprehensive API for managing movie watchlists",
    version="1.0.0",
    lifespan=lifespan
)

frontend_urls = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
frontend_urls = [url.strip() for url in frontend_urls if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "service": "movie-watchlist-backend",
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Movie Watchlist API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/api/movies", response_model=list[Movie], tags=["Movies"], response_model_by_alias=False)
async def get_movies(
    status: str = None,
    genre: str = None,
    search: str = None,
    db=Depends(get_database)
):
    """Get all movies with optional filtering"""
    try:
        movies = await movie_crud.get_movies(
            db=db,
            status=status,
            genre=genre,
            search=search
        )
        return movies
    except Exception as e:
        logger.error(f"Error fetching movies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch movies"
        )

@app.get("/api/movies/{movie_id}", response_model=Movie, tags=["Movies"], response_model_by_alias=False)
async def get_movie(movie_id: str, db=Depends(get_database)):
    """Get a specific movie by ID"""
    try:
        movie = await movie_crud.get_movie(db=db, movie_id=movie_id)
        if not movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )
        return movie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch movie"
        )

@app.post("/api/movies", response_model=Movie, status_code=status.HTTP_201_CREATED, tags=["Movies"], response_model_by_alias=False)
async def create_movie(movie: MovieCreate, db=Depends(get_database)):
    """Create a new movie"""
    try:
        new_movie = await movie_crud.create_movie(db=db, movie=movie)
        return new_movie
    except Exception as e:
        logger.error(f"Error creating movie: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create movie"
        )

@app.put("/api/movies/{movie_id}", response_model=Movie, tags=["Movies"], response_model_by_alias=False)
async def update_movie(movie_id: str, movie_update: MovieUpdate, db=Depends(get_database)):
    """Update a movie"""
    try:
        existing_movie = await movie_crud.get_movie(db=db, movie_id=movie_id)
        if not existing_movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )
        
        updated_movie = await movie_crud.update_movie(
            db=db, 
            movie_id=movie_id, 
            movie_update=movie_update
        )
        return updated_movie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating movie {movie_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update movie"
        )

@app.delete("/api/movies/{movie_id}", tags=["Movies"], response_model_by_alias=False)
async def delete_movie(movie_id: str, db=Depends(get_database)):
    """Delete a movie"""
    try:
        existing_movie = await movie_crud.get_movie(db=db, movie_id=movie_id)
        if not existing_movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )
        
        await movie_crud.delete_movie(db=db, movie_id=movie_id)
        return {"message": "Movie deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting movie {movie_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete movie"
        )

@app.get("/api/movies/stats/summary", response_model=MovieStats, tags=["Statistics"], response_model_by_alias=False)
async def get_movie_stats(db=Depends(get_database)):
    """Get movie statistics"""
    try:
        stats = await movie_crud.get_movie_stats(db=db)
        return stats
    except Exception as e:
        logger.error(f"Error fetching movie stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch movie statistics"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        reload=os.getenv("NODE_ENV", "development") == "development"
    )
