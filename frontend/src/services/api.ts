import axios from 'axios'
import type { Movie, CreateMovieData, UpdateMovieData, MovieStats } from '../types/movie'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  return config
})
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  },
)

export const movieApi = {
  // Get all movies with optional filters
  async getMovies(params?: { status?: string; genre?: string; search?: string }): Promise<Movie[]> {
    const res = await api.get<Movie[]>('/movies', { params })
    return res.data
  },

  // Get a specific movie by ID
  async getMovie(id: string): Promise<Movie> {
    const res = await api.get<Movie>(`/movies/${id}`)
    return res.data
  },

  // Create a new movie
  async createMovie(movieData: CreateMovieData): Promise<Movie> {
    const res = await api.post<Movie>('/movies', movieData)
    return res.data
  },

  // Update a movie
  async updateMovie(id: string, movieData: UpdateMovieData): Promise<Movie> {
    const res = await api.put<Movie>(`/movies/${id}`, movieData)
    return res.data
  },

  // Delete a movie
  async deleteMovie(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/movies/${id}`)
    return res.data
  },

  // Get movie statistics
  async getMovieStats(): Promise<MovieStats> {
    const res = await api.get<MovieStats>('/movies/stats/summary')
    return res.data
  },
}

export default api
