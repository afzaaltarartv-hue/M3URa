import { ChannelItem, MovieItem, Playlist } from '../types';

export interface ParseResult {
  playlist: Playlist;
  channels: ChannelItem[];
  movies: MovieItem[];
  groups: string[];
  diagnostics: {
    totalLines: number;
    parsedStreams: number;
    errorsCount: number;
    warnings: string[];
  };
}

/**
 * Robust, high-performance M3U/M3U8 parser
 * Supports extended M3U attributes: tvg-id, tvg-name, tvg-logo, group-title, tvg-country, tvg-language
 */
export function parseM3U(
  content: string,
  playlistMeta: {
    id: string;
    name: string;
    sourceType: 'url' | 'file' | 'text' | 'curated';
    sourceUrl?: string;
  }
): ParseResult {
  const lines = content.split(/\r?\n/);
  const channels: ChannelItem[] = [];
  const movies: MovieItem[] = [];
  const groupsSet = new Set<string>();
  const warnings: string[] = [];

  let currentExtinf: {
    duration?: number;
    attributes: Record<string, string>;
    rawTitle: string;
  } | null = null;
  let currentGroupFallback: string | null = null;

  const now = Date.now();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Directives
    if (line.startsWith('#EXTM3U')) {
      continue;
    }

    if (line.startsWith('#EXTGRP:')) {
      currentGroupFallback = line.substring(8).trim();
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      // Parse #EXTINF line
      currentExtinf = parseExtinfLine(line);
      continue;
    }

    // If it's another comment directive, skip
    if (line.startsWith('#')) {
      continue;
    }

    // Stream URL handling (supports both #EXTINF declared streams and direct pasted URLs)
    if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('rtmp://') || line.startsWith('rtsp://')) {
      const streamUrl = line;
      let attributes: Record<string, string> = {};
      let rawTitle = 'Direct Stream';
      let duration = -1;

      if (currentExtinf) {
        attributes = currentExtinf.attributes;
        rawTitle = currentExtinf.rawTitle || 'Unnamed Stream';
        duration = currentExtinf.duration ?? -1;
      } else {
        // Synthesize metadata from the URL itself (e.g. filename from path)
        try {
          const urlObj = new URL(streamUrl);
          const lastSegment = decodeURIComponent(urlObj.pathname).split('/').filter(Boolean).pop() || '';
          if (lastSegment) {
            rawTitle = lastSegment.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          } else {
            rawTitle = playlistMeta.name || 'Direct Stream';
          }
        } catch {
          rawTitle = playlistMeta.name || 'Direct Stream';
        }
      }

      // Group title
      let group = attributes['group-title'] || currentGroupFallback || (isVodMedia(streamUrl, '') ? 'Movies' : 'General');
      group = cleanGroup(group);
      groupsSet.add(group);

      // Channel / Title cleanup
      const cleanedTitle = cleanTitle(rawTitle);
      const resolution = detectResolution(rawTitle + ' ' + streamUrl);

      // Determine if VOD/Movie or Live TV
      const isVod = isVodMedia(streamUrl, group, duration);

      const id = `${playlistMeta.id}-${channels.length + movies.length + 1}`;

      if (isVod) {
        movies.push({
          id,
          title: cleanedTitle,
          url: streamUrl,
          poster: attributes['tvg-logo'] || attributes['logo'] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
          genre: [group],
          year: extractYear(rawTitle) || new Date().getFullYear(),
          duration: duration && duration > 0 ? duration : 5400,
          description: `${cleanedTitle} (${group})`,
          rating: 4.8,
          playlistId: playlistMeta.id,
          source: 'playlist',
          resolution,
        });
      } else {
        // Generate simulated realistic EPG program
        const programDurationMs = 30 * 60 * 1000;
        const currentSlot = Math.floor(now / programDurationMs);
        const startTime = currentSlot * programDurationMs;
        const endTime = startTime + programDurationMs;

        channels.push({
          id,
          name: cleanedTitle,
          url: streamUrl,
          logo: attributes['tvg-logo'] || attributes['logo'] || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&auto=format&fit=crop&q=80',
          group,
          tvgId: attributes['tvg-id'],
          tvgName: attributes['tvg-name'],
          country: attributes['tvg-country'],
          language: attributes['tvg-language'],
          playlistId: playlistMeta.id,
          isLive: true,
          resolution,
          currentProgram: {
            title: `${cleanedTitle} Broadcast`,
            description: `Live high-definition programming on ${cleanedTitle}.`,
            startTime,
            endTime,
          },
        });
      }

      currentExtinf = null;
      currentGroupFallback = null;
      continue;
    }
  }

  const groups = Array.from(groupsSet).sort();

  const playlist: Playlist = {
    id: playlistMeta.id,
    name: playlistMeta.name,
    sourceType: playlistMeta.sourceType,
    sourceUrl: playlistMeta.sourceUrl,
    channelCount: channels.length,
    movieCount: movies.length,
    groups,
    createdAt: now,
    updatedAt: now,
    enabled: true,
  };

  return {
    playlist,
    channels,
    movies,
    groups,
    diagnostics: {
      totalLines: lines.length,
      parsedStreams: channels.length + movies.length,
      errorsCount: warnings.length,
      warnings,
    },
  };
}

