import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  Star,
  Calendar,
  Tag,
  Eye,
  Clock,
  CheckCircle,
  Film,
} from 'lucide-react'
import { movieApi } from '../services/api'
import type { UpdateMovieData, Movie } from '../types/movie'
import toast from 'react-hot-toast'

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  console.log('MovieDetails component rendered with ID:', id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMovieData>()

  const {
    data: movieData,
    isLoading,
    error,
  } = useQuery<Movie>(
    ['movie', id],
    () => {
      console.log('Fetching movie with ID:', id)
      return movieApi.getMovie(id!)
    },
    {
      enabled: !!id,
      onSuccess: (m) => {
        reset({
          title: m.title,
          genre: m.genre,
          rating: m.rating,
          status: m.status,
          notes: m.notes,
          personal_rating: m.personal_rating,
        })
      },
      onError: (err) => {
        console.error('Error fetching movie:', err)
      }
    }
  )

  const updateMovieMutation = useMutation<Movie, unknown, UpdateMovieData>(
    (data: UpdateMovieData) => movieApi.updateMovie(id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movie', id])
        queryClient.invalidateQueries('movies')
        queryClient.invalidateQueries('movieStats')
        setIsEditing(false)
        toast.success('Movie updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update movie')
      },
    }
  )

  const deleteMovieMutation = useMutation<{ message: string }, unknown, void>(
    () => movieApi.deleteMovie(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('movies')
        queryClient.invalidateQueries('movieStats')
        toast.success('Movie deleted successfully!')
        navigate('/')
      },
      onError: () => {
        toast.error('Failed to delete movie')
      },
    }
  )

  const onSubmit = (data: UpdateMovieData) => {
    const cleaned: UpdateMovieData = {
      title: data.title?.toString().trim() || '',
      genre: data.genre?.toString().trim() || '',
      status: data.status as Movie['status'] || 'to_watch',
      rating: data.rating ? Number(data.rating) : undefined,
      personal_rating: data.personal_rating ? Number(data.personal_rating) : undefined,
      notes: data.notes?.toString().trim() || undefined,
    }
    
    updateMovieMutation.mutate(cleaned)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      deleteMovieMutation.mutate()
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (movieData) {
      reset({
        title: movieData.title,
        genre: movieData.genre,
        rating: movieData.rating,
        status: movieData.status,
        notes: movieData.notes,
        personal_rating: movieData.personal_rating,
      })
    }
  }

  const renderStars = (rating: number) => {
    const filledStars = Math.ceil(rating / 2)
    
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < filledStars
      return (
        <Star
          key={i}
          className="w-5 h-5"
          style={{
            color: isFilled ? '#D6DAC8' : '#d1d5db', 
            fill: isFilled ? '#D6DAC8' : 'none'
          }}
        />
      )
    })
  }

  const getStatusIcon = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return <Clock className="w-4 h-4" />
      case 'watched':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return 'badge-to-watch'
      case 'watched':
        return 'badge-watched'
      default:
        return 'badge-to-watch'
    }
  }

  const getStatusText = (status: Movie['status']) => {
    switch (status) {
      case 'to_watch':
        return 'To Watch'
      case 'watched':
        return 'Watched'
      default:
        return 'To Watch'
    }
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="ml-2">Loading movie details...</span>
      </div>
    )
  }

  if (error || !movieData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Movie not found or failed to load.</div>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    )
  }

  const movie = movieData

  return (
    <div>
      <div className="hero-section">
        <div className="hero-row">
          <div>
            <h1 className="hero-title">Movie: {movie.title}</h1>
          
          </div>
        </div>
      </div>


      <div className="space-y-6">

        {movie.notes && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Notes</h3>
            <div className="form-group">
              <p className="text-slate-700 leading-relaxed">{movie.notes}</p>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Edit Movie Information</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Movie Title *</label>
                  <input
                    {...register('title')}
                    className="form-input"
                    placeholder="Enter movie title"
                  />
                  {errors.title && (
                    <div className="text-red-500 text-sm mt-1">{errors.title.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Genre *</label>
                  <input
                    {...register('genre')}
                    className="form-input"
                    placeholder="Enter genre"
                  />
                  {errors.genre && (
                    <div className="text-red-500 text-sm mt-1">{errors.genre.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">IMDb Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    {...register('rating', {
                      min: { value: 1, message: 'Rating must be at least 1' },
                      max: { value: 10, message: 'Rating must be at most 10' },
                    })}
                    className="form-input"
                    placeholder="8.5"
                  />
                  {errors.rating && (
                    <div className="text-red-500 text-sm mt-1">{errors.rating.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Your Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    {...register('personal_rating', {
                      min: { value: 1, message: 'Rating must be at least 1' },
                      max: { value: 10, message: 'Rating must be at most 10' },
                    })}
                    className="form-input"
                    placeholder="9.0"
                  />
                  {errors.personal_rating && (
                    <div className="text-red-500 text-sm mt-1">{errors.personal_rating.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    {...register('status')}
                    className="form-select"
                  >
                    <option value="to_watch">To Watch</option>
                    <option value="watched">Watched</option>
                  </select>
                  {errors.status && (
                    <div className="text-red-500 text-sm mt-1">{errors.status.message}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  {...register('notes')}
                  className="form-input"
                  rows={4}
                  placeholder="Share your thoughts about this movie..."
                />
                {errors.notes && (
                  <div className="text-red-500 text-sm mt-1">{errors.notes.message}</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200/60 mt-6">
                <Link to="/" className="btn btn-sm btn-secondary no-underline">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-sm btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMovieMutation.isLoading}
                    className="btn btn-sm btn-primary"
                  >
                    {updateMovieMutation.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Movie Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <p className="text-slate-900 font-medium">{movie.genre}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <span className={`badge ${getStatusBadge(movie.status)}`}>
                    {getStatusIcon(movie.status)}
                    {getStatusText(movie.status)}
                  </span>
                </div>
                {(movie.rating || movie.personal_rating) && (
                  <>
                    {movie.rating && (
                      <div className="form-group">
                        <label className="form-label">IMDb Rating</label>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(movie.rating)}
                          </div>
                          <span className="text-xl font-bold text-slate-900">{movie.rating}/10</span>
                        </div>
                      </div>
                    )}
                    {movie.personal_rating && (
                      <div className="form-group">
                        <label className="form-label">Your Rating</label>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(movie.personal_rating)}
                          </div>
                          <span className="text-xl font-bold text-slate-900">{movie.personal_rating}/10</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Added</label>
                  <p className="text-slate-900 font-medium">
                    {new Date(movie.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Updated</label>
                  <p className="text-slate-900 font-medium">
                    {new Date(movie.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-200/60 mt-6">
              <Link to="/" className="btn btn-sm btn-secondary no-underline">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex">
                <button 
                  onClick={handleEdit}
                  className="btn btn-sm btn-primary no-underline"
                  style={{ marginRight: '8px' }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn btn-sm btn-danger no-underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default MovieDetails