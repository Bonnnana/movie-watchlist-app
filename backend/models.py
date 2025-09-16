from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class MovieStatus(str, Enum):
    TO_WATCH = "to_watch"
    WATCHED = "watched"

class MovieBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Movie title")
    genre: str = Field(..., min_length=1, max_length=100, description="Movie genre")
    rating: Optional[int] = Field(None, ge=1, le=10, description="IMDb rating (1-10)")
    status: MovieStatus = Field(MovieStatus.TO_WATCH, description="Watch status")
    notes: Optional[str] = Field(None, max_length=1000, description="Personal notes")
    personal_rating: Optional[int] = Field(None, ge=1, le=10, description="Personal rating (1-10)")

class MovieCreate(MovieBase):
    pass

class MovieUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    genre: Optional[str] = Field(None, min_length=1, max_length=100)
    rating: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[MovieStatus] = None
    notes: Optional[str] = Field(None, max_length=1000)
    personal_rating: Optional[int] = Field(None, ge=1, le=10)

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class Movie(MovieBase):
    id: str = Field(..., description="Unique movie identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class GenreStats(BaseModel):
    genre: str
    count: int

class MovieStats(BaseModel):
    total_movies: int
    to_watch_count: int
    watching_count: int
    watched_count: int
    avg_personal_rating: Optional[float]
    rated_movies: int
    genres: List[GenreStats]