/**
 * Extracts attributes from #EXTINF:-1 tvg-id="abc" tvg-name="def",Channel Name
 */
function parseExtinfLine(line: string) {
  const commaIndex = line.indexOf(',');
  let metaPart = line.substring(8); // after '#EXTINF:'
  let rawTitle = '';

  if (commaIndex !== -1) {
    rawTitle = line.substring(commaIndex + 1).trim();
    metaPart = line.substring(8, commaIndex);
  }

  // Duration is before space
  const durationMatch = metaPart.match(/^(-?\d+)/);
  const duration = durationMatch ? parseInt(durationMatch[1], 10) : -1;

  // Key-value attribute parser
  const attributes: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(metaPart)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2];
    attributes[key] = value;
  }

  // Unquoted attributes fallback (e.g. group-title=News)
  const unquotedRegex = /([a-zA-Z0-9_-]+)=([^\s"]+)/g;
  while ((match = unquotedRegex.exec(metaPart)) !== null) {
    const key = match[1].toLowerCase();
    if (!attributes[key]) {
      attributes[key] = match[2];
    }
  }

  return {
    duration,
    attributes,
    rawTitle,
  };
}

function cleanTitle(title: string): string {
  return title
    .replace(/\[\s*(4K|FHD|HD|SD|1080p|720p)\s*\]/gi, '')
    .replace(/\(\s*(4K|FHD|HD|SD|1080p|720p)\s*\)/gi, '')
    .replace(/\|\s*(US|UK|CA|FR|DE|ES|IT|INT)\s*\|/gi, '')
    .trim();
}

function cleanGroup(group: string): string {
  let cleaned = group.trim();
  // Remove country prefix e.g. "US | News" -> "News"
  if (cleaned.includes('|')) {
    const parts = cleaned.split('|');
    cleaned = parts[parts.length - 1].trim();
  }
  if (!cleaned) cleaned = 'General';
  return cleaned;
}

function detectResolution(text: string): '4K' | 'FHD' | 'HD' | 'SD' {
  const upper = text.toUpperCase();
  if (upper.includes('4K') || upper.includes('UHD') || upper.includes('2160P')) return '4K';
  if (upper.includes('FHD') || upper.includes('1080P')) return 'FHD';
  if (upper.includes('HD') || upper.includes('720P')) return 'HD';
  return 'HD';
}

function isVodMedia(url: string, group: string, duration?: number): boolean {
  const lowerUrl = url.toLowerCase();
  const lowerGroup = group.toLowerCase();

  const vodExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '/movie/', '/series/', '/vod/'];
  const hasVodExt = vodExtensions.some(ext => lowerUrl.includes(ext));

  const vodKeywords = ['movie', 'movies', 'vod', 'film', 'cinema', 'cinema vod'];
  const hasVodGroup = vodKeywords.some(k => lowerGroup.includes(k));

  if (hasVodExt || hasVodGroup) return true;
  if (duration && duration > 600) return true; // over 10 minutes non-live

  return false;
}

function extractYear(title: string): number | null {
  const match = title.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}
