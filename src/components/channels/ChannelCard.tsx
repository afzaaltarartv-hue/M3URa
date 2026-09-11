import React, { useState } from 'react';
import { Play, Heart, Tv, Radio, Sparkles } from 'lucide-react';
import { ChannelItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChannelCardProps {
  channel: ChannelItem;
  viewMode?: 'grid' | 'list';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, viewMode = 'grid' }) => {
  const { playMedia, toggleFavorite, isFavorite, activeMedia } = useApp();
  const [imageError, setImageError] = useState(false);

  const isCurrentPlaying = activeMedia?.id === channel.id;
  const isFav = isFavorite(channel.id);

  // EPG progress calculation
  const now = Date.now();
  const prog = channel.currentProgram;
  let progressPercent = 50;
  if (prog && prog.endTime > prog.startTime) {
    const elapsed = now - prog.startTime;
    const total = prog.endTime - prog.startTime;
    progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / total) * 100)));
  }

  // Fallback monogram
  const initials = channel.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  if (viewMode === 'list') {
    return (
      <div
        id={`channel-list-item-${channel.id}`}
        onClick={() => playMedia(channel)}
        className={`group flex items-center justify-between p-3 rounded-2xl glass-card cursor-pointer transition-all border ${
          isCurrentPlaying
            ? 'border-sky-400/50 bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
            : 'border-white/[0.06] hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Logo / Monogram */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {channel.logo && !imageError ? (
              <img
                src={channel.logo}
                alt={channel.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <span className="font-bold text-sm text-sky-300 font-mono tracking-wider">
                {initials || <Tv className="w-5 h-5 text-sky-400" />}
              </span>
            )}
            {isCurrentPlaying && (
              <div className="absolute inset-0 bg-sky-500/40 backdrop-blur-xs flex items-center justify-center">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white truncate group-hover:text-sky-300 transition-colors">
                {channel.name}
              </h3>
              {channel.resolution && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-white/10 text-slate-300 border border-white/10">
                  {channel.resolution}
                </span>
              )}
            </div>
            {prog && (
              <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
                {prog.title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-sky-400/90 font-medium px-2 py-0.5 rounded-md bg-sky-500/10">
                {channel.group}
              </span>
              {channel.country && (
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  {channel.country}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(channel.id);
            }}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-xl glass-pill transition-all ${
              isFav ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
          </button>
          <button
            onClick={() => playMedia(channel)}
            aria-label={`Play ${channel.name}`}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Mode Card
  return (
    <div
      id={`channel-grid-card-${channel.id}`}
      onClick={() => playMedia(channel)}
      className={`group relative flex flex-col justify-between p-4 rounded-3xl glass-card cursor-pointer border transition-all ${
        isCurrentPlaying
          ? 'border-sky-400/60 bg-sky-500/15 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Top row: Badges and Favorite */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
          {channel.resolution && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-slate-300 text-[10px] font-mono border border-white/[0.08]">
              {channel.resolution}
            </span>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            toggleFavorite(channel.id);
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-full glass-pill transition-all ${
            isFav ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
        </button>
      </div>

      {/* Center: Logo & Monogram Display */}
      <div className="my-2 flex flex-col items-center justify-center h-24">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-white/[0.08] to-white/[0.02] border border-white/10 p-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
          {channel.logo && !imageError ? (
            <img
              src={channel.logo}
              alt={channel.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain filter drop-shadow"
              loading="lazy"
            />
          ) : (
            <span className="font-bold text-lg text-sky-400 font-mono tracking-wider">
              {initials || <Tv className="w-7 h-7 text-sky-400" />}
            </span>
          )}

          {/* Quick Play Hover Splash */}
          <div className="absolute inset-0 rounded-2xl bg-sky-500/80 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Info & Simulated EPG */}
      <div className="mt-2 space-y-1.5 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-bold text-sm text-white truncate group-hover:text-sky-300 transition-colors">
            {channel.name}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {channel.country || 'GLOBAL'}
          </span>
        </div>

        {prog && (
          <div>
            <p className="text-[11px] text-slate-400 truncate">
              {prog.title}
            </p>
            {/* EPG Timeline bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span className="truncate max-w-[120px] text-sky-400/80 font-medium">
            {channel.group}
          </span>
          <span className="text-slate-400 hover:text-white">Watch Now →</span>
        </div>
      </div>
    </div>
  );
};
