import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Track } from './types';

interface DownloadsContextType {
  downloadedTracks: Track[];
  downloadTrack: (track: Track) => Promise<void>;
  isDownloaded: (trackId: number) => boolean;
  totalBytes: number; // For the 5GB quota
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider = ({ children }: { children: React.ReactNode }) => {
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);

  // 1 GB = 1,073,741,824 bytes
  // We'll simulate 5-10MB per track for the quota
  
  useEffect(() => {
    const saved = localStorage.getItem('bz_downloads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDownloadedTracks(parsed);
        calculateBytes(parsed);
      } catch (e) {}
    }
  }, []);

  const calculateBytes = (tracks: Track[]) => {
    // Simulate ~8MB per track
    const bytes = tracks.length * 8 * 1024 * 1024;
    setTotalBytes(bytes);
  };

  const downloadTrack = async (track: Track) => {
    return new Promise<void>((resolve) => {
      // Simulate network delay for downloading
      setTimeout(() => {
        setDownloadedTracks(prev => {
          if (prev.find(t => t.id === track.id)) return prev;
          const updated = [...prev, track];
          localStorage.setItem('bz_downloads', JSON.stringify(updated));
          calculateBytes(updated);
          return updated;
        });
        resolve();
      }, 1500); // 1.5s simulated download time
    });
  };

  const isDownloaded = (trackId: number) => {
    return downloadedTracks.some(t => t.id === trackId);
  };

  return (
    <DownloadsContext.Provider value={{ downloadedTracks, downloadTrack, isDownloaded, totalBytes }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error('useDownloads must be used within a DownloadsProvider');
  return context;
};
