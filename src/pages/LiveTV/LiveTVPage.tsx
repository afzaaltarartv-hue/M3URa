import React, { useState, useMemo } from 'react';
import {
  Tv,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Filter,
  Sparkles,
  Radio,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelCard } from '../../components/channels/ChannelCard';
import { ChannelItem } from '../../types';

export const LiveTVPage: React.FC = () => {
  const { channels, favoriteIds, playMedia } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showEpgGuide, setShowEpgGuide] = useState(false);

  // Extract unique categories/groups from channels
  const groups = useMemo(() => {
    const set = new Set<string>();
    channels.forEach(c => {
      if (c.group) set.add(c.group);
    });
    return ['All', ...Array.from(set).sort()];
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      // Group filter
      if (selectedGroup !== 'All' && c.group !== selectedGroup) return false;

      // Favorites filter
      if (showFavoritesOnly && !favoriteIds.has(c.id)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesGroup = c.group.toLowerCase().includes(q);
        const matchesProgram = c.currentProgram?.title.toLowerCase().includes(q);
        const matchesCountry = c.country?.toLowerCase().includes(q);
        if (!matchesName && !matchesGroup && !matchesProgram && !matchesCountry) return false;
      }

      return true;
    });
  }, [channels, selectedGroup, showFavoritesOnly, favoriteIds, searchQuery]);

  return (
    <div id="streamglass-livetv-page" className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & IPTV Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>IPTV Channel Deck</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live TV Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stream high-definition live feeds from your imported M3U playlists with EPG metadata.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* EPG Timeline Guide Toggle */}
          <button
            onClick={() => setShowEpgGuide(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              showEpgGuide
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'glass-panel text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showEpgGuide ? 'Hide EPG Guide' : 'EPG Program Guide'}</span>
          </button>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              showFavoritesOnly
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            <span>Favorites</span>
          </button>

          {/* Grid vs List View */}
          <div className="flex items-center bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {groups.map(grp => {
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected ? 'glass-pill-active' : 'glass-pill text-slate-400 hover:text-white'
                }`}
              >
                {grp}
              </button>
            );
          })}
        </div>

        {/* Local Channel Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter channels..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
          />
        </div>
      </div>

      {/* Electronic Program Guide (EPG) Schedule Deck if toggled */}
      {showEpgGuide && (
        <section className="glass-panel p-5 rounded-3xl border border-sky-400/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Electronic Program Guide (EPG Timeline)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Live broadcast schedule
            </span>
          </div>

          <div className="space-y-2">
            {filteredChannels.slice(0, 5).map(ch => {
              const prog = ch.currentProgram;
              const formatTime = (ts: number) =>
                new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={ch.id}
                  onClick={() => playMedia(ch)}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {ch.logo ? (
                        <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Tv className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{ch.name}</h4>
                      <p className="text-xs text-sky-400 font-medium">
                        {prog ? prog.title : 'Live Television Broadcast'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    {prog && (
                      <span className="font-mono bg-white/[0.06] px-2.5 py-1 rounded-lg">
                        {formatTime(prog.startTime)} — {formatTime(prog.endTime)}
                      </span>
                    )}
                    <button className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 font-semibold hover:bg-sky-500/30">
                      Tune In →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Channel Results Grid / List */}
      {filteredChannels.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 max-w-md mx-auto my-10">
          <Tv className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Channels Found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No channels match "${searchQuery}" in category "${selectedGroup}".`
              : 'No channels available with the current filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('All');
              setShowFavoritesOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30 hover:bg-sky-500/30"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredChannels.map(ch => (
            <ChannelCard key={ch.id} channel={ch} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChannels.map(ch => (
            <ChannelCard key={ch.id} channel={ch} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};
