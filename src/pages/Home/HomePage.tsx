import React from 'react';
import { Play, Info, Radio, Sparkles, Tv, Film, ChevronRight, Clock, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelCard } from '../../components/channels/ChannelCard';
import { MovieCard } from '../../components/movies/MovieCard';

export const HomePage: React.FC = () => {
  const {
    channels,
    movies,
    watchHistory,
    playMedia,
    setSelectedMovie,
    setCurrentPage,
    playlists,
  } = useApp();

  // Pick top featured item (e.g. Tears of Steel or top live channel)
  const featuredMovie = movies[0];
  const featuredChannel = channels[0];

  const liveHighlights = channels.slice(0, 6);
  const featuredMovies = movies.slice(0, 6);

  return (
    <div id="streamglass-home-page" className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Cinematic Hero Featured Section (Netflix / Apple TV aesthetic) */}
      {featuredMovie && (
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/10 min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
          {/* Hero Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.backdrop || featuredMovie.poster}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-75 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-[#090b12]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090b12]/90 via-[#090b12]/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Featured Premiere
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md text-white text-xs font-mono font-bold">
                {featuredMovie.resolution || '4K UHD'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-slate-300 text-xs">
                {featuredMovie.year}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {featuredMovie.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
              {featuredMovie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => playMedia(featuredMovie)}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-xl shadow-sky-500/30 transition-all cursor-pointer transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Movie</span>
              </button>

              <button
                onClick={() => setSelectedMovie(featuredMovie)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-white hover:bg-white/15 text-sm font-semibold transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-sky-400" />
                <span>More Details</span>
              </button>

              {featuredChannel && (
                <button
                  onClick={() => playMedia(featuredChannel)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Switch to Live TV</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching Shelf (if any watch history exists) */}
      {watchHistory.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Continue Watching
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {watchHistory.length} in progress
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchHistory.slice(0, 3).map(item => {
              const percent = item.duration > 0
                ? Math.min(100, Math.round((item.progress / item.duration) * 100))
                : 0;

              return (
                <div
                  key={item.contentId}
                  onClick={() => {
                    const matchedMovie = movies.find(m => m.id === item.contentId);
                    const matchedChannel = channels.find(c => c.id === item.contentId);
                    if (matchedMovie) playMedia(matchedMovie);
                    else if (matchedChannel) playMedia(matchedChannel);
                  }}
                  className="group flex items-center gap-3.5 p-3 rounded-2xl glass-card cursor-pointer border border-white/[0.08] hover:border-sky-400/40"
                >
                  <div className="relative w-20 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    {item.poster ? (
                      <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-sky-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {item.type === 'live' ? 'Live Broadcast' : `${percent}% completed`}
                    </p>
                    {item.duration > 0 && (
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Live TV Highlights Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Live TV Highlights
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('live')}
            className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Browse All ({channels.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {liveHighlights.map(channel => (
            <ChannelCard key={channel.id} channel={channel} viewMode="grid" />
          ))}
        </div>
      </section>

      {/* Featured Movies & Cinema Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending Cinema & Movies
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('movies')}
            className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>View All ({movies.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Playlists Quick Access Card */}
      <section className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Tv className="w-4 h-4" />
            <span>M3U Playlist Hub</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Manage or Import Your Personal M3U Feeds
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            StreamGlass supports local file uploads, URL feeds, and direct text paste with instant categorization.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('playlists')}
          className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          Open Playlist Manager →
        </button>
      </section>
    </div>
  );
};
