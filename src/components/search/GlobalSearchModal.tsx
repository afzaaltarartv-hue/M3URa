import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tv, Film, Play, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelItem, MovieItem } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, channels, movies, playMedia, setSelectedMovie } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'channels' | 'movies'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingChannels = channels.filter(c => {
    if (!trimmed) return false;
    return (
      c.name.toLowerCase().includes(trimmed) ||
      c.group.toLowerCase().includes(trimmed) ||
      (c.country && c.country.toLowerCase().includes(trimmed)) ||
      (c.currentProgram && c.currentProgram.title.toLowerCase().includes(trimmed))
    );
  });

  const matchingMovies = movies.filter(m => {
    if (!trimmed) return false;
    return (
      m.title.toLowerCase().includes(trimmed) ||
      m.description.toLowerCase().includes(trimmed) ||
      m.genre.some(g => g.toLowerCase().includes(trimmed)) ||
      m.year.toString().includes(trimmed)
    );
  });

  let combinedResults: { item: ChannelItem | MovieItem; type: 'channel' | 'movie' }[] = [];
  if (filterType === 'all' || filterType === 'channels') {
    combinedResults = combinedResults.concat(
      matchingChannels.map(c => ({ item: c, type: 'channel' as const }))
    );
  }
  if (filterType === 'all' || filterType === 'movies') {
    combinedResults = combinedResults.concat(
      matchingMovies.map(m => ({ item: m, type: 'movie' as const }))
    );
  }

  const handleSelect = (entry: { item: ChannelItem | MovieItem; type: 'channel' | 'movie' }) => {
    setSearchOpen(false);
    if (entry.type === 'channel') {
      playMedia(entry.item as ChannelItem);
    } else {
      setSelectedMovie(entry.item as MovieItem);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < combinedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && combinedResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(combinedResults[selectedIndex]);
    }
  };

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-150"
      onClick={() => setSearchOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0c0f18] rounded-3xl glass-panel border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search channels, movies, genres, or programs..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs font-mono text-slate-500 bg-white/[0.06] rounded border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterType === 'all'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Results ({matchingChannels.length + matchingMovies.length})
          </button>
          <button
            onClick={() => setFilterType('channels')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterType === 'channels'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live TV ({matchingChannels.length})
          </button>
          <button
            onClick={() => setFilterType('movies')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterType === 'movies'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Movies ({matchingMovies.length})
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 text-sky-400 mx-auto opacity-50" />
              <p className="text-sm font-medium text-slate-300">
                Explore channels and movies instantly
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['NASA', 'Bloomberg', 'Sci-Fi', 'News', 'Animation', 'Action'].map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => setQuery(keyword)}
                    className="px-3 py-1 rounded-full glass-pill text-xs text-slate-400 hover:text-sky-300 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : combinedResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium text-slate-300">
                No matching channels or movies found for "{query}"
              </p>
              <p className="text-xs text-slate-500">
                Try searching for a channel name, movie genre, or category tag.
              </p>
            </div>
          ) : (
            combinedResults.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              const isChannel = entry.type === 'channel';
              const ch = entry.item as ChannelItem;
              const mov = entry.item as MovieItem;

              return (
                <div
                  key={entry.item.id}
                  onClick={() => handleSelect(entry)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border border-sky-400/40 text-white'
                      : 'hover:bg-white/[0.04] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {isChannel ? (
                        ch.logo ? (
                          <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Tv className="w-5 h-5 text-sky-400" />
                        )
                      ) : mov.poster ? (
                        <img src={mov.poster} alt={mov.title} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {isChannel ? ch.name : mov.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            isChannel
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {isChannel ? 'LIVE TV' : 'MOVIE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {isChannel ? ch.group : mov.genre.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {isChannel ? 'Watch Live' : 'View Info'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
          </div>
          <span>StreamGlass Spotlight</span>
        </div>
      </div>
    </div>
  );
};
