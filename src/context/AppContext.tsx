import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChannelItem, MovieItem, Playlist, UserSettings, WatchHistoryItem } from '../types';
import { storage } from '../services/storage';

export type NavigationPage = 'home' | 'live' | 'movies' | 'favorites' | 'playlists' | 'settings';
export type PlayerDisplayMode = 'hidden' | 'modal' | 'pip' | 'fullscreen';

interface AppContextType {
  // Navigation
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;

  // Active Media / Playback
  activeMedia: ChannelItem | MovieItem | null;
  playerDisplayMode: PlayerDisplayMode;
  playMedia: (item: ChannelItem | MovieItem, mode?: PlayerDisplayMode) => void;
  closePlayer: () => void;
  setPlayerDisplayMode: (mode: PlayerDisplayMode) => void;
  playNextChannel: () => void;
  playPrevChannel: () => void;

  // Data
  playlists: Playlist[];
  channels: ChannelItem[];
  movies: MovieItem[];
  favoriteIds: Set<string>;
  watchHistory: WatchHistoryItem[];
  settings: UserSettings;

  // Actions
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  refreshContent: () => void;
  addPlaylistData: (playlist: Playlist, channels: ChannelItem[], movies: MovieItem[]) => void;
  deletePlaylist: (id: string) => void;
  togglePlaylistEnabled: (id: string) => void;
  updateWatchProgress: (contentId: string, progress: number, duration: number) => void;

