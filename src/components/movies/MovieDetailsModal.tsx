import React from 'react';
import { Play, Heart, X, Clock, Star, Calendar, Film, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MovieDetailsModal: React.FC = () => {
  const { selectedMovie, setSelectedMovie, playMedia, toggleFavorite, isFavorite, watchHistory } = useApp();

  if (!selectedMovie) return null;

  const isFav = isFavorite(selectedMovie.id);
  const historyItem = watchHistory.find(h => h.contentId === selectedMovie.id);

  const formatDuration = (secs: number) => {
    if (!secs) return '';
    const mins = Math.round(secs / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} hr ${m} min`;
    }
    return `${mins} min`;
  };

  const backdropUrl = selectedMovie.backdrop || selectedMovie.poster;

  return (
    <div
      id="movie-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={() => setSelectedMovie(null)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#0e111a] rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={() => setSelectedMovie(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={selectedMovie.title}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-sky-900/30 to-indigo-900/30">
              <Film className="w-16 h-16 text-sky-400/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e111a] via-[#0e111a]/40 to-transparent" />

          {/* Overlay titles and badges */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold uppercase">
                Feature Movie
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15 text-xs font-mono">
                {selectedMovie.resolution || 'HD'}
              </span>
              {selectedMovie.year && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-xs font-medium">
                  {selectedMovie.year}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {selectedMovie.title}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedMovie(null);
                playMedia(selectedMovie);
              }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-500/30 transition-all cursor-pointer transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{historyItem && historyItem.progress > 0 ? 'Resume Playback' : 'Start Watching'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(selectedMovie.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl glass-panel text-sm font-semibold transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
              <span>{isFav ? 'In Favorites' : 'Add to Favorites'}</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">
              Synopsis
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {selectedMovie.description || 'No detailed overview available for this media item.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel-subtle border border-white/[0.06] text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Duration</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {formatDuration(selectedMovie.duration)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Release Year</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                {selectedMovie.year || '2024'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Community Rating</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {selectedMovie.rating || 4.5} / 5.0
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Quality Profile</span>
              <span className="font-semibold text-emerald-400">
                {selectedMovie.resolution || '1080p FHD'}
              </span>
            </div>
          </div>

          {/* Genres */}
          {selectedMovie.genre && selectedMovie.genre.length > 0 && (
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2 block">
                Categories & Genres
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMovie.genre.map((g, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-medium text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stream Technical Details */}
          <div className="pt-2 border-t border-white/[0.08] text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-sm">Source: {selectedMovie.url}</span>
            <span className="font-mono text-emerald-400 shrink-0">Direct Stream Link</span>
          </div>
        </div>
      </div>
    </div>
  );
};
