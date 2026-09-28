import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Track, Album } from './types';

interface DownloadsContextType {
  downloadedTracks: Track[];
  downloadTrack: (track: Track, album?: Album) => Promise<void>;
  removeDownload: (trackId: number) => void;
  isDownloaded: (trackId: number) => boolean;
  totalBytes: number;
  
  favoriteTracks: Track[];
  toggleFavorite: (track: Track, album?: Album) => void;
  toggleFavoriteAlbum: (album: Album) => void;
  isFavorite: (trackId: number) => boolean;
  
  newDownloadsCount: number;
  clearNewDownloads: () => void;
  removeAlbumFromDownloads: (albumId: string) => void;
  removeAlbumFromFavorites: (albumId: string) => void;
  clearDownloads: () => void;
  clearFavorites: () => void;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider = ({ children }: { children: React.ReactNode }) => {
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [newDownloadsCount, setNewDownloadsCount] = useState(0);
  
  useEffect(() => {
    const savedDownloads = localStorage.getItem('bz_downloads');
    if (savedDownloads) {
      try {
        const parsed = JSON.parse(savedDownloads);
        setDownloadedTracks(parsed);
        calculateBytes(parsed);
      } catch (e) {}
    }

    const savedFavs = localStorage.getItem('bz_favorites');
    if (savedFavs) {
      try {
        setFavoriteTracks(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  const calculateBytes = (tracks: Track[]) => {
    // Calculamos los megabytes usando el campo sizeMb o el estimado por duracion
    const totalMb = tracks.reduce((sum, t) => sum + (t.sizeMb || (t.duration / 1000 * 0.0390625)), 0);
    // Lo guardamos en bytes para no romper el tipado anterior que usa bytes
    setTotalBytes(totalMb * 1024 * 1024);
  };

  const downloadTrack = async (track: Track, album?: Album) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDownloadedTracks(prev => {
          if (prev.find(t => t.id === track.id)) return prev;
          const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;
          const updated = [...prev, trackToSave];
          localStorage.setItem('bz_downloads', JSON.stringify(updated));
          calculateBytes(updated);
          return updated;
        });
        setNewDownloadsCount(prev => prev + 1);
        resolve();
      }, 1500);
    });
  };

  const removeDownload = (trackId: number) => {
    setDownloadedTracks(prev => {
      const updated = prev.filter(t => t.id !== trackId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      return updated;
    });
  };

  const isDownloaded = (trackId: number) => {
    return downloadedTracks.some(t => t.id === trackId);
  };

  const toggleFavorite = (track: Track, album?: Album) => {
    setFavoriteTracks(prev => {
      const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;
        updated = [...prev, trackToSave];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  
  const toggleFavoriteAlbum = (album: Album) => {
    if (!album.tracks) return;
    setFavoriteTracks(prev => {
      let updated = [...prev];
      const allFavorited = album.tracks!.every(t => prev.some(pt => pt.id === t.id));
      if (allFavorited) {
        updated = updated.filter(pt => !album.tracks!.some(t => t.id === pt.id));
      } else {
        const tracksToAdd = album.tracks!
          .filter(t => !prev.some(pt => pt.id === t.id))
          .map(track => ({ ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl }));
        updated = [...updated, ...tracksToAdd];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (trackId: number) => {
    return favoriteTracks.some(t => t.id === trackId);
  };

  const clearNewDownloads = () => setNewDownloadsCount(0);

  const removeAlbumFromDownloads = (albumId: string) => {
    setDownloadedTracks(prev => {
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      return updated;
    });
  };

  const removeAlbumFromFavorites = (albumId: string) => {
    setFavoriteTracks(prev => {
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const clearDownloads = () => {
    setDownloadedTracks([]);
    localStorage.setItem('bz_downloads', JSON.stringify([]));
    calculateBytes([]);
  };

  const clearFavorites = () => {
    setFavoriteTracks([]);
    localStorage.setItem('bz_favorites', JSON.stringify([]));
  };

  return (
    <DownloadsContext.Provider value={{ 
      downloadedTracks, downloadTrack, removeDownload, isDownloaded, totalBytes,
      favoriteTracks, toggleFavorite, toggleFavoriteAlbum, isFavorite,
      newDownloadsCount, clearNewDownloads, removeAlbumFromDownloads, removeAlbumFromFavorites, clearDownloads, clearFavorites
    }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error('useDownloads must be used within a DownloadsProvider');
  return context;
};
