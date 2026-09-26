export type ViewState = 'catalog' | 'album' | 'downloads' | 'library';

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number; // in millis
  previewUrl: string;
  trackNumber: number;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  year: string;
  genre: string;
  trackCount: number;
  tracks?: Track[];
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
