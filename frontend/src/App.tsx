import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AddMovie from './pages/AddMovie';
import MovieDetails from './pages/MovieDetails';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-movie" element={<AddMovie />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Layout>
  );
}

export default App;
