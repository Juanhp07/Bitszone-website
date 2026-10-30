import { createContext, useContext } from 'react';
import type { Album, Track } from './types';

export interface QueueEntry {
  track: Track;
  album: Album;
}

export interface PlaybackContextType {
  nowPlayingTrackId?: number;
  /** audio is playing / its audio is loading, and the play-pause switch */
  isPlaying: boolean;
  isLoading: boolean;
  togglePlay: () => void;
  /** 0..1 position of the song that's playing */
  progress: number;
  /** Real album of the song that's playing (with year), even when playing from a playlist */
  nowPlayingOrigin: Album | null;
  /** The whole queue in order (played songs included) and the position of the one playing */
  queueList: QueueEntry[];
  queueIndex: number;
  /** What plays after the current track */
  upNext: QueueEntry[];
  /** Autoplay suggestions shown after the queue (not part of it) */
  recommendations: QueueEntry[];
  /** Play a whole album/playlist (fills the queue with the rest of it) */
  playAlbum: (album: Album, startTrack?: Track) => void;
  playNext: (track: Track, album: Album) => void;
  addToQueue: (track: Track, album: Album) => void;
  removeFromQueue: (trackId: number) => void;
  /** New order for the queue after dragging */
  reorderQueue: (entries: QueueEntry[]) => void;
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
