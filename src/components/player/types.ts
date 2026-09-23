export type ViewState = 'catalog' | 'album' | 'downloads';

export interface AppState {
  currentView: ViewState;
  isPlayerExpanded: boolean;
  selectedAlbumId: string | null;
  nowPlayingTrack: any | null;
  isPlaying: boolean;
  volume: number;
}
