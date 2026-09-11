import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  PlaySquare,
  HardDrive,
  Info,
  Sliders,
  Check,
  RotateCcw,
  Download,
  Upload,
  Radio,
  ExternalLink,
  ShieldCheck,
  Activity,
  Tv,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { AccentColor } from '../../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, refreshContent, playMedia } = useApp();
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Stream Tester tool state
  const [testStreamUrl, setTestStreamUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');

  const showConfirmation = (msg: string) => {
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 3000);
  };

  const accents: { id: AccentColor; name: string; color: string }[] = [
    { id: 'sky', name: 'Electric Azure', color: '#38bdf8' },
    { id: 'emerald', name: 'Emerald Cyan', color: '#10b981' },
    { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
    { id: 'rose', name: 'Crimson Glow', color: '#f43f5e' },
    { id: 'violet', name: 'Royal Amethyst', color: '#8b5cf6' },
  ];

  const handleExportBackup = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      playlists: storage.getPlaylists(),
      settings: storage.getSettings(),
      favorites: Array.from(storage.getFavoriteIds()),
      history: storage.getWatchHistory(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streamglass-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showConfirmation('Backup configuration exported successfully!');
  };

  const handleClearHistory = () => {
    if (confirm('Clear all Continue Watching items and playback history?')) {
      storage.clearWatchHistory();
      refreshContent();
      showConfirmation('Watch history cleared.');
    }
  };

  const handleClearFavorites = () => {
    if (confirm('Remove all starred channels and movies from Favorites?')) {
      storage.clearFavorites();
      refreshContent();
      showConfirmation('Favorites list reset.');
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset entire StreamGlass application? This will restore default starter playlists and clear local cache.')) {
      storage.resetAllData();
      refreshContent();
      showConfirmation('Application reset to factory defaults.');
    }
  };

  const handleTestStream = () => {
    if (!testStreamUrl.trim()) return;
    playMedia({
      id: 'test-stream-' + Date.now(),
      name: 'Stream Tester Preview',
      url: testStreamUrl.trim(),
      group: 'Diagnostics',
      playlistId: 'custom',
      isLive: testStreamUrl.includes('.m3u8'),
      resolution: 'HD',
    });
  };

  return (
    <div id="streamglass-settings-page" className="space-y-8 pb-16 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Preferences & System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            StreamGlass Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fine-tune interface aesthetics, HLS buffer pipelines, and local data persistence.
          </p>
        </div>
      </div>

      {saveAlert && (
        <div className="p-4 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-sky-400" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* 1. Appearance & Liquid Glass */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Palette className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Appearance & Liquid Glass Aesthetic
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Theme selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-white block">Visual Theme</span>
              <span className="text-slate-400">Select interface contrast and background illumination</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                  settings.theme === 'dark' ? 'bg-sky-500 text-white' : 'glass-pill text-slate-400 hover:text-white'
                }`}
              >
                Dark Cinematic
              </button>
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                  settings.theme === 'light' ? 'bg-sky-500 text-white' : 'glass-pill text-slate-400 hover:text-white'
                }`}
              >
                Refined Light
              </button>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">Accent Color Glow</span>
              <span className="text-slate-400">Specifies the luminescent highlight used for active states</span>
            </div>
            <div className="flex items-center gap-2">
              {accents.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => updateSettings({ accentColor: acc.id })}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    settings.accentColor === acc.id ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110 opacity-75'
                  }`}
                  style={{ backgroundColor: acc.color }}
                  title={acc.name}
                >
                  {settings.accentColor === acc.id && <Check className="w-3.5 h-3.5 text-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Intensity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">Liquid Glass Blur Intensity</span>
              <span className="text-slate-400">Controls backdrop-filter diffusion across navigation & cards</span>
            </div>
            <div className="flex items-center gap-2">
              {(['minimal', 'default', 'high'] as const).map(intensity => (
                <button
                  key={intensity}
                  onClick={() => updateSettings({ glassIntensity: intensity })}
                  className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all ${
                    settings.glassIntensity === intensity
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          {/* TV Interface Mode */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">TV Remote Navigation Mode</span>
              <span className="text-slate-400">Enhances focus rings, typography size, and remote D-pad usability</span>
            </div>
            <button
              onClick={() => updateSettings({ tvMode: !settings.tvMode })}
              className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                settings.tvMode ? 'bg-amber-500 text-black' : 'glass-pill text-slate-400'
              }`}
            >
              {settings.tvMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Playback & HLS Engine */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <PlaySquare className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Playback & Streaming Engine
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Autoplay */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Autoplay on Select</span>
              <span className="text-slate-400">Immediately commence playback when opening a channel or movie</span>
            </div>
            <button
              onClick={() => updateSettings({ autoplay: !settings.autoplay })}
              className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                settings.autoplay ? 'bg-sky-500 text-white' : 'glass-pill text-slate-400'
              }`}
            >
              {settings.autoplay ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Low Latency HLS */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">Low-Latency HLS (LL-HLS)</span>
              <span className="text-slate-400">Reduces broadcast delay relative to live satellite transmission</span>
            </div>
            <button
              onClick={() => updateSettings({ lowLatencyHls: !settings.lowLatencyHls })}
              className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                settings.lowLatencyHls ? 'bg-sky-500 text-white' : 'glass-pill text-slate-400'
              }`}
            >
              {settings.lowLatencyHls ? 'Active' : 'Standard'}
            </button>
          </div>

          {/* Buffer Strategy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">Buffering Pipeline Strategy</span>
              <span className="text-slate-400">Adapt player buffer length for rapid channel zapping vs network resilience</span>
            </div>
            <div className="flex items-center gap-2">
              {(['fast-start', 'balanced', 'smooth'] as const).map(strat => (
                <button
                  key={strat}
                  onClick={() => updateSettings({ bufferStrategy: strat })}
                  className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all ${
                    settings.bufferStrategy === strat
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  {strat.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Default Volume */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-semibold text-white block">Default Starting Volume</span>
              <span className="text-slate-400">{Math.round(settings.defaultVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.defaultVolume}
              onChange={e => updateSettings({ defaultVolume: parseFloat(e.target.value) })}
              className="w-36 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      </section>

      {/* 3. Stream Diagnostics & Direct URL Tester */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Diagnostics & Direct Stream Tester
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Directly test any HLS (.m3u8), MP4, or DASH media stream URL without creating a playlist.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={testStreamUrl}
            onChange={e => setTestStreamUrl(e.target.value)}
            placeholder="https://example.com/live/master.m3u8"
            className="flex-1 px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white font-mono border border-white/10 focus:outline-none focus:border-sky-400"
          />
          <button
            onClick={handleTestStream}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            Launch Test Stream
          </button>
        </div>
      </section>

      {/* 4. Local Storage & Privacy */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Local Storage & Data Management
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-white hover:bg-white/10"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Backup JSON</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white"
          >
            <span>Clear Watch History</span>
          </button>

          <button
            onClick={handleClearFavorites}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white"
          >
            <span>Reset Favorites</span>
          </button>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset StreamGlass</span>
          </button>
        </div>
      </section>

      {/* 5. About & Architecture */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>StreamGlass Personal Streaming Operating System</span>
        </div>
        <p className="leading-relaxed">
          Version 1.0.0 • Client-side local architecture. StreamGlass never uploads user playlists, tokens, or playback logs to external central servers. All playlists and watch progress are maintained securely within your browser's sandboxed local storage and IndexedDB engines.
        </p>
      </section>
    </div>
  );
};
