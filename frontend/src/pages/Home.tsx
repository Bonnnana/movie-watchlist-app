import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Search, Filter, Plus } from 'lucide-react'
import { movieApi } from '../services/api'
import { Movie } from '../types/movie'
import MovieCard from '../components/MovieCard'
import toast from 'react-hot-toast'

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')

  const queryClient = useQueryClient()

  const {
    data: moviesData,
    isLoading: moviesLoading,
    error: moviesError,
  } = useQuery(
    ['movies', { status: statusFilter, genre: genreFilter, search: searchTerm }],
    () =>
      movieApi.getMovies({
        status: statusFilter || undefined,
        genre: genreFilter || undefined,
        search: searchTerm || undefined,
      }),
    { keepPreviousData: true }
  )

  const updateStatusMutation = useMutation<
    Movie,               
    unknown,              
    { id: string; status: Movie['status'] } 
  >(
    ({ id, status }) => movieApi.updateMovie(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('movies')
        queryClient.invalidateQueries('movieStats')
        toast.success('Movie status updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update movie status')
      },
    }
  )

  const deleteMovieMutation = useMutation<
    { message: string },  
    unknown,            
    string                
  >(
    (id: string) => movieApi.deleteMovie(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('movies')
        queryClient.invalidateQueries('movieStats')
        toast.success('Movie deleted successfully!')
      },
      onError: () => {
        toast.error('Failed to delete movie')
      },
    }
  )

  const handleStatusChange = (id: string, status: Movie['status']) => {
    updateStatusMutation.mutate({ id, status })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      deleteMovieMutation.mutate(id)
    }
  }

  const movies: Movie[] = moviesData ?? []

  const uniqueGenres = Array.from(
    new Set(
      movies
        .map((m) => m.genre)
        .filter((g): g is string => typeof g === 'string' && g.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b))

  if (moviesError) {
    console.error('Failed to load movies:', moviesError)
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">
          Failed to load movies. Please try again later.
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="hero-section">
        <div className="hero-row">
          <div>

            <h1 className="hero-title">My Movie Watchlist</h1>
            <p className="hero-subtitle">
              Because great movies deserve a list.            </p>
          </div>
        </div>

        <Link to="/add-movie" className="btn-fab">
          <Plus className="w-4 h-4" />
          <span>Add Movie</span>
        </Link>
      </div>

      <div className="filter-section">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Filter & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Search Movies</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search by title or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="to_watch">To Watch</option>
              <option value="watched">Watched</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Genre</label>
            <select
              className="form-select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="">All Genres</option>
              {uniqueGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter || genreFilter) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setGenreFilter('')
              }}
              className="btn btn-secondary text-sm"
            >
              <Filter className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {moviesLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2 text-slate-600">Loading movies...</span>
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search className="w-full h-full" />
          </div>
          <div className="text-slate-500 text-lg mb-4">
            {searchTerm || statusFilter || genreFilter
              ? 'No movies match your current filters.'
              : 'No movies in your watchlist yet.'}
          </div>
          {!searchTerm && !statusFilter && !genreFilter && (
            <Link to="/add-movie" className="btn btn-primary no-underline">
              <Plus className="w-4 h-4" />
              Add Your First Movie
            </Link>
          )}
        </div>
      ) : (
        <div className="movie-grid" style={{ marginTop: '12px' }}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {movies.length > 0 && (
        <div className="mt-8 text-center text-slate-600">
          Showing {movies.length} movie{movies.length !== 1 ? 's' : ''}
          {(searchTerm || statusFilter || genreFilter) && ' matching your filters'}
        </div>
      )}
    </div>
  )
}

export default Home
