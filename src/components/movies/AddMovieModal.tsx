import React, { useState } from 'react';
import {
  X,
  Film,
  Star,
  Play,
  Check,
  Sparkles,
  Link,
  Image as ImageIcon,
  Clock,
  Calendar,
  Layers,
  AlertCircle,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PRESET_POSTERS = [
  {
    name: 'Concert / Musical',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sci-Fi / Space',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cinema Noir',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cyberpunk Action',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
  },
];

const GENRE_OPTIONS = [
  'Musical',
  'Drama',
  'Romance',
  'Action',
  'Sci-Fi',
  'Thriller',
  'Comedy',
  'Animation',
  'Documentary',
  'Crime',
];

export const AddMovieModal: React.FC = () => {
  const { isAddMovieModalOpen, setIsAddMovieModalOpen, addCustomMovie, playMedia, setSelectedMovie } = useApp();

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(4.8);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Musical', 'Drama']);
  const [customGenre, setCustomGenre] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [resolution, setResolution] = useState<'4K' | 'FHD' | 'HD' | 'SD'>('FHD');

  const [posterImgValid, setPosterImgValid] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAddMovieModalOpen) return null;

  // Format detection badge
  const detectFormatBadge = (link: string) => {
    const l = link.toLowerCase();
    if (l.includes('.mp4')) return { label: 'MP4 Video', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (l.includes('.mkv')) return { label: 'MKV Container', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    if (l.includes('.m3u8') || l.includes('.m3u')) return { label: 'HLS / M3U Stream', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    if (l.includes('.webm')) return { label: 'WebM Video', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    if (l.includes('web-dl') || l.includes('webdl')) return { label: 'WEB-DL Stream', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (l.startsWith('http://') || l.startsWith('https://')) return { label: 'Direct HTTP Stream', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    return null;
  };

  const formatBadge = detectFormatBadge(url);

  const toggleGenre = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter(x => x !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleAddCustomGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customGenre.trim()) {
      e.preventDefault();
      const trimmed = customGenre.trim();
      if (!selectedGenres.includes(trimmed)) {
        setSelectedGenres([...selectedGenres, trimmed]);
      }
      setCustomGenre('');
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'rockstar') {
      setTitle('Rockstar (2011)');
      setUrl('https://archive.org/download/rockstar-2011/Rockstar%20%282011%29.mp4');
      setPoster('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80');
      setBackdrop('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80');
      setDescription('Janardhan Jakhar, a Delhi student, seeks musical greatness through deep heartbreak. Transformed into Jordan, he becomes an iconic rock sensation while battling fame and tragic longing.');
      setRating(4.9);
      setSelectedGenres(['Musical', 'Drama', 'Romance']);
      setYear(2011);
      setDurationHours(2);
      setDurationMinutes(39);
      setResolution('FHD');
      setErrorMsg(null);
    } else if (presetName === 'tears') {
      setTitle('Tears of Steel');
      setUrl('https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8');
      setPoster('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80');
      setBackdrop('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80');
      setDescription('In a dystopian future, a group of scientists and warriors in Amsterdam attempt to rescue the world from destructive robotic tentacles.');
      setRating(4.6);
      setSelectedGenres(['Sci-Fi', 'Action']);
      setYear(2012);
      setDurationHours(0);
      setDurationMinutes(12);
      setResolution('4K');
      setErrorMsg(null);
    }
  };

  const handleSubmit = (autoPlay: boolean = false) => {
    if (!title.trim()) {
      setErrorMsg('Please enter a movie title.');
      return;
    }
    if (!url.trim()) {
      setErrorMsg('Please provide an MP4, MKV, Web-DL, or M3U stream URL.');
      return;
    }

    const totalSeconds = (Number(durationHours) || 0) * 3600 + (Number(durationMinutes) || 0) * 60;

    const newMovie = addCustomMovie({
      title: title.trim(),
      url: url.trim(),
      poster: poster.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
      backdrop: backdrop.trim() || undefined,
      description: description.trim() || `${title.trim()} on-demand movie stream.`,
      rating: Number(rating) || 4.8,
      genre: selectedGenres.length > 0 ? selectedGenres : ['Feature Film'],
      year: Number(year) || new Date().getFullYear(),
      duration: totalSeconds > 0 ? totalSeconds : 7200,
      resolution,
    });

    setIsAddMovieModalOpen(false);

    if (autoPlay) {
      playMedia(newMovie);
    } else {
      setSelectedMovie(newMovie);
    }
  };

  // Helper for star rating label
  const getRatingLabel = (val: number) => {
    if (val >= 4.8) return 'Masterpiece ★★★★★';
    if (val >= 4.5) return 'Highly Recommended ★★★★½';
    if (val >= 4.0) return 'Great Movie ★★★★☆';
    if (val >= 3.5) return 'Good Watch ★★★½☆';
    if (val >= 3.0) return 'Average ★★★☆☆';
    return 'Moderate ★★☆☆☆';
  };

  const activeStarRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      id="add-movie-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsAddMovieModalOpen(false)}
    >
      <div
        id="add-movie-modal-container"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0d101a] rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-transparent to-purple-500/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Add Movie to Cinema Deck
              </h2>
              <p className="text-xs text-slate-400">
                Direct link MP4, MKV, Web-DL, WebM or M3U/M3U8 with custom metadata & rating
              </p>
            </div>
          </div>

          <button
            id="close-add-movie-modal"
            onClick={() => setIsAddMovieModalOpen(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs">
          {/* Quick presets banner */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-sky-300 font-semibold">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Quick Demo Autofill:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="preset-rockstar-btn"
                onClick={() => handleApplyPreset('rockstar')}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 font-medium transition-all cursor-pointer"
              >
                Rockstar (2011) MP4
              </button>
              <button
                type="button"
                id="preset-tears-btn"
                onClick={() => handleApplyPreset('tears')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 font-medium transition-all cursor-pointer"
              >
                Tears of Steel (4K)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Movie Title</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="movie-title-input"
                type="text"
                required
                placeholder="e.g. Rockstar (2011) or Oppenheimer"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Resolution Quality
              </label>
              <select
                id="movie-resolution-select"
                value={resolution}
                onChange={e => setResolution(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white bg-[#121522] focus:outline-none focus:border-sky-400 border border-white/10"
              >
                <option value="4K">4K Ultra HD</option>
                <option value="FHD">FHD 1080p</option>
                <option value="HD">HD 720p</option>
                <option value="SD">SD 480p</option>
              </select>
            </div>
          </div>

          {/* Stream Link (MP4 / MKV / WebDL / M3U) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-sky-400" />
                <span>Stream / Video Link (MP4, MKV, WEB-DL, M3U8, WebM)</span>
                <span className="text-rose-400">*</span>
              </label>
              {formatBadge && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${formatBadge.color}`}>
                  {formatBadge.label}
                </span>
              )}
            </div>
            <input
              id="movie-url-input"
              type="url"
              required
              placeholder="https://archive.org/.../movie.mp4 or https://.../playlist.m3u8"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Supports progressive MP4 video URLs, MKV video files, Web-DL streams, WebM, or HLS (m3u8) video channels.
            </p>
          </div>

          {/* Number of Stars (Rating) */}
          <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Number of Stars (Rating)</span>
              </label>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20 font-mono">
                {activeStarRating.toFixed(1)} / 5.0 • {getRatingLabel(activeStarRating)}
              </span>
            </div>

            {/* Interactive Stars Row */}
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map(starIndex => {
                const filled = activeStarRating >= starIndex;
                const halfFilled = !filled && activeStarRating >= starIndex - 0.5;

                return (
                  <button
                    key={starIndex}
                    type="button"
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-lg hover:scale-125 transition-all cursor-pointer group"
                    title={`Rate ${starIndex} Stars`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        filled
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : halfFilled
                          ? 'text-amber-400 fill-amber-400/50'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}

              {/* Fine tuning slider */}
              <div className="ml-4 flex-1 flex items-center gap-2">
                <input
                  id="movie-rating-slider"
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={e => setRating(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Poster & Backdrop with Live Thumbnail Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Live Poster Preview Box */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="relative aspect-[2/3] w-28 rounded-xl overflow-hidden bg-[#111420] border border-white/10 shadow-lg">
                {poster && posterImgValid ? (
                  <img
                    src={poster}
                    alt="Poster Preview"
                    onError={() => setPosterImgValid(false)}
                    onLoad={() => setPosterImgValid(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-500">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px]">Poster Preview</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-2">2:3 Cinema Aspect</span>
            </div>

            {/* Poster URL and Suggestions */}
            <div className="sm:col-span-2 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Poster Artwork URL
                </label>
                <input
                  id="movie-poster-input"
                  type="url"
                  placeholder="https://images.unsplash.com/... or image link"
                  value={poster}
                  onChange={e => {
                    setPoster(e.target.value);
                    setPosterImgValid(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>

              {/* Poster Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block">Or pick cinema artwork preset:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_POSTERS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setPoster(p.url);
                        setBackdrop(p.backdrop);
                        setPosterImgValid(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] text-left truncate transition-all cursor-pointer border border-white/5"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Backdrop Banner URL (Optional)
                </label>
                <input
                  id="movie-backdrop-input"
                  type="url"
                  placeholder="Wide horizontal cinematic banner image URL"
                  value={backdrop}
                  onChange={e => setBackdrop(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Year & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Release Year</span>
              </label>
              <input
                id="movie-year-input"
                type="number"
                min="1900"
                max="2099"
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Hours</span>
              </label>
              <input
                id="movie-hours-input"
                type="number"
                min="0"
                max="12"
                value={durationHours}
                onChange={e => setDurationHours(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Minutes</span>
              </label>
              <input
                id="movie-minutes-input"
                type="number"
                min="0"
                max="59"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>
          </div>

          {/* Genre Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Genres & Categories</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_OPTIONS.map(g => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400'
                        : 'glass-panel text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <input
                type="text"
                placeholder="Type custom genre tag and press Enter..."
                value={customGenre}
                onChange={e => setCustomGenre(e.target.value)}
                onKeyDown={handleAddCustomGenre}
                className="w-full px-4 py-2 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Movie Description / Synopsis
            </label>
            <textarea
              id="movie-description-input"
              rows={3}
              placeholder="Enter plot summary, character journey, or stream notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 border border-white/10 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddMovieModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer text-center"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="save-movie-btn"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl glass-card text-xs font-bold text-white hover:bg-white/15 border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Save to Movies</span>
            </button>

            <button
              type="button"
              id="save-and-watch-movie-btn"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Save & Watch Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
