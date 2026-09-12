import { ChannelItem, MovieItem, Playlist, UserSettings, WatchHistoryItem, AddMovieInput } from '../types';
import { SAMPLE_CHANNELS, SAMPLE_MOVIES, STARTER_PLAYLIST } from './sampleData';

const STORAGE_KEYS = {
  PLAYLISTS: 'streamglass_playlists_v1',
  FAVORITES: 'streamglass_favorites_v1',
  WATCH_HISTORY: 'streamglass_history_v1',
  SETTINGS: 'streamglass_settings_v1',
  CUSTOM_CHANNELS_PREFIX: 'streamglass_ch_',
  CUSTOM_MOVIES_PREFIX: 'streamglass_mov_',
  USER_ADDED_MOVIES: 'streamglass_user_movies_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  glassIntensity: 'default',
  accentColor: 'sky',
  reducedMotion: false,
  autoplay: true,
  defaultVolume: 0.85,
  mutedDefault: false,
  lowLatencyHls: true,
  bufferStrategy: 'balanced',
  tvMode: false,
  activePlaylistId: 'all',
};

class StorageService {
  private memoryChannels: Map<string, ChannelItem[]> = new Map();
  private memoryMovies: Map<string, MovieItem[]> = new Map();

  constructor() {
    // Seed initial starter playlist if empty
    this.initStarterData();
  }

  private initStarterData() {
    try {
      const storedPlaylists = this.getPlaylists();
      if (storedPlaylists.length === 0) {
        this.savePlaylists([STARTER_PLAYLIST]);
      }
    } catch {
      // Fallback
    }
  }

