import React, { useState } from 'react';
import { Play, Heart, Info, Star, Clock, Film } from 'lucide-react';
import { MovieItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface MovieCardProps {
  movie: MovieItem;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { playMedia, toggleFavorite, isFavorite, setSelectedMovie, watchHistory } = useApp();
  const [imageError, setImageError] = useState(false);

  const isFav = isFavorite(movie.id);

  // Check if there's progress in watch history
  const historyItem = watchHistory.find(h => h.contentId === movie.id);
  const progressPercent = historyItem && historyItem.duration > 0
    ? Math.min(100, Math.round((historyItem.progress / historyItem.duration) * 100))
    : 0;

  const formatDuration = (secs: number) => {
    if (!secs) return '';
    const mins = Math.round(secs / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins}m`;
  };

  return (
    <div
      id={`movie-card-${movie.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden glass-card border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
      onClick={() => setSelectedMovie(movie)}
    >
      {/* 2:3 Poster Frame */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#111420]">
        {movie.poster && !imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#181c2d] to-[#0c0e17]">
            <Film className="w-10 h-10 text-sky-400 mb-2 opacity-60" />
            <span className="font-bold text-xs text-slate-300 line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-semibold border border-white/10">
            {movie.resolution || 'HD'}
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(movie.id);
            }}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 rounded-full glass-pill transition-all ${
              isFav ? 'text-rose-400 bg-rose-500/25 border-rose-500/50' : 'text-white/80 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={e => {
                e.stopPropagation();
                playMedia(movie);
              }}
              aria-label={`Play ${movie.title}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch</span>
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                setSelectedMovie(movie);
              }}
              aria-label={`View details for ${movie.title}`}
              className="p-2 rounded-xl glass-pill text-white/90 hover:text-white"
              title="Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Continue Watching Progress bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-15">
            <div
              className="h-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info bottom text */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-sky-300 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{formatDuration(movie.duration)}</span>
          </div>
          {movie.rating && (
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating}</span>
            </div>
          )}
        </div>
        {movie.genre && movie.genre.length > 0 && (
          <div className="pt-0.5">
            <span className="text-[10px] text-slate-500 truncate block">
              {movie.genre.slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
