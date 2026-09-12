import React, { useState, useMemo } from 'react';
import { Film, Search, Sparkles, Filter, SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MovieCard } from '../../components/movies/MovieCard';

export const MoviesPage: React.FC = () => {
  const { movies, setIsAddMovieModalOpen } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'duration'>('rating');

  // Extract all unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => {
      m.genre.forEach(g => set.add(g));
    });
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  // Filter & Sort movies
  const filteredMovies = useMemo(() => {
    return movies
      .filter(m => {
        if (selectedGenre !== 'All' && !m.genre.includes(selectedGenre)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = m.title.toLowerCase().includes(q);
          const matchesDesc = m.description.toLowerCase().includes(q);
          const matchesYear = m.year.toString().includes(q);
          const matchesGenre = m.genre.some(g => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesYear && !matchesGenre) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'duration') return b.duration - a.duration;
        return 0;
      });
  }, [movies, selectedGenre, searchQuery, sortBy]);

  return (
    <div id="streamglass-movies-page" className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>On-Demand Cinema Deck</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Movies & Feature Films
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse cinematic releases, open render showcases, and video on-demand streams.
          </p>
        </div>

        {/* Actions & Sort selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="add-movies-btn"
            onClick={() => setIsAddMovieModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Movies</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              id="movies-sort-select"
              aria-label="Sort movies by"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="rating" className="bg-[#121520] text-white">Top Rated</option>
              <option value="year" className="bg-[#121520] text-white">Release Year</option>
              <option value="duration" className="bg-[#121520] text-white">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {genres.map(g => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected ? 'glass-pill-active' : 'glass-pill text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
          />
        </div>
      </div>

      {/* Grid of Movie Cards */}
      {filteredMovies.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto my-10">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No movies match "${searchQuery}".`
              : 'No movies found for the selected filter.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
              }}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-semibold border border-white/10"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setIsAddMovieModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Movie</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Quick Add Card */}
          <button
            id="add-movie-grid-card"
            onClick={() => setIsAddMovieModalOpen(true)}
            className="group relative flex flex-col items-center justify-center rounded-2xl overflow-hidden glass-card border border-dashed border-white/20 hover:border-sky-400/60 hover:bg-sky-500/[0.04] transition-all cursor-pointer p-4 text-center aspect-[2/3]"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-lg shadow-sky-500/20">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-white group-hover:text-sky-300">Add New Movie</span>
            <span className="text-[10px] text-slate-400 mt-1">MP4 / MKV / M3U</span>
          </button>

          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
