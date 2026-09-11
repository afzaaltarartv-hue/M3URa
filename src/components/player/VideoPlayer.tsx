import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Radio,
  Tv,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  X,
  PictureInPicture2,
  Settings as SettingsIcon,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StreamDiagnostics } from '../../types';

export const VideoPlayer: React.FC = () => {
  const {
    activeMedia,
    playerDisplayMode,
    setPlayerDisplayMode,
    closePlayer,
    playNextChannel,
    playPrevChannel,
    channels,
    playMedia,
    settings,
    updateWatchProgress,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(settings.defaultVolume);
  const [isMuted, setIsMuted] = useState(settings.mutedDefault);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // HLS diagnostics
  const [diagnostics, setDiagnostics] = useState<StreamDiagnostics>({
    url: '',
    status: 'idle',
    isLive: false,
  });
  const [availableLevels, setAvailableLevels] = useState<{ index: number; name: string; height: number; bitrate: number }[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(-1); // -1 = Auto

  const isLive = activeMedia ? ('isLive' in activeMedia ? activeMedia.isLive : false) : false;
  const mediaTitle = activeMedia ? ('name' in activeMedia ? activeMedia.name : activeMedia.title) : '';
  const mediaGroup = activeMedia ? ('group' in activeMedia ? activeMedia.group : activeMedia.genre?.[0]) : '';

  // Handle Controls hide on inactivity
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Clean up HLS on unmount or URL change
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Initialize and load stream
  const initPlayback = useCallback(() => {
    if (!activeMedia || !videoRef.current) return;

    destroyHls();
    setIsLoading(true);
    setErrorMessage(null);

    const video = videoRef.current;
    const streamUrl = activeMedia.url;

    setDiagnostics({
      url: streamUrl,
      status: 'loading',
      isLive,
    });

    const isHlsStream = streamUrl.includes('.m3u8') || streamUrl.includes('/hls/');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: settings.lowLatencyHls,
        backBufferLength: settings.bufferStrategy === 'fast-start' ? 10 : 30,
        maxBufferLength: settings.bufferStrategy === 'smooth' ? 60 : 30,
        maxMaxBufferLength: 120,
        maxBufferSize: 30 * 1000 * 1000,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        setDiagnostics(prev => ({ ...prev, status: 'playing' }));

        // Populate quality levels
        const levels = data.levels.map((lvl, index) => ({
          index,
          name: lvl.name || (lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`),
          height: lvl.height,
          bitrate: lvl.bitrate,
        }));
        setAvailableLevels(levels);

        if (settings.autoplay) {
          video.play().catch(() => {
            // Browser autoplay restrictions may require user interaction
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        if (level) {
          setDiagnostics(prev => ({
            ...prev,
            currentLevel: data.level,
            resolution: `${level.width}x${level.height}`,
            bitrate: level.bitrate,
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('Hls error event:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Network error encountered while loading stream. Click Retry to reconnect.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage('Media decoding error. Recovering buffer...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage(`Stream playback error: ${data.details || 'Unable to connect to source'}`);
              destroyHls();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsStream) {
      // Native HLS (Safari/iOS) or regular MP4/WebM video
      video.src = streamUrl;
      video.load();

      if (settings.autoplay) {
        video.play().catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      setErrorMessage('Your browser cannot play this stream format directly.');
    }
  }, [activeMedia, destroyHls, isLive, settings.autoplay, settings.bufferStrategy, settings.lowLatencyHls]);

  useEffect(() => {
    initPlayback();
    return () => {
      destroyHls();
    };
  }, [initPlayback, destroyHls]);

  // Video Event Handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
      if (activeMedia && !isLive && video.duration > 0) {
        updateWatchProgress(activeMedia.id, video.currentTime, video.duration);
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleError = () => {
      setIsLoading(false);
      setErrorMessage('Stream failed to load. Check that the source URL is active and accessible via CORS.');
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('error', handleError);
    };
  }, [activeMedia, isLive, updateWatchProgress]);

  // Keyboard Navigation inside Player
  useEffect(() => {
    if (playerDisplayMode === 'hidden') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          if (!isLive) {
            e.preventDefault();
            seekRelative(10);
          }
          break;
        case 'arrowleft':
          if (!isLive) {
            e.preventDefault();
            seekRelative(-10);
          }
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'n':
          if (isLive) {
            e.preventDefault();
            playNextChannel();
          }
          break;
        case 'p':
          if (isLive) {
            e.preventDefault();
            playPrevChannel();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerDisplayMode, isLive, playNextChannel, playPrevChannel]);

  // Controls Methods
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const adjustVolume = (delta: number) => {
    if (!videoRef.current) return;
    const newVol = Math.min(1, Math.max(0, volume + delta));
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || isLive) return;
    const target = parseFloat(e.target.value);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current || isLive) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // If browser PiP is unavailable, fallback to our in-app PiP mode
      setPlayerDisplayMode(playerDisplayMode === 'pip' ? 'modal' : 'pip');
    }
  };

  const setQualityLevel = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevelIndex(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    initPlayback();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeMedia || playerDisplayMode === 'hidden') return null;

  // Mini-player / PiP view
  if (playerDisplayMode === 'pip') {
    return (
      <div
        id="streamglass-pip-player"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-72 sm:w-88 rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl transition-all group"
      >
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
          />
          {/* PiP Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate pr-2">
                {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                <span className="text-xs font-semibold text-white truncate">{mediaTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPlayerDisplayMode('modal')}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
                  title="Expand to Full View"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={closePlayer}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
                  title="Close Playback"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Cinematic Modal View
  return (
    <div
      id="streamglass-video-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 lg:p-8 animate-in fade-in duration-200"
    >
      <div
        ref={playerContainerRef}
        onMouseMove={triggerShowControls}
        onClick={triggerShowControls}
        className="relative w-full max-w-6xl aspect-video max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end select-none group"
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          playsInline
        />

        {/* Loading Spinner & Status */}
        {isLoading && !errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-xs">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/20" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent animate-spin" />
            </div>
            <p className="mt-4 text-xs font-medium text-sky-200 tracking-wide">
              {isLive ? 'Connecting to live broadcast stream...' : 'Buffering media...'}
            </p>
          </div>
        )}

        {/* Error Overlay with Resilience Recovery */}
        {errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f18]/95 p-6 text-center z-30">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Stream Playback Notice</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Stream ({retryCount})
              </button>
              {isLive && (
                <button
                  onClick={playNextChannel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-white hover:bg-white/10 text-sm font-medium transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  Try Next Channel
                </button>
              )}
              <button
                onClick={closePlayer}
                className="px-4 py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Top Header Bar inside Video */}
        <div
          className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 truncate pr-4">
            <button
              onClick={closePlayer}
              className="p-2 rounded-xl glass-pill text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title="Close and exit player"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="truncate">
              <div className="flex items-center gap-2">
                {isLive ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[11px] font-semibold uppercase tracking-wider">
                    MOVIE
                  </span>
                )}
                {mediaGroup && (
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    • {mediaGroup}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                {mediaTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PiP Miniaturize Button */}
            <button
              onClick={() => setPlayerDisplayMode('pip')}
              className="p-2 rounded-xl glass-pill text-white/80 hover:text-white hover:bg-white/20 transition-all"
              title="Minimize to Floating Mini-Player"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Stream Diagnostics Toggle */}
            <button
              onClick={() => setShowDiagnostics(prev => !prev)}
              className={`p-2 rounded-xl glass-pill transition-all ${
                showDiagnostics ? 'text-sky-400 border-sky-400/40 bg-sky-500/20' : 'text-white/80 hover:text-white'
              }`}
              title="Toggle Stream Diagnostics"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* In-Player Channel Switcher Drawer Toggle */}
            {isLive && (
              <button
                onClick={() => setShowChannelDrawer(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold transition-all ${
                  showChannelDrawer ? 'text-sky-400 border-sky-400/40 bg-sky-500/20' : 'text-white/80 hover:text-white'
                }`}
                title="Channel Switcher"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Channels</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagnostics Overlay */}
        {showDiagnostics && (
          <div className="absolute top-16 right-4 z-25 p-4 rounded-2xl glass-panel max-w-sm text-xs font-mono space-y-2 border border-sky-400/30 text-slate-300 animate-in fade-in">
            <div className="flex items-center justify-between text-sky-400 font-bold border-b border-white/10 pb-1.5">
              <span>STREAM DIAGNOSTICS</span>
              <button onClick={() => setShowDiagnostics(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[11px]">
              <div><span className="text-slate-500">Source:</span> <span className="text-white truncate block">{diagnostics.url}</span></div>
              <div><span className="text-slate-500">Playback:</span> <span className="text-emerald-400 font-semibold">{isLive ? 'HLS Live Engine' : 'VOD Stream'}</span></div>
              <div><span className="text-slate-500">Status:</span> <span>{isLoading ? 'Buffering' : isPlaying ? 'Playing' : 'Paused'}</span></div>
              {diagnostics.resolution && <div><span className="text-slate-500">Resolution:</span> <span className="text-sky-300">{diagnostics.resolution}</span></div>}
              {diagnostics.bitrate && <div><span className="text-slate-500">Bitrate:</span> <span>{Math.round(diagnostics.bitrate / 1000)} kbps</span></div>}
              <div><span className="text-slate-500">Buffer:</span> <span>{Math.round(bufferedEnd - currentTime)}s ahead</span></div>
              <div><span className="text-slate-500">HLS Levels:</span> <span>{availableLevels.length} available</span></div>
            </div>
          </div>
        )}

        {/* In-Player Channels Drawer */}
        {showChannelDrawer && isLive && (
          <div className="absolute top-16 bottom-24 right-4 w-72 sm:w-80 rounded-2xl glass-panel border border-white/20 p-3 z-25 overflow-y-auto space-y-1 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-white/10 text-xs font-bold text-sky-400">
              <span>QUICK CHANNEL SWITCHER</span>
              <button onClick={() => setShowChannelDrawer(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            {channels.map((ch, i) => {
              const isCurrent = ch.id === activeMedia?.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    playMedia(ch);
                    setShowChannelDrawer(false);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-sky-500/20 text-white border border-sky-400/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-mono w-5">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
                    ) : (
                      <Tv className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <p className="truncate font-medium">{ch.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{ch.group}</p>
                  </div>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Menu Dropdown */}
        {showQualityMenu && (
          <div className="absolute bottom-24 right-16 z-25 p-2 rounded-2xl glass-panel border border-white/20 text-xs space-y-1 min-w-[140px] shadow-2xl animate-in fade-in">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10">
              Quality Select
            </div>
            <button
              onClick={() => setQualityLevel(-1)}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-all ${
                currentLevelIndex === -1 ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Auto (Adaptive)
            </button>
            {availableLevels.map(lvl => (
              <button
                key={lvl.index}
                onClick={() => setQualityLevel(lvl.index)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-all flex items-center justify-between ${
                  currentLevelIndex === lvl.index ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>{lvl.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {Math.round(lvl.bitrate / 1000)}k
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Bottom Liquid Glass Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Scrubber Timeline (Only for On-Demand Movies/Videos) */}
          {!isLive && (
            <div className="mb-4 space-y-1">
              <div className="relative w-full flex items-center group/scrubber cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek media position"
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:h-2 transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Channel switcher buttons for live TV */}
              {isLive && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={playPrevChannel}
                    className="p-2 rounded-full glass-pill text-white hover:bg-white/20 transition-all cursor-pointer"
                    title="Previous Channel (P)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={playNextChannel}
                    className="p-2 rounded-full glass-pill text-white hover:bg-white/20 transition-all cursor-pointer"
                    title="Next Channel (N)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* Live indicator or time info */}
              {isLive ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>BROADCAST ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              )}

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="p-2 rounded-xl glass-pill text-white hover:bg-white/20 transition-all"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume level"
                  className="w-16 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>

            {/* Right-aligned tools */}
            <div className="flex items-center gap-2">
              {/* Quality selector */}
              {availableLevels.length > 0 && (
                <button
                  onClick={() => setShowQualityMenu(prev => !prev)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-pill text-xs font-medium text-white/80 hover:text-white"
                  title="Stream Quality"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {currentLevelIndex === -1 ? 'Auto' : availableLevels[currentLevelIndex]?.name || 'HD'}
                  </span>
                </button>
              )}

              {/* Picture-in-Picture Native */}
              <button
                onClick={togglePiP}
                aria-label="Toggle Picture in Picture"
                className="p-2 rounded-xl glass-pill text-white hover:bg-white/20 transition-all"
                title="Picture in Picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="p-2 rounded-xl glass-pill text-white hover:bg-white/20 transition-all"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
