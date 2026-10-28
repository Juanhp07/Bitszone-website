export type ViewState = 'catalog' | 'album' | 'downloads' | 'library';

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number; // in millis
  previewUrl: string;
  trackNumber: number;
  albumId?: number | string;
  albumTitle?: string;
  albumCover?: string;
  albumYear?: string;
  addedAt?: string;
  sizeMb?: number;
}

export interface Album {
  id: number | string;
  title: string;
  artist: string;
  coverUrl: string;
  year: string;
  genre: string;
  genres?: string[];
  trackCount: number;
  totalDuration?: number;
  tracks?: Track[];
  isSongRadio?: boolean;
}

export interface AppState {
  currentView: ViewState;
  isPlayerExpanded: boolean;
  selectedAlbum: Album | null;
  nowPlayingTrack: Track | null;
  nowPlayingAlbum: Album | null;
  isPlaying: boolean;
  volume: number;
}
