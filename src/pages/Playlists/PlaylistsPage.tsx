import React, { useState } from 'react';
import {
  ListVideo,
  Upload,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  Layers,
  Power,
  Tv,
  Film,
  Plus,
  Play,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseM3U } from '../../services/m3uParser';
import { SAMPLE_M3U_TEMPLATE, STARTER_PLAYLIST_ID } from '../../services/sampleData';
import { Playlist } from '../../types';

export const PlaylistsPage: React.FC = () => {
  const {
    playlists,
    addPlaylistData,
    deletePlaylist,
    togglePlaylistEnabled,
    refreshContent,
    playMedia,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'direct' | 'upload' | 'url' | 'paste'>('direct');

  // Form states for general playlist import
  const [playlistName, setPlaylistName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inspectPlaylist, setInspectPlaylist] = useState<Playlist | null>(null);

  // Form states for Direct Single Stream / MP4 / M3U8
  const [directTitle, setDirectTitle] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [directType, setDirectType] = useState<'movie' | 'live'>('movie');
  const [directGenre, setDirectGenre] = useState('Musical, Drama');
  const [directPoster, setDirectPoster] = useState('');
  const [directYear, setDirectYear] = useState('2011');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // File Upload Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = () => {
    setPlaylistName('');
    setUrlInput('');
    setTextInput('');
    setDirectTitle('');
    setDirectUrl('');
    setDirectPoster('');
    setErrorMsg(null);
  };

  const processM3UText = (content: string, name: string, sourceType: 'file' | 'url' | 'text' | 'curated', sourceUrl?: string) => {
    try {
      if (!content || !content.includes('#EXTINF') && !content.includes('http')) {
        throw new Error('The provided file or text does not appear to contain valid M3U playlist entries.');
      }

      const id = 'pl-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      const cleanName = name.trim() || `Playlist ${new Date().toLocaleDateString()}`;

      const parsed = parseM3U(content, {
        id,
        name: cleanName,
        sourceType,
        sourceUrl,
      });

      if (parsed.channels.length === 0 && parsed.movies.length === 0) {
        throw new Error('No playable stream URLs were detected in this M3U file.');
      }

      addPlaylistData(parsed.playlist, parsed.channels, parsed.movies);
      setSuccessMsg(`Successfully imported "${cleanName}" with ${parsed.channels.length} Live channels and ${parsed.movies.length} movies across ${parsed.groups.length} categories!`);
      resetForm();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to parse M3U playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle File Input
  const handleFileChange = (file: File) => {
    if (!file) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      processM3UText(content, playlistName || baseName, 'file');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the local file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle URL Import
  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // If user provided a direct video file (MP4, MKV, WebM, etc.), handle directly without fetching 1GB binary data
      const isDirectVideo = /\.(mp4|mkv|webm|avi|mov)($|\?)/i.test(cleanUrl);
      if (isDirectVideo) {
        let inferredTitle = playlistName.trim();
        if (!inferredTitle) {
          try {
            const urlObj = new URL(cleanUrl);
            const fname = decodeURIComponent(urlObj.pathname).split('/').filter(Boolean).pop() || 'Direct Video';
            inferredTitle = fname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          } catch {
            inferredTitle = 'Direct Video';
          }
        }
        const m3uSnippet = `#EXTM3U\n#EXTINF:-1 group-title="Movies", ${inferredTitle}\n${cleanUrl}`;
        processM3UText(m3uSnippet, inferredTitle, 'url', cleanUrl);
        return;
      }

      // First attempt direct fetch
      let response: Response;
      try {
        response = await fetch(cleanUrl);
      } catch {
        // If direct fetch fails due to CORS, provide clear helpful instructions
        throw new Error(
          'Direct network request to this M3U URL was restricted by CORS. You can download the M3U file in your browser and upload it directly via the "File Upload" tab, or copy-paste its content into the "Paste M3U" tab!'
        );
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      const defaultName = playlistName.trim() || new URL(cleanUrl).pathname.split('/').pop() || 'Remote Playlist';
      processM3UText(content, defaultName, 'url', cleanUrl);
    } catch (e: any) {
      setErrorMsg(e.message || 'Unable to import from URL.');
      setIsLoading(false);
    }
  };

  // Handle Direct Single Stream / MP4 Form Submit
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const title = directTitle.trim() || 'Custom Stream';
    const group = directGenre.trim() || (directType === 'movie' ? 'Movies' : 'Live Streams');
    const poster = directPoster.trim() || (directType === 'movie'
      ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&auto=format&fit=crop&q=80');
    const duration = directType === 'movie' ? 7200 : -1;
    const year = directYear ? parseInt(directYear, 10) : new Date().getFullYear();

    const m3uSnippet = `#EXTM3U\n#EXTINF:${duration} tvg-name="${title}" tvg-logo="${poster}" group-title="${group}",${title} (${year})\n${directUrl.trim()}`;
    processM3UText(m3uSnippet, title, 'text', directUrl.trim());
  };

  const loadRockstarPreset = () => {
    setDirectTitle('Rockstar (2011)');
    setDirectUrl('https://archive.org/download/rockstar-2011/Rockstar%20%282011%29.mp4');
    setDirectType('movie');
    setDirectGenre('Musical, Drama, Romance');
    setDirectYear('2011');
    setDirectPoster('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80');
    setErrorMsg(null);
  };

  // Handle Paste Import
  const handlePasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    processM3UText(textInput, playlistName || 'Pasted Playlist', 'text');
  };

  // Quick-load demo template into paste field
  const loadDemoTemplate = () => {
    setTextInput(SAMPLE_M3U_TEMPLATE);
    setPlaylistName('Demo Curated Pack');
    setErrorMsg(null);
  };

  return (
    <div id="streamglass-playlists-page" className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ListVideo className="w-4 h-4" />
            <span>M3U / M3U8 Master Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Playlist Management & Import
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Import, organize, and toggle live IPTV playlists, EPG feeds, and on-demand video libraries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Total Active Playlists</span>
            <span className="text-lg font-bold text-white">{playlists.filter(p => p.enabled).length} of {playlists.length}</span>
          </div>
        </div>
      </div>

      {/* Success and Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Import Methods Panel */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        {/* Method Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            id="tab-btn-direct"
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Add Single Movie / Video (MP4, M3U8)</span>
          </button>

          <button
            id="tab-btn-upload"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File (.m3u / .m3u8)</span>
          </button>

          <button
            id="tab-btn-url"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Import from URL</span>
          </button>

          <button
            id="tab-btn-paste"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Raw M3U</span>
          </button>
        </div>

        {/* Tab 0: Direct Single Video (MP4 / M3U8) */}
        {activeTab === 'direct' && (
          <form onSubmit={handleDirectSubmit} className="space-y-5 max-w-2xl animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs">
              <span>Add any direct MP4 video link or M3U8 live stream directly without needing an M3U file.</span>
              <button
                type="button"
                onClick={loadRockstarPreset}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Rockstar (2011) MP4</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rockstar (2011)"
                  value={directTitle}
                  onChange={e => setDirectTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Stream Type
                </label>
                <select
                  value={directType}
                  onChange={e => setDirectType(e.target.value as 'movie' | 'live')}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white bg-[#121520] focus:outline-none focus:border-sky-400 border border-white/10"
                >
                  <option value="movie">Movie / VOD (MP4, MKV, WebM)</option>
                  <option value="live">Live TV Channel (M3U8 / HLS)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Direct Stream / Video URL (MP4 or M3U8) <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://archive.org/download/.../Rockstar%20%282011%29.mp4"
                value={directUrl}
                onChange={e => setDirectUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Genre / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Musical, Drama, Romance"
                  value={directGenre}
                  onChange={e => setDirectGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Release Year
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2011"
                  value={directYear}
                  onChange={e => setDirectYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Poster Artwork URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={directPoster}
                onChange={e => setDirectPoster(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Video Library</span>
            </button>
          </form>
        )}

        {/* Tab 1: File Upload (Drag and Drop) */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="max-w-md">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Playlist Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. My Premium Sports & News"
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
              }`}
            >
              <input
                type="file"
                accept=".m3u,.m3u8,.txt"
                onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Drag and drop your .m3u or .m3u8 file here
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Supports standard M3U, extended M3U (#EXTINF), TVG metadata, and custom stream groups.
                </p>
                <span className="px-4 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-semibold">
                  Browse Files
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: URL Import */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlImport} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Playlist Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. World Satellite Feeds"
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                M3U / M3U8 Direct Feed URL
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/playlist.m3u8"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10 font-mono"
              />
            </div>

            {/* Quick Sample URLs */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2">
              <span className="text-slate-400 font-semibold block">Quick Test Sources:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('https://iptv-org.github.io/iptv/countries/us.m3u');
                    setPlaylistName('IPTV-Org United States');
                  }}
                  className="px-3 py-1 rounded-lg glass-pill text-[11px] text-sky-300 hover:text-white"
                >
                  US Public Channels (IPTV-Org)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('https://iptv-org.github.io/iptv/categories/news.m3u');
                    setPlaylistName('Global Public News');
                  }}
                  className="px-3 py-1 rounded-lg glass-pill text-[11px] text-sky-300 hover:text-white"
                >
                  Global News Channels
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching & Parsing Feed...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Import Playlist from URL</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Paste Raw M3U */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePasteImport} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Playlist Name"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>
              <button
                type="button"
                onClick={loadDemoTemplate}
                className="px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-sky-300 hover:text-white"
              >
                Insert Sample M3U Code
              </button>
            </div>

            <textarea
              rows={8}
              required
              placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-name=&quot;Channel 1&quot; group-title=&quot;News&quot;,Channel One&#10;https://example.com/stream.m3u8"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              className="w-full p-4 rounded-2xl glass-panel-subtle text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-400 border border-white/10 leading-relaxed"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Parse and Import Streams</span>
            </button>
          </form>
        )}
      </section>

      {/* Existing Playlists Table / Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">
              Imported Playlists ({playlists.length})
            </h2>
          </div>
          <button
            onClick={refreshContent}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(pl => {
            const isStarter = pl.id === STARTER_PLAYLIST_ID;
            return (
              <div
                key={pl.id}
                className={`p-5 rounded-3xl glass-card border transition-all flex flex-col justify-between ${
                  pl.enabled
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-white/[0.04] bg-white/[0.01] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        pl.sourceType === 'curated'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                          : pl.sourceType === 'url'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {pl.sourceType}
                    </span>

                    <button
                      onClick={() => togglePlaylistEnabled(pl.id)}
                      title={pl.enabled ? 'Disable Playlist' : 'Enable Playlist'}
                      className={`p-1.5 rounded-full transition-all ${
                        pl.enabled ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 bg-white/5'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-white truncate mb-1">
                    {pl.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-sky-400" />
                      {pl.channelCount} Channels
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      {pl.movieCount} Movies
                    </span>
                  </div>

                  {pl.groups && pl.groups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pl.groups.slice(0, 3).map((g, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-slate-400"
                        >
                          {g}
                        </span>
                      ))}
                      {pl.groups.length > 3 && (
                        <span className="text-[10px] text-slate-500 py-0.5">
                          +{pl.groups.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(pl.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectPlaylist(pl)}
                      className="p-1.5 rounded-lg glass-pill text-slate-300 hover:text-white"
                      title="Inspect Metadata"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {!isStarter && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete playlist "${pl.name}"?`)) {
                            deletePlaylist(pl.id);
                          }
                        }}
                        className="p-1.5 rounded-lg glass-pill text-rose-400 hover:bg-rose-500/20"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Playlist Inspector Modal */}
      {inspectPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setInspectPlaylist(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-white/20 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Playlist Details</h3>
              <button onClick={() => setInspectPlaylist(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-white">{inspectPlaylist.name}</span></div>
              <div><span className="text-slate-500">ID:</span> <span className="font-mono text-[11px]">{inspectPlaylist.id}</span></div>
              <div><span className="text-slate-500">Type:</span> <span className="capitalize">{inspectPlaylist.sourceType}</span></div>
              {inspectPlaylist.sourceUrl && (
                <div><span className="text-slate-500">Source URL:</span> <span className="truncate block font-mono text-[11px] text-sky-400">{inspectPlaylist.sourceUrl}</span></div>
              )}
              <div><span className="text-slate-500">Channels:</span> <span className="text-emerald-400 font-bold">{inspectPlaylist.channelCount}</span></div>
              <div><span className="text-slate-500">Movies:</span> <span className="text-sky-400 font-bold">{inspectPlaylist.movieCount}</span></div>
              <div><span className="text-slate-500">Categories:</span> <span className="block mt-1">{inspectPlaylist.groups.join(', ')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
