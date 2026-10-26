import React, { useEffect, useState } from 'react';
import { ListPlus, ListEnd, ListMusic, Plus, ChevronLeft, ChevronRight, Disc3, UserRound } from 'lucide-react';
import { PopoverMenu, type PopoverMenuItem } from '../ui/PopoverMenu';
import { usePlayback } from './PlaybackContext';
import { usePlaylists, isPlaylistAlbum, withAlbumInfo } from './PlaylistsContext';
import type { Album, Track } from './types';

// The album a track really belongs to (playlist tracks remember theirs)
const originAlbum = (track: Track, album: Album): Album =>
  isPlaylistAlbum(album) && track.albumId != null
    ? { id: track.albumId, title: track.albumTitle || '', artist: track.artist, coverUrl: track.albumCover || '', year: '', genre: '', trackCount: 0 }
    : album;

/** ⋯ menu for a song: queue, playlists and navigation, plus any view-specific items. */
export const TrackMenu = ({
  track,
  album,
  anchor,
  onClose,
  leadingItems = [],
  trailingItems = [],
  hideGoToAlbum = false,
}: {
  track: Track | null;
  album: Album;
  anchor: { x: number; y: number } | null;
  onClose: () => void;
  leadingItems?: PopoverMenuItem[];
  trailingItems?: PopoverMenuItem[];
  /** Already on this album's page */
  hideGoToAlbum?: boolean;
}) => {
  const playback = usePlayback();
  const { playlists, createPlaylist, addToPlaylist } = usePlaylists();
  const [stage, setStage] = useState<'main' | 'lists'>('main');

  useEffect(() => { if (!track) setStage('main'); }, [track]);

  const items: PopoverMenuItem[] = !track ? [] : stage === 'lists'
    ? [
        { label: 'Volver', icon: <ChevronLeft className="w-4 h-4" />, onSelect: () => setStage('main'), keepOpen: true },
        { label: 'Nueva lista de reproducción', icon: <Plus className="w-4 h-4" />, onSelect: () => createPlaylist([withAlbumInfo(track, album)]) },
        ...playlists.map((p) => ({ label: p.name, icon: <ListMusic className="w-4 h-4" />, onSelect: () => addToPlaylist(p.id, [withAlbumInfo(track, album)]) })),
      ]
    : [
        ...leadingItems,
        ...(track.id !== playback.nowPlayingTrackId
          ? [{ label: 'Reproducir a continuación', icon: <ListPlus className="w-4 h-4" />, onSelect: () => playback.playNext(track, album) }]
          : []),
        { label: 'Añadir a la cola', icon: <ListEnd className="w-4 h-4" />, onSelect: () => playback.addToQueue(track, album) },
        {
          label: 'Guardar en lista de reproducción',
          icon: <ChevronRight className="w-4 h-4" />,
          // No playlists yet: create one with this song right away
          onSelect: () => (playlists.length ? setStage('lists') : createPlaylist([withAlbumInfo(track, album)])),
          keepOpen: playlists.length > 0,
        },
        ...(hideGoToAlbum ? [] : [{ label: 'Ir al álbum', icon: <Disc3 className="w-4 h-4" />, onSelect: () => playback.goToAlbum(originAlbum(track, album)) }]),
        { label: 'Ir al artista', icon: <UserRound className="w-4 h-4" />, onSelect: () => playback.goToArtist(originAlbum(track, album)) },
        ...trailingItems,
      ];

  return <PopoverMenu open={!!track} anchor={anchor} items={items} width={270} onClose={onClose} />;
};
