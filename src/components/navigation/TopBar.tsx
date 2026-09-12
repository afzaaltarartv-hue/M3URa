import React from 'react';
import { Search, Sparkles, SlidersHorizontal, Monitor, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    setSearchOpen,
    playlists,
    settings,
    updateSettings,
    channels,
    movies,
  } = useApp();

  const activePlaylist = playlists.find(p => p.id === settings.activePlaylistId);

  return (
    <header
      id="streamglass-topbar"
      className="sticky top-0 z-20 w-full px-4 md:px-8 py-3.5 glass-nav flex items-center justify-between gap-4"
    >
      {/* Mobile brand / Desktop greeting */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/30 to-indigo-500/30 p-[1px] flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-[#0c0f18] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight text-white">StreamGlass</span>
        </div>

        {/* Active Playlist filter selector */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Library:</span>
            <select
              id="active-playlist-selector"
              aria-label="Filter library by playlist"
              value={settings.activePlaylistId}
              onChange={e => updateSettings({ activePlaylistId: e.target.value })}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#121520] text-white dark:bg-[#121520] dark:text-white">
                All Playlists ({channels.length + movies.length} streams)
              </option>
              {playlists.map(p => (
                <option key={p.id} value={p.id} className="bg-[#121520] text-white dark:bg-[#121520] dark:text-white">
                  {p.name} ({p.channelCount + p.movieCount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search Bar Input / Trigger */}
        <button
          id="topbar-search-trigger"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Search channels & movies...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden md:inline px-1 py-0.5 text-[9px] font-mono text-slate-500 bg-white/[0.06] rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          aria-label="Toggle dark or light theme"
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          className="p-2 rounded-full glass-pill text-slate-400 hover:text-white transition-all"
          title={`Theme: ${settings.theme}`}
        >
          {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* TV Mode quick switch */}
        <button
          id="topbar-tv-mode-btn"
          aria-label="Toggle large-screen TV interface mode"
          onClick={() => updateSettings({ tvMode: !settings.tvMode })}
          className={`p-2 rounded-full glass-pill transition-all ${
            settings.tvMode ? 'text-amber-400 border-amber-400/40 bg-amber-500/20' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Large-Screen TV Mode"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
