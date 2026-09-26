import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Track } from './types';

interface DownloadsContextType {
  downloadedTracks: Track[];
  downloadTrack: (track: Track) => Promise<void>;
  removeDownload: (trackId: number) => void;
  isDownloaded: (trackId: number) => boolean;
  totalBytes: number;
  
  favoriteTracks: Track[];
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: number) => boolean;
  
  newDownloadsCount: number;
  clearNewDownloads: () => void;
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
    const bytes = tracks.length * 8 * 1024 * 1024;
    setTotalBytes(bytes);
  };

  const downloadTrack = async (track: Track) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDownloadedTracks(prev => {
          if (prev.find(t => t.id === track.id)) return prev;
          const updated = [...prev, track];
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

  const toggleFavorite = (track: Track) => {
    setFavoriteTracks(prev => {
      const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        updated = [...prev, track];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (trackId: number) => {
    return favoriteTracks.some(t => t.id === trackId);
  };

  const clearNewDownloads = () => setNewDownloadsCount(0);

  return (
    <DownloadsContext.Provider value={{ 
      downloadedTracks, downloadTrack, removeDownload, isDownloaded, totalBytes,
      favoriteTracks, toggleFavorite, isFavorite,
      newDownloadsCount, clearNewDownloads
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