  // --- Settings ---
  getSettings(): UserSettings {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (item) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
      }
    } catch (e) {
      console.warn('Failed to read settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  }

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // --- Playlists ---
  getPlaylists(): Playlist[] {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn('Failed to read playlists', e);
    }
    return [STARTER_PLAYLIST];
  }

  savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists', e);
    }
  }

  deletePlaylist(playlistId: string): void {
    const playlists = this.getPlaylists().filter(p => p.id !== playlistId);
    this.savePlaylists(playlists);
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CHANNELS_PREFIX + playlistId);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_MOVIES_PREFIX + playlistId);
    } catch {
      // Ignore
    }
    this.memoryChannels.delete(playlistId);
    this.memoryMovies.delete(playlistId);
  }

  // --- Channels ---
  getChannels(playlistId?: string): ChannelItem[] {
    const allPlaylists = this.getPlaylists();
    const enabledIds = new Set(allPlaylists.filter(p => p.enabled).map(p => p.id));

    let result: ChannelItem[] = [];

    // Include sample channels if starter playlist is enabled
    if (enabledIds.has(STARTER_PLAYLIST.id) && (!playlistId || playlistId === 'all' || playlistId === STARTER_PLAYLIST.id)) {
      result = result.concat(SAMPLE_CHANNELS);
    }

    // Include custom playlists channels
    allPlaylists.forEach(p => {
      if (p.id === STARTER_PLAYLIST.id) return;
      if (!p.enabled) return;
      if (playlistId && playlistId !== 'all' && p.id !== playlistId) return;

      const channels = this.getChannelsForPlaylist(p.id);
      result = result.concat(channels);
    });

    return result;
  }

  getChannelsForPlaylist(playlistId: string): ChannelItem[] {
    if (playlistId === STARTER_PLAYLIST.id) {
      return SAMPLE_CHANNELS;
    }
    if (this.memoryChannels.has(playlistId)) {
      return this.memoryChannels.get(playlistId) || [];
    }
    try {
      const key = STORAGE_KEYS.CUSTOM_CHANNELS_PREFIX + playlistId;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed: ChannelItem[] = JSON.parse(data);
        this.memoryChannels.set(playlistId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`Failed reading channels for ${playlistId}`, e);
    }
    return [];
  }

  saveChannelsForPlaylist(playlistId: string, channels: ChannelItem[]): void {
    this.memoryChannels.set(playlistId, channels);
    try {
      const key = STORAGE_KEYS.CUSTOM_CHANNELS_PREFIX + playlistId;
      localStorage.setItem(key, JSON.stringify(channels));
    } catch (e) {
      console.warn('Storage limit reached, cached in memory only', e);
    }
  }

  // --- Movies ---
  getUserAddedMovies(): MovieItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_ADDED_MOVIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed reading user added movies', e);
    }
    return [];
  }

  saveUserAddedMovies(movies: MovieItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ADDED_MOVIES, JSON.stringify(movies));
    } catch (e) {
      console.warn('Failed saving user added movies', e);
    }
  }

  addUserMovie(movieData: AddMovieInput): MovieItem {
    const movies = this.getUserAddedMovies();
    const id = movieData.id || `custom-mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMovie: MovieItem = {
      ...movieData,
      id,
      playlistId: movieData.playlistId || 'custom-user-cinema',
      source: 'playlist',
      genre: movieData.genre && movieData.genre.length > 0 ? movieData.genre : ['Cinema'],
      year: movieData.year || new Date().getFullYear(),
      duration: movieData.duration || 7200,
      description: movieData.description || 'Custom added movie stream',
      rating: typeof movieData.rating === 'number' ? movieData.rating : 5.0,
      resolution: movieData.resolution || 'FHD',
    };
    const updated = [newMovie, ...movies.filter(m => m.id !== id)];
    this.saveUserAddedMovies(updated);
    return newMovie;
  }

  deleteUserMovie(id: string): void {
    const movies = this.getUserAddedMovies().filter(m => m.id !== id);
    this.saveUserAddedMovies(movies);
  }

  getMovies(playlistId?: string): MovieItem[] {
    const allPlaylists = this.getPlaylists();
    const enabledIds = new Set(allPlaylists.filter(p => p.enabled).map(p => p.id));

    let result: MovieItem[] = [];

    // Include custom user added movies
    const userAdded = this.getUserAddedMovies();
    if (!playlistId || playlistId === 'all' || playlistId === 'custom-user-cinema') {
      result = result.concat(userAdded);
    }

    if (enabledIds.has(STARTER_PLAYLIST.id) && (!playlistId || playlistId === 'all' || playlistId === STARTER_PLAYLIST.id)) {
      result = result.concat(SAMPLE_MOVIES);
    }

    allPlaylists.forEach(p => {
      if (p.id === STARTER_PLAYLIST.id) return;
      if (!p.enabled) return;
      if (playlistId && playlistId !== 'all' && p.id !== playlistId) return;

      const movies = this.getMoviesForPlaylist(p.id);
      result = result.concat(movies);
    });

    // Deduplicate by ID
    const seen = new Set<string>();
    return result.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  getMoviesForPlaylist(playlistId: string): MovieItem[] {
    if (playlistId === STARTER_PLAYLIST.id) {
      return SAMPLE_MOVIES;
    }
    if (this.memoryMovies.has(playlistId)) {
      return this.memoryMovies.get(playlistId) || [];
    }
    try {
      const key = STORAGE_KEYS.CUSTOM_MOVIES_PREFIX + playlistId;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed: MovieItem[] = JSON.parse(data);
        this.memoryMovies.set(playlistId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`Failed reading movies for ${playlistId}`, e);
    }
    return [];
  }

  saveMoviesForPlaylist(playlistId: string, movies: MovieItem[]): void {
    this.memoryMovies.set(playlistId, movies);
    try {
      const key = STORAGE_KEYS.CUSTOM_MOVIES_PREFIX + playlistId;
      localStorage.setItem(key, JSON.stringify(movies));
    } catch (e) {
      console.warn('Storage limit reached, cached in memory only', e);
    }
  }

  // --- Favorites ---
  getFavoriteIds(): Set<string> {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (item) {
        return new Set(JSON.parse(item));
      }
    } catch {
      // Ignore
    }
    return new Set(['ch-nasa', 'mov-tears-of-steel', 'ch-bloomberg']);
  }

  saveFavoriteIds(favSet: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favSet)));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }

  toggleFavorite(id: string): boolean {
    const favs = this.getFavoriteIds();
    const isFav = favs.has(id);
    if (isFav) {
      favs.delete(id);
    } else {
      favs.add(id);
    }
    this.saveFavoriteIds(favs);
    return !isFav;
  }

  // --- Watch History ---
  getWatchHistory(): WatchHistoryItem[] {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
      if (item) {
        return JSON.parse(item);
      }
    } catch {
      // Ignore
    }
    // Default sample watch history so user has something in "Continue Watching" on first view
    return [
      {
        contentId: 'mov-tears-of-steel',
        title: 'Tears of Steel',
        type: 'movie',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        group: 'Sci-Fi',
        progress: 320,
        duration: 734,
        lastWatched: Date.now() - 3600000 * 2,
      },
      {
        contentId: 'ch-nasa',
        title: 'NASA TV Live',
        type: 'live',
        url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
        logo: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=150&auto=format&fit=crop&q=80',
        group: 'Science & Tech',
        progress: 0,
        duration: 0,
        lastWatched: Date.now() - 3600000 * 5,
      } as any,
    ];
  }

  updateWatchHistory(item: WatchHistoryItem): void {
    const list = this.getWatchHistory().filter(h => h.contentId !== item.contentId);
    list.unshift(item);
    // Keep top 30
    const trimmed = list.slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed saving watch history', e);
    }
  }

  clearWatchHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
    } catch {
      // Ignore
    }
  }

  clearFavorites(): void {
    this.saveFavoriteIds(new Set());
  }

  resetAllData(): void {
    try {
      localStorage.clear();
      this.memoryChannels.clear();
      this.memoryMovies.clear();
      this.initStarterData();
    } catch {
      // Ignore
    }
  }
}

export const storage = new StorageService();
