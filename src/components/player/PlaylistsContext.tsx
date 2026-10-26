import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Album, Track } from './types';

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
}

interface PlaylistsContextType {
  playlists: Playlist[];
  /** Mosaic cover (data URL) per playlist id, built from its first four album covers */
  covers: Record<string, string>;
  createPlaylist: (tracks?: Track[], name?: string) => Playlist;
  addToPlaylist: (playlistId: string, tracks: Track[]) => void;
  removeFromPlaylist: (playlistId: string, trackId: number) => void;
  renamePlaylist: (playlistId: string, name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  playlistAsAlbum: (playlist: Playlist) => Album;
}

const STORAGE_KEY = 'bz_playlists';
export const PLAYLIST_ID_PREFIX = 'playlist:';
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop';

export const isPlaylistAlbum = (album?: Album | null) => !!album && String(album.id).startsWith(PLAYLIST_ID_PREFIX);

/** Copy of a track that remembers which album it came from, so it can live in a playlist */
export const withAlbumInfo = (track: Track, album?: Album | null): Track =>
  album && !isPlaylistAlbum(album)
    ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl }
    : track;

const show = (msg: string) => window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));

const loadImage = (src: string) => new Promise<HTMLImageElement | null>((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

// 2x2 grid of the first four distinct covers (a single cover is used as-is)
const buildMosaic = async (coverUrls: string[]): Promise<string> => {
  const unique = [...new Set(coverUrls.filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return FALLBACK_COVER;
  if (unique.length === 1) return unique[0];
  const tiles = [0, 1, 2, 3].map((i) => unique[i % unique.length]);
  const images = await Promise.all(tiles.map(loadImage));
  const size = 600, half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return unique[0];
  images.forEach((img, i) => {
    if (img) ctx.drawImage(img, (i % 2) * half, Math.floor(i / 2) * half, half, half);
  });
  try { return canvas.toDataURL('image/jpeg', 0.88); } catch { return unique[0]; }
};

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export const PlaylistsProvider = ({ children }: { children: React.ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPlaylists(JSON.parse(saved));
    } catch { /* storage unavailable: start empty */ }
  }, []);

  const persist = (next: Playlist[]) => {
    setPlaylists(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Rebuild mosaics only when a playlist's first covers change
  const coverKeys = useMemo(
    () => playlists.map((p) => `${p.id}|${[...new Set(p.tracks.map((t) => t.albumCover))].slice(0, 4).join(',')}`).join(';'),
    [playlists]
  );
  useEffect(() => {
    let cancelled = false;
    Promise.all(playlists.map(async (p) => [p.id, await buildMosaic(p.tracks.map((t) => t.albumCover || ''))] as const))
      .then((entries) => { if (!cancelled) setCovers(Object.fromEntries(entries)); });
    return () => { cancelled = true; };
  }, [coverKeys]);

  const createPlaylist = (tracks: Track[] = [], name?: string) => {
    const playlist: Playlist = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name || `Mi lista nº ${playlists.length + 1}`,
      tracks: tracks.filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i),
      createdAt: new Date().toISOString(),
    };
    persist([...playlists, playlist]);
    show(`Lista '${playlist.name}' creada`);
    return playlist;
  };

  const addToPlaylist = (playlistId: string, tracks: Track[]) => {
    const target = playlists.find((p) => p.id === playlistId);
    if (!target) return;
    const fresh = tracks.filter((t) => !target.tracks.some((x) => x.id === t.id));
    if (fresh.length === 0) { show(`Ya está en '${target.name}'`); return; }
    persist(playlists.map((p) => (p.id === playlistId ? { ...p, tracks: [...p.tracks, ...fresh] } : p)));
    show(fresh.length === 1 ? `Añadida a '${target.name}'` : `${fresh.length} canciones añadidas a '${target.name}'`);
  };

  const removeFromPlaylist = (playlistId: string, trackId: number) =>
    persist(playlists.map((p) => (p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p)));

  const renamePlaylist = (playlistId: string, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    persist(playlists.map((p) => (p.id === playlistId ? { ...p, name: clean } : p)));
  };

  const deletePlaylist = (playlistId: string) => {
    const target = playlists.find((p) => p.id === playlistId);
    persist(playlists.filter((p) => p.id !== playlistId));
    if (target) show(`Lista '${target.name}' eliminada`);
  };

  const playlistAsAlbum = (p: Playlist): Album => ({
    id: (PLAYLIST_ID_PREFIX + p.id) as unknown as number,
    title: p.name,
    artist: 'Tu lista',
    coverUrl: covers[p.id] || p.tracks[0]?.albumCover || FALLBACK_COVER,
    year: String(new Date(p.createdAt).getFullYear()),
    genre: 'Playlist',
    trackCount: p.tracks.length,
    totalDuration: p.tracks.reduce((sum, t) => sum + (t.duration || 0), 0),
    tracks: p.tracks,
  });

  return (
    <PlaylistsContext.Provider value={{ playlists, covers, createPlaylist, addToPlaylist, removeFromPlaylist, renamePlaylist, deletePlaylist, playlistAsAlbum }}>
      {children}
    </PlaylistsContext.Provider>
  );
};

export const usePlaylists = () => {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error('usePlaylists must be used within a PlaylistsProvider');
  return ctx;
};
