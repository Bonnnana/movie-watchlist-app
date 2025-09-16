export interface Movie {
  id: string
  title: string
  genre: string
  rating?: number
  status: 'to_watch' | 'watched'
  notes?: string
  personal_rating?: number
  created_at: string
  updated_at: string
}

export interface CreateMovieData {
  title: string
  genre: string
  rating?: number
  status?: 'to_watch' | 'watched'
  notes?: string
  personal_rating?: number
}

export interface UpdateMovieData {
  title?: string
  genre?: string
  rating?: number
  status?: 'to_watch' | 'watched'
  notes?: string
  personal_rating?: number
}

/** Matches /api/movies/stats/summary */
export interface MovieStats {
  total_movies: number
  to_watch_count: number
  watching_count: number
  watched_count: number
  avg_personal_rating: number | null
  rated_movies: number
  genres: Array<{ genre: string; count: number }>
}
