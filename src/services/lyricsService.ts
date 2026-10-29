/**
 * Service to fetch synchronized lyrics from LRCLIB (https://lrclib.net/)
 * and fallback to hardcoded or cached lyrics.
 */

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResult {
  synced: boolean;
  lines: LyricLine[];
  source?: 'lrclib' | 'hardcoded' | 'plain';
}

const LRCLIB_BASE_URL = 'https://lrclib.net/api';
const lyricsMemoryCache = new Map<string, LyricsResult>();

export const somewhereIBelongLyrics: LyricLine[] = [
  { time: 43.71, text: "When it began" },
  { time: 45.15, text: "I had nothing to say" },
  { time: 46.82, text: "And I get lost in the nothingness inside of me" },
  { time: 49.70, text: "(I was confused)" },
  { time: 50.59, text: "And I let it all out to find" },
  { time: 52.60, text: "That I'm not the only person with these things in mind" },
  { time: 55.53, text: "(Inside of me)" },
  { time: 56.45, text: "But all that they can see the words revealed" },
  { time: 58.48, text: "Is the only real thing that I've got left to feel" },
  { time: 61.25, text: "(Nothing to lose)" },
  { time: 62.16, text: "Just stuck, hollow and alone" },
  { time: 64.24, text: "And the fault is my own, and the fault is my own" },
  { time: 67.33, text: "I wanna heal, I wanna feel what I thought was never real" },
  { time: 73.14, text: "I wanna let go of the pain I've felt so long" },
  { time: 77.10, text: "(Erase all the pain till it's gone)" },
  { time: 79.09, text: "I wanna heal, I wanna feel like I'm close to something real" },
  { time: 85.00, text: "I wanna find something I've wanted all along" },
  { time: 89.89, text: "Somewhere I belong" },
  { time: 92.29, text: "And I've got nothing to say" },
  { time: 93.87, text: "I can't believe I didn't fall right down on my face" },
  { time: 96.86, text: "(I was confused)" },
  { time: 97.80, text: "Looking everywhere only to find" },
  { time: 99.88, text: "That it's not the way I had imagined it all in my mind" },
  { time: 102.73, text: "(So what am I?)" },
  { time: 103.73, text: "What do I have but negativity?" },
  { time: 105.65, text: "'Cause I can't justify the way everyone is looking at me" },
  { time: 108.60, text: "(Nothing to lose)" },
  { time: 109.61, text: "Nothing to gain, hollow and alone" },
  { time: 111.60, text: "And the fault is my own, and the fault is my own" },
  { time: 114.60, text: "I wanna heal, I wanna feel what I thought was never real" },
  { time: 120.46, text: "I wanna let go of the pain I've felt so long" },
  { time: 124.38, text: "(Erase all the pain till it's gone)" },
  { time: 126.42, text: "I wanna heal, I wanna feel like I'm close to something real" },
  { time: 132.42, text: "I wanna find something I've wanted all along" },
  { time: 137.29, text: "Somewhere I belong" },
  { time: 139.63, text: "I will never know myself until I do this on my own" },
  { time: 145.48, text: "And I will never feel anything else until my wounds are healed" },
  { time: 151.38, text: "I will never be anything till I break away from me" },
  { time: 157.26, text: "I will break away, I'll find myself today" },
  { time: 166.95, text: "I wanna heal, I wanna feel what I thought was never real" },
  { time: 173.79, text: "I wanna let go of the pain I've felt so long" },
  { time: 177.91, text: "(Erase all the pain till it's gone)" },
  { time: 179.75, text: "I wanna heal, I wanna feel like I'm close to something real" },
  { time: 185.66, text: "I wanna find something I've wanted all along" },
  { time: 190.62, text: "Somewhere I belong" },
  { time: 193.02, text: "(I wanna heal, I wanna feel like I'm somewhere I belong)" },
  { time: 198.73, text: "(I wanna heal, I wanna feel like I'm somewhere I belong)" },
  { time: 208.46, text: "Somewhere I belong" }
];

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const timestamps: number[] = [];
    timeRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millisStr = match[3] || '0';
      const millis = parseInt(millisStr.padEnd(3, '0').slice(0, 3), 10);
      timestamps.push(minutes * 60 + seconds + millis / 1000);
      lastIndex = timeRegex.lastIndex;
    }

    if (timestamps.length > 0) {
      const text = trimmed.slice(lastIndex).trim();
      if (text) {
        for (const time of timestamps) {
          result.push({ time, text });
        }
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export function parsePlainLyrics(plainText: string, durationSecs: number = 180): LyricLine[] {
  const lines = plainText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('['));
  if (lines.length === 0) return [];

  const startOffset = Math.min(8, durationSecs * 0.05);
  const effectiveDuration = Math.max(10, durationSecs - startOffset - 8);
  const interval = effectiveDuration / lines.length;

  return lines.map((text, i) => ({
    time: Math.round((startOffset + i * interval) * 100) / 100,
    text,
  }));
}

function cleanTrackTitle(title: string): string {
  return title
    .replace(/\s*[\(\[](feat\.|featuring|with|remastered|remaster|live|bonus|deluxe|version|edit|mono|stereo)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*-\s*(feat\.|featuring|remastered|remaster|\d{4}\s*remaster).*/gi, '')
    .trim();
}

function cleanArtistName(artist: string): string {
  return artist
    .replace(/\s*(feat\.|featuring|ft\.|with|&|,|\/).*/gi, '')
    .trim();
}

export async function fetchTrackLyrics(
  trackTitle: string,
  artistName: string,
  albumTitle?: string,
  durationSecs?: number
): Promise<LyricsResult | null> {
  const cleanTitle = cleanTrackTitle(trackTitle);
  const cleanArtist = cleanArtistName(artistName);
  const cacheKey = `${cleanArtist.toLowerCase()}:::${cleanTitle.toLowerCase()}`;

  // 1. Check in-memory cache
  if (lyricsMemoryCache.has(cacheKey)) {
    return lyricsMemoryCache.get(cacheKey)!;
  }

  // 2. Check sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`bz_lyrics_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as LyricsResult;
        lyricsMemoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {}
  }

  // 3. Fallback for Somewhere I Belong
  if (cleanTitle.toLowerCase() === 'somewhere i belong' && cleanArtist.toLowerCase().includes('linkin park')) {
    const fallback: LyricsResult = {
      synced: true,
      lines: somewhereIBelongLyrics,
      source: 'hardcoded',
    };
    lyricsMemoryCache.set(cacheKey, fallback);
    return fallback;
  }

  // 4. Query LRCLIB API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Try direct GET
    const getParams = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });
    if (albumTitle) getParams.set('album_name', albumTitle);
    if (durationSecs && durationSecs > 0) getParams.set('duration', String(Math.round(durationSecs)));

    let response = await fetch(`${LRCLIB_BASE_URL}/get?${getParams.toString()}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    let data: any = null;
    if (response.ok) {
      data = await response.json();
    }

    // If direct get didn't return synced lyrics, try search fallback
    if (!data?.syncedLyrics) {
      const searchParams = new URLSearchParams({
        track_name: cleanTitle,
        artist_name: cleanArtist,
      });
      const searchResponse = await fetch(`${LRCLIB_BASE_URL}/search?${searchParams.toString()}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      if (searchResponse.ok) {
        const searchResults: any[] = await searchResponse.json();
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          // Prefer one with syncedLyrics
          const withSync = searchResults.find(r => r.syncedLyrics);
          data = withSync || searchResults[0];
        }
      }
    }

    clearTimeout(timeoutId);

    if (data?.syncedLyrics) {
      const parsedLines = parseLrc(data.syncedLyrics);
      if (parsedLines.length > 0) {
        const result: LyricsResult = {
          synced: true,
          lines: parsedLines,
          source: 'lrclib',
        };
        lyricsMemoryCache.set(cacheKey, result);
        try {
          sessionStorage.setItem(`bz_lyrics_${cacheKey}`, JSON.stringify(result));
        } catch {}
        return result;
      }
    }

    if (data?.plainLyrics) {
      const plainLines = parsePlainLyrics(data.plainLyrics, durationSecs || 180);
      if (plainLines.length > 0) {
        const result: LyricsResult = {
          synced: false,
          lines: plainLines,
          source: 'plain',
        };
        lyricsMemoryCache.set(cacheKey, result);
        try {
          sessionStorage.setItem(`bz_lyrics_${cacheKey}`, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch (err) {
    console.warn(`[LyricsService] Could not fetch lyrics from LRCLIB for "${cleanTitle}":`, err);
  }

  // Final check for Somewhere I Belong fallback if request failed
  if (cleanTitle.toLowerCase().includes('somewhere i belong')) {
    const fallback: LyricsResult = {
      synced: true,
      lines: somewhereIBelongLyrics,
      source: 'hardcoded',
    };
    lyricsMemoryCache.set(cacheKey, fallback);
    return fallback;
  }

  return null;
}