  // Modals & UI
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedMovie: MovieItem | null;
  setSelectedMovie: (movie: MovieItem | null) => void;
  quickChannelDrawerOpen: boolean;
  setQuickChannelDrawerOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [activeMedia, setActiveMedia] = useState<ChannelItem | MovieItem | null>(null);
  const [playerDisplayMode, setPlayerDisplayMode] = useState<PlayerDisplayMode>('hidden');

  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [channels, setChannels] = useState<ChannelItem[]>(() => storage.getChannels(settings.activePlaylistId));
  const [movies, setMovies] = useState<MovieItem[]>(() => storage.getMovies(settings.activePlaylistId));
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => storage.getFavoriteIds());
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => storage.getWatchHistory());

  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [quickChannelDrawerOpen, setQuickChannelDrawerOpen] = useState(false);

  // Sync content when active playlist or playlists change
  const refreshContent = useCallback(() => {
    const pl = storage.getPlaylists();
    const st = storage.getSettings();
    setPlaylists(pl);
    setChannels(storage.getChannels(st.activePlaylistId));
    setMovies(storage.getMovies(st.activePlaylistId));
    setFavoriteIds(storage.getFavoriteIds());
    setWatchHistory(storage.getWatchHistory());
    setSettings(st);
  }, []);

  const playMedia = useCallback((item: ChannelItem | MovieItem, mode: PlayerDisplayMode = 'modal') => {
    setActiveMedia(item);
    setPlayerDisplayMode(mode);

    // Record initial history
    const isLive = 'isLive' in item ? item.isLive : false;
    const historyItem: WatchHistoryItem = {
      contentId: item.id,
      title: 'name' in item ? item.name : item.title,
      type: isLive ? 'live' : 'movie',
      url: item.url,
      poster: 'logo' in item ? item.logo : ('poster' in item ? (item as MovieItem).poster : undefined),
      group: 'group' in item ? item.group : ('genre' in item ? (item as MovieItem).genre?.[0] : undefined),
      progress: 0,
      duration: isLive ? 0 : ('duration' in item ? (item as MovieItem).duration : 0),
      lastWatched: Date.now(),
    };
    storage.updateWatchHistory(historyItem);
    setWatchHistory(storage.getWatchHistory());
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerDisplayMode('hidden');
    setActiveMedia(null);
  }, []);

  const playNextChannel = useCallback(() => {
    if (!activeMedia || !('isLive' in activeMedia)) return;
    const idx = channels.findIndex(c => c.id === activeMedia.id);
    if (idx !== -1 && idx < channels.length - 1) {
      playMedia(channels[idx + 1], playerDisplayMode);
    } else if (channels.length > 0) {
      playMedia(channels[0], playerDisplayMode);
    }
  }, [activeMedia, channels, playerDisplayMode, playMedia]);

  const playPrevChannel = useCallback(() => {
    if (!activeMedia || !('isLive' in activeMedia)) return;
    const idx = channels.findIndex(c => c.id === activeMedia.id);
    if (idx > 0) {
      playMedia(channels[idx - 1], playerDisplayMode);
    } else if (channels.length > 0) {
      playMedia(channels[channels.length - 1], playerDisplayMode);
    }
  }, [activeMedia, channels, playerDisplayMode, playMedia]);

  const toggleFavorite = useCallback((id: string) => {
    const updatedFavs = new Set<string>(Array.from(favoriteIds));
    if (updatedFavs.has(id)) {
      updatedFavs.delete(id);
    } else {
      updatedFavs.add(id);
    }
    storage.saveFavoriteIds(updatedFavs);
    setFavoriteIds(updatedFavs);
  }, [favoriteIds]);

  const isFavorite = useCallback((id: string) => {
    return favoriteIds.has(id);
  }, [favoriteIds]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      storage.saveSettings(next);
      return next;
    });
  }, []);

  const addPlaylistData = useCallback((playlist: Playlist, newChannels: ChannelItem[], newMovies: MovieItem[]) => {
    const current = storage.getPlaylists();
    const filtered = current.filter(p => p.id !== playlist.id);
    const updated = [playlist, ...filtered];
    storage.savePlaylists(updated);
    storage.saveChannelsForPlaylist(playlist.id, newChannels);
    storage.saveMoviesForPlaylist(playlist.id, newMovies);
    refreshContent();
  }, [refreshContent]);

  const deletePlaylist = useCallback((id: string) => {
    storage.deletePlaylist(id);
    refreshContent();
  }, [refreshContent]);

  const togglePlaylistEnabled = useCallback((id: string) => {
    const list = storage.getPlaylists().map(p => {
      if (p.id === id) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    storage.savePlaylists(list);
    refreshContent();
  }, [refreshContent]);

  const updateWatchProgress = useCallback((contentId: string, progress: number, duration: number) => {
    const current = storage.getWatchHistory();
    const existing = current.find(h => h.contentId === contentId);
    if (existing) {
      existing.progress = progress;
      existing.duration = duration;
      existing.lastWatched = Date.now();
      storage.updateWatchHistory(existing);
      setWatchHistory([...storage.getWatchHistory()]);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (selectedMovie) setSelectedMovie(null);
        if (quickChannelDrawerOpen) setQuickChannelDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, selectedMovie, quickChannelDrawerOpen]);

  // Apply theme and accent color CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }

    const accents: Record<string, { color: string; glow: string }> = {
      sky: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)' },
      emerald: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
      amber: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' },
      rose: { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)' },
      violet: { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.25)' },
    };

    const currentAccent = accents[settings.accentColor] || accents.sky;
    root.style.setProperty('--accent-color', currentAccent.color);
    root.style.setProperty('--accent-glow', currentAccent.glow);
  }, [settings.theme, settings.accentColor]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        activeMedia,
        playerDisplayMode,
        playMedia,
        closePlayer,
        setPlayerDisplayMode,
        playNextChannel,
        playPrevChannel,
        playlists,
        channels,
        movies,
        favoriteIds,
        watchHistory,
        settings,
        toggleFavorite,
        isFavorite,
        updateSettings,
        refreshContent,
        addPlaylistData,
        deletePlaylist,
        togglePlaylistEnabled,
        updateWatchProgress,
        searchOpen,
        setSearchOpen,
        selectedMovie,
        setSelectedMovie,
        quickChannelDrawerOpen,
        setQuickChannelDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
