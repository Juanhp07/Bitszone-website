import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Track, Album } from './types';

interface DownloadsContextType {
  downloadedTracks: Track[];
  downloadTrack: (track: Track, album?: Album, silent?: boolean) => Promise<void>;
  removeDownload: (trackId: number, silent?: boolean) => void;
  isDownloaded: (trackId: number) => boolean;
  totalBytes: number;
  
  favoriteTracks: Track[];
  licensedTracks: Track[];
  addLicensedTrack: (track: Track, album?: Album) => void;
  removeLicensedTrack: (trackId: number) => void;
  isLicensed: (trackId: number) => boolean;
  toggleFavorite: (track: Track, album?: Album) => void;
  toggleFavoriteAlbum: (album: Album) => void;
  isFavorite: (trackId: number) => boolean;
  
  newDownloadsCount: number;
  clearNewDownloads: () => void;
  removeAlbumFromDownloads: (albumId: string) => void;
  removeAlbumFromFavorites: (albumId: string) => void;
  downloadingAlbums: string[];
  downloadAlbum: (album: Album) => void;
  cancelAlbumDownload: (albumId: string) => void;
  clearDownloads: () => void;
  clearFavorites: () => void;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider = ({ children }: { children: React.ReactNode }) => {
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [licensedTracks, setLicensedTracks] = useState<Track[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [newDownloadsCount, setNewDownloadsCount] = useState(0);
  const [downloadingAlbums, setDownloadingAlbums] = useState<string[]>([]);
  const cancelRef = React.useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    const savedDownloads = localStorage.getItem('bz_downloads');
    if (savedDownloads) {
      try {
        const parsed = JSON.parse(savedDownloads);
        setDownloadedTracks(parsed);
        calculateBytes(parsed);
        
        // Background fetch real sizes if missing
        let changed = false;
        Promise.all(parsed.map(async (t: Track) => {
          if (!t.sizeMb || t.sizeMb === (t.duration / 1000 * 0.023) || t.sizeMb === (t.duration / 1000 * 0.0390625)) {
            try {
              const res = await fetch(t.previewUrl, { method: 'HEAD' });
              const len = res.headers.get('content-length');
              if (len) {
                t.sizeMb = parseInt(len, 10) / (1024 * 1024);
                changed = true;
              }
            } catch(e) {}
          }
          return t;
        })).then(updated => {
          if (changed) {
            setDownloadedTracks([...updated]);
            localStorage.setItem('bz_downloads', JSON.stringify(updated));
            calculateBytes(updated);
          }
        });
      } catch (e) {}
    }

    const savedFavs = localStorage.getItem('bz_favorites');
    if (savedFavs) {
      try {
        setFavoriteTracks(JSON.parse(savedFavs));
      } catch (e) {}
    }
    const savedLicenses = localStorage.getItem('bz_licenses');
    if (savedLicenses) {
      try {
        setLicensedTracks(JSON.parse(savedLicenses));
      } catch (e) {}
    }
  }, []);

  const calculateBytes = (tracks: Track[]) => {
    // Calculamos los megabytes usando el campo sizeMb o el estimado por duracion
    const totalMb = tracks.reduce((sum, t) => sum + (t.sizeMb || (t.duration / 1000 * 0.023)), 0);
    // Lo guardamos en bytes para no romper el tipado anterior que usa bytes
    setTotalBytes(totalMb * 1024 * 1024);
  };

