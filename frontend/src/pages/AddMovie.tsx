import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { movieApi } from '../services/api'
import type { CreateMovieData, Movie } from '../types/movie'

type FormData = {
  title: string
  genre: string
  rating?: number
  status: 'to_watch' | 'watched'
  notes?: string
  personal_rating?: number
}

const AddMovie: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      genre: '',
      status: 'to_watch',
    },
  })

  const createMutation = useMutation((payload: CreateMovieData) => movieApi.createMovie(payload), {
    onSuccess: (created: Movie) => {
      toast.success(`Added "${created.title}"`)
      // refresh lists & stats
      queryClient.invalidateQueries('movies')
      queryClient.invalidateQueries('movieStats')
      reset()
      navigate('/')
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail || 'Failed to add movie'
      toast.error(detail)
    },
  })

  const onSubmit = (data: FormData) => {
    const payload: CreateMovieData = {
      title: data.title.trim(),
      genre: data.genre.trim(),
      status: data.status,
      rating: typeof data.rating === 'number' ? data.rating : undefined,
      personal_rating: typeof data.personal_rating === 'number' ? data.personal_rating : undefined,
      notes: data.notes?.trim() || undefined,
    }
    createMutation.mutate(payload)
  }

  return (
    <div>
      <section className="hero-section" style={{ marginBottom: '1rem' }}>
        <h1 className="hero-title">Add a New Movie</h1>
        <p className="hero-subtitle">Save the title, genre, ratings, and your notes.</p>
      </section>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="The Dark Knight"
                {...register('title', { required: 'Title is required', minLength: { value: 1, message: 'Enter a title' } })}
              />
              {errors.title && <div className="text-slate-500" style={{ color: '#b91c1c', marginTop: 6 }}>{errors.title.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Genre *</label>
              <input
                className="form-input"
                placeholder="Action"
                {...register('genre', { required: 'Genre is required', minLength: { value: 1, message: 'Enter a genre' } })}
              />
              {errors.genre && <div className="text-slate-500" style={{ color: '#b91c1c', marginTop: 6 }}>{errors.genre.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">IMDb Rating (1–10)</label>
              <input
                type="number"
                className="form-input"
                placeholder="8"
                min={1}
                max={10}
                step={1}
                {...register('rating', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  min: { value: 1, message: 'Min is 1' },
                  max: { value: 10, message: 'Max is 10' },
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">My Rating (1–10)</label>
              <input
                type="number"
                className="form-input"
                placeholder="9"
                min={1}
                max={10}
                step={1}
                {...register('personal_rating', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  min: { value: 1, message: 'Min is 1' },
                  max: { value: 10, message: 'Max is 10' },
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select className="form-select" {...register('status', { required: 'Status is required' })}>
                <option value="to_watch">To Watch</option>
                <option value="watched">Watched</option>
              </select>
              {errors.status && <div className="text-slate-500" style={{ color: '#b91c1c', marginTop: 6 }}>{errors.status.message}</div>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                placeholder="Thoughts, quotes, where you left off..."
                rows={4}
                {...register('notes')}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => reset()}
              disabled={isSubmitting || createMutation.isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Adding…' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMovie
