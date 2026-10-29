import { userStorage } from './userStorage';
import type { Album, Track } from '../components/player/types';

// Every play, newest first, kept per account (synced like playlists). Powers the profile stats.
export type Listen = {
  id: number;
  title: string;
  artist: string;
  albumTitle: string;
  albumCover: string;
  genre: string;
  duration: number;
  at: string;
};

const KEY = 'bz_history';
const MAX = 500; // shortcut: stats only see the last 500 plays, move to a Supabase table if all-time stats are wanted

export const getHistory = (): Listen[] => {
  try { return JSON.parse(userStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const recordListen = (track: Track, album: Album) => {
  const prev = getHistory();
  // the same song re-triggered within a minute (skip back, retry) counts once
  if (prev[0]?.id === track.id && Date.now() - Date.parse(prev[0].at) < 60_000) return;
  const entry: Listen = {
    id: track.id,
    title: track.title,
    artist: track.artist || album.artist,
    albumTitle: track.albumTitle || album.title,
    albumCover: track.albumCover || album.coverUrl,
    genre: album.genre && album.genre !== 'Playlist' ? album.genre : '',
    duration: track.duration || 0,
    at: new Date().toISOString(),
  };
  userStorage.setItem(KEY, JSON.stringify([entry, ...prev].slice(0, MAX)));
};

/** most frequent values of `pick`, highest first */
export const topBy = (list: Listen[], pick: (l: Listen) => string, n: number) => {
  const counts = new Map<string, { count: number; sample: Listen }>();
  for (const l of list) {
    const k = pick(l);
    if (!k) continue;
    const c = counts.get(k);
    if (c) c.count++; else counts.set(k, { count: 1, sample: l });
  }
  return [...counts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, n).map(([key, v]) => ({ key, ...v }));
};
