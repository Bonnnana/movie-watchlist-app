import React from 'react'
import { Film, Clock, Eye, CheckCircle, Star } from 'lucide-react'
import { MovieStats } from '../types/movie'

interface StatsCardProps { stats: MovieStats }

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const {
    total_movies,
    to_watch_count,
    watching_count,
    watched_count,
    avg_personal_rating,
    rated_movies,
    genres,
  } = stats

  const statItems = [
    { label: 'Total Movies', value: total_movies, icon: Film },
    { label: 'To Watch', value: to_watch_count, icon: Clock },
    { label: 'Watching', value: watching_count, icon: Eye },
    { label: 'Watched', value: watched_count, icon: CheckCircle },
  ]

  const topGenres = genres.slice(0, 5)

  return (
    <div className="stats-grid">
      {statItems.map(({ label, value, icon: Icon }) => (
        <div key={label} className="stat-card">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
            <Icon className="w-6 h-6 text-slate-600" />
          </div>
          <div className="stat-number">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}

      {avg_personal_rating !== null && (
        <div className="stat-card">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
            <Star className="w-6 h-6 text-slate-600" />
          </div>
          <div className="stat-number">{avg_personal_rating.toFixed(1)}</div>
          <div className="stat-label">Avg Rating</div>
          <div className="text-xs text-slate-500 mt-1">Based on {rated_movies} rated movies</div>
        </div>
      )}

      {topGenres.length > 0 && (
        <div className="stat-card">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
            <Film className="w-6 h-6 text-slate-600" />
          </div>
          <div className="stat-number">{topGenres[0].genre}</div>
          <div className="stat-label">Top Genre</div>
          <div className="text-xs text-slate-500 mt-1">
            {topGenres.map(g => `${g.genre} (${g.count})`).join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsCard
