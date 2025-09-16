import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, CheckCircle, Star, Edit, Trash2, Film } from 'lucide-react';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Movie['status']) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onStatusChange }) => {
  const getStatusIcon = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return <Clock className="w-4 h-4" />;
      case 'watched':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return 'badge-to-watch';
      case 'watched':
        return 'badge-watched';
      default:
        return 'badge-to-watch';
    }
  };

  const getStatusText = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return 'To Watch';
      case 'watched':
        return 'Watched';
      default:
        return 'To Watch';
    }
  };

  const renderStars = (rating: number) => {
    const clamped = Math.max(0, Math.min(5, Math.round(rating / 2)));
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < clamped ? 'star-active' : 'star-inactive'}`}
      />
    ));
  };

  return (
    <div className="card card-elevated">
      <div className="card-media">
        <div className="poster">
          <Film className="poster-icon" />
        </div>
        <div className={`status-chip ${getStatusBadge(movie.status)}`}>
          {getStatusIcon(movie.status)}
          <span>{getStatusText(movie.status)}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="title-row">
          <h3 className="movie-title line-clamp-2">{movie.title}</h3>
          <span className="genre-chip">{movie.genre}</span>
        </div>

        <div className="actions-row">
          <div className="inline-actions">
            {onDelete && (
              <button onClick={() => {
                console.log('Deleting movie with ID:', movie.id, 'Type:', typeof movie.id);
                onDelete(movie.id);
              }} className="action-btn danger">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <Link 
              to={`/movie/${movie.id}`} 
              className="action-btn details"
              onClick={() => console.log('Navigating to movie:', movie.id)}
            >
              <Edit className="w-4 h-4" />
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
