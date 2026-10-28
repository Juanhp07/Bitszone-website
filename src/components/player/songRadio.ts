import type { Album, Track } from './types';
import { artistGenres } from '../../lib/genres';

export const SONG_RADIO_PREFIX = 'radio:';

export const isSongRadioAlbum = (album?: Album | null): boolean =>
  !!album && (Boolean(album.isSongRadio) || String(album.id).startsWith(SONG_RADIO_PREFIX));

/**
 * Builds a dynamic "Song Radio" context with the selected song first,
 * followed by curated, diverse, and genre-compatible similar songs from the catalog.
 */
export function buildSongRadio(track: Track, originAlbum: Album, allAlbums: Album[]): Album {
  const seed = track.id;
  const targetGenres = artistGenres(track.artist);

  // Pool of all candidate tracks across all albums (excluding the target track)
  const pool: { track: Track; album: Album; score: number }[] = [];

  allAlbums.forEach((a) => {
    (a.tracks ?? []).forEach((t) => {
      if (t.id === track.id) return;

      let score = 0;
      const tGenres = artistGenres(t.artist);
      const sharedGenres = tGenres.filter((g) => targetGenres.includes(g)).length;

      if (t.artist.toLowerCase() === track.artist.toLowerCase()) {
        // Same artist: strong affinity, giving slight preference to other albums
        score += a.id === originAlbum.id ? 35 : 65;
      } else if (sharedGenres > 0) {
        score += sharedGenres * 25;
      } else {
        score += 8;
      }

      // Add deterministic jitter so the radio stays identical for the same song across renders
      const jitter = ((t.id * 9301 + seed * 49297) % 233280) / 233280;
      score += jitter * 12;

      pool.push({
        track: {
          ...t,
          albumId: a.id as number,
          albumTitle: a.title,
          albumCover: a.coverUrl,
          albumYear: a.year,
        },
        album: a,
        score,
      });
    });
  });

  // Sort descending by score
  pool.sort((a, b) => b.score - a.score);

  // Pick diverse set: max 2 tracks per artist (beyond original track)
  const selectedTracks: Track[] = [
    {
      ...track,
      albumId: originAlbum.id as number,
      albumTitle: originAlbum.title,
      albumCover: originAlbum.coverUrl,
      albumYear: originAlbum.year,
      trackNumber: 1,
    },
  ];

  const artistCounts: Record<string, number> = { [track.artist.toLowerCase()]: 1 };

  for (const item of pool) {
    if (selectedTracks.length >= 13) break;
    const aKey = item.track.artist.toLowerCase();
    const count = artistCounts[aKey] || 0;
    if (count >= 2 && pool.length > 20) continue;
    artistCounts[aKey] = count + 1;
    selectedTracks.push({
      ...item.track,
      trackNumber: selectedTracks.length + 1,
    });
  }

  const totalDuration = selectedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return {
    id: `${SONG_RADIO_PREFIX}${track.id}`,
    title: track.title,
    artist: track.artist,
    coverUrl: track.albumCover || originAlbum.coverUrl,
    year: originAlbum.year,
    genre: originAlbum.genre,
    genres: originAlbum.genres,
    trackCount: selectedTracks.length,
    totalDuration,
    tracks: selectedTracks,
    isSongRadio: true,
  };
}