  const downloadTrack = async (track: Track, album?: Album, silent: boolean = false) => {
    return new Promise<void>(async (resolve) => {
      let realSizeMb = track.sizeMb;
      try {
        const res = await fetch(track.previewUrl, { method: 'HEAD' });
        const len = res.headers.get('content-length');
        if (len) realSizeMb = parseInt(len, 10) / (1024 * 1024);
      } catch(e) {}

      setTimeout(() => {
        setDownloadedTracks(prev => {
          const trackWithRealSize = { ...track, sizeMb: realSizeMb || track.sizeMb };
          if (prev.find(t => t.id === trackWithRealSize.id)) return prev;
          const trackToSave = { ...trackWithRealSize, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };
          const updated = [...prev, trackToSave];
          localStorage.setItem('bz_downloads', JSON.stringify(updated));
          calculateBytes(updated);
          return updated;
        });
        setNewDownloadsCount(prev => prev + 1);
        if (!silent) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: `Canción '${track.title}' descargada` }));
        }
        resolve();
      }, 1500);
    });
  };

  const removeDownload = (trackId: number, silent: boolean = false) => {
    setDownloadedTracks(prev => {
      const removedTrack = prev.find(t => t.id === trackId);
      const updated = prev.filter(t => t.id !== trackId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      if (!silent && removedTrack) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: `Canción '${removedTrack.title}' eliminada de Descargas` }));
      }
      return updated;
    });
  };

  const isDownloaded = (trackId: number) => {
    return downloadedTracks.some(t => t.id === trackId);
  };

  const toggleFavorite = (track: Track, album?: Album) => {
    const isFav = isFavorite(track.id);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: isFav ? `Canción '${track.title}' eliminada de tu Biblioteca` : `Canción '${track.title}' agregada a tu Biblioteca` }));
    
    setFavoriteTracks(prev => {
      const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        const trackToSave = { ...track, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };
        updated = [...prev, trackToSave];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  
  const toggleFavoriteAlbum = (album: Album) => {
    if (!album.tracks) return;
    
    const allFavorited = album.tracks.every(t => favoriteTracks.some(pt => pt.id === t.id));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: allFavorited ? `Álbum '${album.title}' eliminado de tu Biblioteca` : `Álbum '${album.title}' agregado a tu Biblioteca` }));

    setFavoriteTracks(prev => {
      let updated = [...prev];
      const isAllFav = album.tracks!.every(t => prev.some(pt => pt.id === t.id));
      if (isAllFav) {
        updated = updated.filter(pt => !album.tracks!.some(t => t.id === pt.id));
      } else {
        const tracksToAdd = album.tracks!
          .filter(t => !prev.some(pt => pt.id === t.id))
          .map(track => ({ ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl, addedAt: track.addedAt || new Date().toISOString() }));
        updated = [...updated, ...tracksToAdd];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (trackId: number) => {
    return favoriteTracks.some(t => t.id === trackId);
  };
  const addLicensedTrack = (track: Track, album?: Album) => {
    setLicensedTracks(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      const trackToSave = { ...track, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };
      const updated = [...prev, trackToSave];
      localStorage.setItem('bz_licenses', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `La canción '${track.title}' se agregó a Canciones con licencia` }));
      return updated;
    });
  };

  useEffect(() => {
    const handleAddLicense = (e: any) => addLicensedTrack(e.detail.track, e.detail.album);
    window.addEventListener('add-license', handleAddLicense);
    return () => window.removeEventListener('add-license', handleAddLicense);
  }, []);


  const isLicensed = (trackId: number) => {
    return licensedTracks.some(t => t.id === trackId);
  };
  const removeLicensedTrack = (trackId: number) => {
    setLicensedTracks(prev => {
      const removedTrack = prev.find(t => t.id === trackId);
      const updated = prev.filter(t => t.id !== trackId);
      localStorage.setItem('bz_licenses', JSON.stringify(updated));
      if (removedTrack) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: `La canción '${removedTrack.title}' se eliminó de Canciones con licencia` }));
      }
      return updated;
    });
  };



  const clearNewDownloads = () => setNewDownloadsCount(0);

  
  const downloadAlbum = async (album: Album) => {
    if (!album.tracks) return;
    const albumId = String(album.id);
    cancelRef.current[albumId] = false;
    setDownloadingAlbums(prev => [...prev, albumId]);
    
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    for (const track of tracksToDownload) {
      if (cancelRef.current[albumId]) break;
      await downloadTrack(track, album, true);
    }
    
    if (!cancelRef.current[albumId]) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Álbum '${album.title}' descargado` }));
    }
    setDownloadingAlbums(prev => prev.filter(id => id !== albumId));
  };

  const cancelAlbumDownload = (albumId: string) => {
    cancelRef.current[albumId] = true;
    setDownloadingAlbums(prev => prev.filter(id => id !== albumId));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Descarga cancelada' }));
  };

  const removeAlbumFromDownloads = (albumId: string) => {
    setDownloadedTracks(prev => {
      const albumTitle = prev.find(t => (t.albumId ? String(t.albumId) : 'unknown') === albumId)?.albumTitle || 'Álbum';
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Álbum '${albumTitle}' eliminado de Descargas` }));
      return updated;
    });
  };

  const removeAlbumFromFavorites = (albumId: string) => {
    setFavoriteTracks(prev => {
      const albumTitle = prev.find(t => (t.albumId ? String(t.albumId) : 'unknown') === albumId)?.albumTitle || 'Álbum';
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Álbum '${albumTitle}' eliminado de tu Biblioteca` }));
      return updated;
    });
  };

  const clearDownloads = () => {
    setDownloadedTracks([]);
    localStorage.setItem('bz_downloads', JSON.stringify([]));
    calculateBytes([]);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Todas las descargas eliminadas' }));
  };

  const clearFavorites = () => {
    setFavoriteTracks([]);
    localStorage.setItem('bz_favorites', JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Toda la biblioteca ha sido eliminada' }));
  };

  return (
    <DownloadsContext.Provider value={{ 
      downloadedTracks, downloadTrack, removeDownload, isDownloaded, totalBytes,
      favoriteTracks, toggleFavorite, toggleFavoriteAlbum, isFavorite,
      licensedTracks, addLicensedTrack, removeLicensedTrack, isLicensed,
      newDownloadsCount, clearNewDownloads, removeAlbumFromDownloads, removeAlbumFromFavorites, clearDownloads, clearFavorites, downloadingAlbums, downloadAlbum, cancelAlbumDownload
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
