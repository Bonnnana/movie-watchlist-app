import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Film, Menu, X, Plus } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen">
      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
            <Film className="nav-brand-icon" />
            <span>Movie Watchlist</span>
          </Link>

          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`nav-links ${open ? 'is-open' : ''}`}>
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/add-movie"
              className={`nav-link ${isActive('/add-movie') ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Add Movie
            </Link>
          </nav>
        </div>
      </header>

      <main className="container px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
