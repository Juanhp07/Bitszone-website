import { createContext, useContext } from 'react';
import type { Album, Track } from './types';

export interface QueueEntry {
  track: Track;
  album: Album;
}

export interface PlaybackContextType {
  nowPlayingTrackId?: number;
  /** Real album of the song that's playing (with year), even when playing from a playlist */
  nowPlayingOrigin: Album | null;
  /** What plays after the current track */
  upNext: QueueEntry[];
  /** Autoplay suggestions shown after the queue (not part of it) */
  recommendations: QueueEntry[];
  /** Play a whole album/playlist (fills the queue with the rest of it) */
  playAlbum: (album: Album, startTrack?: Track) => void;
  playNext: (track: Track, album: Album) => void;
  addToQueue: (track: Track, album: Album) => void;
  removeFromQueue: (trackId: number) => void;
  /** Play a queued track and keep the rest of the queue after it */
  jumpTo: (trackId: number) => void;
  goToAlbum: (album: Album) => void;
  goToArtist: (album: Album) => void;
}

export const PlaybackContext = createContext<PlaybackContextType | null>(null);

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackContext');
  return ctx;
};
