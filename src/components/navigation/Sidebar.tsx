import React from 'react';
import {
  Home,
  Tv,
  Film,
  Heart,
  ListVideo,
  Settings,
  Monitor,
  Search,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSearchOpen,
    playlists,
    settings,
    updateSettings,
    channels,
    movies,
  } = useApp();

  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live TV', icon: Tv, count: channels.length },
    { id: 'movies', label: 'Movies & VOD', icon: Film, count: movies.length },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'playlists', label: 'Playlists', icon: ListVideo, count: playlists.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="streamglass-sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed left-0 top-0 z-30 glass-panel border-r border-white/[0.08] bg-[#0c0e15]/80 backdrop-blur-2xl text-slate-300 select-none p-4 transition-all duration-300"
    >
      {/* Brand Identity */}
      <div className="flex items-center justify-between px-3 py-3 mb-6">
        <div
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-sky-400/40 p-[1px] shadow-lg shadow-sky-500/10 group-hover:shadow-sky-500/25 transition-all">
            <div className="w-full h-full rounded-2xl bg-[#0d111b]/90 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -inset-0.5 rounded-2xl bg-sky-400/20 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              StreamGlass
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-sky-400/80 block">
              Liquid Cinema OS
            </span>
          </div>
        </div>
      </div>

      {/* Quick Search Button */}
      <button
        id="sidebar-search-btn"
        onClick={() => setSearchOpen(true)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 mb-6 rounded-xl glass-panel-subtle text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.06] group"
      >
        <div className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
          <span className="text-xs">Quick Search...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.06] rounded border border-white/[0.08]">
          ⌘K
        </kbd>
      </button>

      {/* Navigation Sections */}
      <div className="space-y-1 flex-1 overflow-y-auto pr-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-sky-500/5 text-white border border-sky-400/30 shadow-[0_0_20px_rgba(56,189,248,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-sky-400/20 text-sky-300'
                      : 'bg-white/[0.06] text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Active Playlist Indicator */}
        <div className="pt-6 pb-2 px-3">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Playlists ({playlists.length})</span>
            <button
              onClick={() => setCurrentPage('playlists')}
              className="text-sky-400 hover:underline capitalize"
            >
              Manage
            </button>
          </div>
        </div>

        <div className="space-y-1 px-1">
          {playlists.slice(0, 3).map(p => (
            <div
              key={p.id}
              onClick={() => setCurrentPage('playlists')}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    p.enabled ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'
                  }`}
                />
                <span className="truncate">{p.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {p.channelCount + p.movieCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TV Mode & Footer Info */}
      <div className="pt-4 mt-auto border-t border-white/[0.08] space-y-2">
        <button
          id="toggle-tv-mode-btn"
          onClick={() => updateSettings({ tvMode: !settings.tvMode })}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-all ${
            settings.tvMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'glass-panel-subtle text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span>TV Interface Mode</span>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
              settings.tvMode ? 'bg-amber-400/30 text-amber-200' : 'bg-white/[0.06] text-slate-500'
            }`}
          >
            {settings.tvMode ? 'ON' : 'OFF'}
          </span>
        </button>

        <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Streams Ready
          </span>
          <span className="font-mono text-[10px]">v1.0 • Client-Only</span>
        </div>
      </div>
    </aside>
  );
};
