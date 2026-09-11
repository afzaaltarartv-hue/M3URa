import React, { useState } from 'react';
import { Heart, Tv, Film, Play, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelCard } from '../../components/channels/ChannelCard';
import { MovieCard } from '../../components/movies/MovieCard';

export const FavoritesPage: React.FC = () => {
  const { channels, movies, favoriteIds, setCurrentPage } = useApp();
  const [tab, setTab] = useState<'all' | 'channels' | 'movies'>('all');

  const favoriteChannels = channels.filter(c => favoriteIds.has(c.id));
  const favoriteMovies = movies.filter(m => favoriteIds.has(m.id));

  const totalFavorites = favoriteChannels.length + favoriteMovies.length;

  return (
    <div id="streamglass-favorites-page" className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-rose-400" />
            <span>Personal Bookmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Favorites & Starred Streams
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Instant quick access to your most-watched live channels and saved movies.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel text-xs">
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              tab === 'all' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalFavorites})
          </button>
          <button
            onClick={() => setTab('channels')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              tab === 'channels' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Channels ({favoriteChannels.length})
          </button>
          <button
            onClick={() => setTab('movies')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              tab === 'movies' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Movies ({favoriteMovies.length})
          </button>
        </div>
      </div>

      {totalFavorites === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Favorites Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the heart icon on any channel card or movie poster to pin it directly to your favorites deck.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage('live')}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400"
            >
              Browse Live TV
            </button>
            <button
              onClick={() => setCurrentPage('movies')}
              className="px-4 py-2 rounded-xl glass-panel text-slate-300 text-xs font-semibold hover:text-white"
            >
              Explore Movies
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Channels Section */}
          {(tab === 'all' || tab === 'channels') && favoriteChannels.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-sky-400" />
                <h2 className="text-lg font-bold text-white">
                  Starred Channels ({favoriteChannels.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {favoriteChannels.map(ch => (
                  <ChannelCard key={ch.id} channel={ch} viewMode="grid" />
                ))}
              </div>
            </section>
          )}

          {/* Movies Section */}
          {(tab === 'all' || tab === 'movies') && favoriteMovies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">
                  Saved Movies ({favoriteMovies.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {favoriteMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
