export type MediaType = 'live' | 'vod' | 'movie';

export interface ChannelItem {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  tvgId?: string;
  tvgName?: string;
  country?: string;
  language?: string;
  playlistId: string;
  isLive: boolean;
  resolution?: '4K' | 'FHD' | 'HD' | 'SD';
  currentProgram?: {
    title: string;
    description?: string;
    startTime: number;
    endTime: number;
  };
}

export interface MovieItem {
  id: string;
  title: string;
  url: string;
  poster?: string;
  backdrop?: string;
  genre: string[];
  year: number;
  duration: number; // in seconds
  description: string;
  rating?: number;
  playlistId: string;
  source: 'playlist' | 'curated';
  resolution?: '4K' | 'FHD' | 'HD' | 'SD';
}

export type AddMovieInput = {
  id?: string;
  title: string;
  url: string;
  poster?: string;
  backdrop?: string;
  genre?: string[];
  year?: number;
  duration?: number;
  description?: string;
  rating?: number;
  resolution?: '4K' | 'FHD' | 'HD' | 'SD';
  playlistId?: string;
};

export interface Playlist {
  id: string;
  name: string;
  sourceType: 'url' | 'file' | 'text' | 'curated';
  sourceUrl?: string;
  channelCount: number;
  movieCount: number;
  groups: string[];
  createdAt: number;
  updatedAt: number;
  enabled: boolean;
  color?: string;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  channelName: string;
  title: string;
  description: string;
  startTime: number; // timestamp ms
  endTime: number; // timestamp ms
  category?: string;
}

export interface WatchHistoryItem {
  contentId: string;
  title: string;
  type: 'live' | 'movie';
  url: string;
  poster?: string;
  group?: string;
  progress: number; // current playback position in seconds
  duration: number; // total duration in seconds (0 if live)
  lastWatched: number; // timestamp ms
}

export interface StreamDiagnostics {
  url: string;
  status: 'idle' | 'loading' | 'playing' | 'buffered' | 'error';
  isLive: boolean;
  resolution?: string;
  bitrate?: number; // bps
  bufferedSeconds?: number;
  droppedFrames?: number;
  currentLevel?: number;
  levelsCount?: number;
  latency?: number;
  errorDetail?: string;
}

export type AccentColor = 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  glassIntensity: 'default' | 'high' | 'minimal';
  accentColor: AccentColor;
  reducedMotion: boolean;
  autoplay: boolean;
  defaultVolume: number; // 0 to 1
  mutedDefault: boolean;
  lowLatencyHls: boolean;
  bufferStrategy: 'balanced' | 'fast-start' | 'smooth';
  tvMode: boolean;
  activePlaylistId: string | 'all';
}
