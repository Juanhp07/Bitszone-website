import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Album, Track } from '../player/types';

export interface AlbumOverride {
  title?: string;
  artist?: string;
  coverUrl?: string;
}

export interface TrackOverride {
  title?: string;
  artist?: string;
  albumCover?: string;
}

export interface ArtistOverride {
  name?: string;
  img?: string;
}

export type EditTarget =
  | { type: 'album'; album: Album }
  | { type: 'artist'; artist: { name: string; img: string; type?: string } }
  | { type: 'track'; track: Track; album?: Album }
  | { type: 'button'; key: string; label: string; defaultLabel: string }
  | { type: 'cover'; album: Album };

interface AdminEditContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (active: boolean) => void;
  activeEditTarget: EditTarget | null;
  openEditModal: (target: EditTarget) => void;
  closeEditModal: () => void;
  
  // Getters with fallback
  getButtonText: (key: string, defaultText: string) => string;
  applyAlbumOverrides: (album: Album) => Album;
  applyAllAlbumOverrides: (albums: Album[]) => Album[];
  applyArtistOverrides: (artist: { name: string; img: string; type?: string }) => { name: string; img: string; type?: string };
  applyTrackOverrides: (track: Track) => Track;
  
  // Mutators
  saveAlbumOverride: (albumId: string | number, data: AlbumOverride) => Promise<void>;
  saveTrackOverride: (trackId: string | number, data: TrackOverride) => Promise<void>;
  saveArtistOverride: (artistName: string, data: ArtistOverride) => Promise<void>;
  saveButtonOverride: (key: string, newText: string) => void;
  resetButtonOverride: (key: string) => void;
  resetAllOverrides: () => void;
  
  // Status
  totalOverridesCount: number;
}

const STORAGE_KEY_ALBUMS = 'bz_admin_album_overrides';
const STORAGE_KEY_TRACKS = 'bz_admin_track_overrides';
const STORAGE_KEY_ARTISTS = 'bz_admin_artist_overrides';
const STORAGE_KEY_BUTTONS = 'bz_admin_button_overrides';
const STORAGE_KEY_MODE = 'bz_admin_edit_mode_active';

const AdminEditContext = createContext<AdminEditContextType | null>(null);

export const AdminEditProvider: React.FC<{
  children: React.ReactNode;
  isAdmin: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}> = ({ children, isAdmin, supabaseUrl, supabaseAnonKey }) => {
  // Edit mode active by default for Admin
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    if (!isAdmin) return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODE);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // Modal state
  const [activeEditTarget, setActiveEditTarget] = useState<EditTarget | null>(null);

  // Overrides in state
  const [albumOverrides, setAlbumOverrides] = useState<Record<string, AlbumOverride>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALBUMS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [trackOverrides, setTrackOverrides] = useState<Record<string, TrackOverride>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRACKS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [artistOverrides, setArtistOverrides] = useState<Record<string, ArtistOverride>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ARTISTS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [buttonOverrides, setButtonOverrides] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BUTTONS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Supabase client instance for real DB sync
  const supabase = useMemo(() => {
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    return null;
  }, [supabaseUrl, supabaseAnonKey]);

  // Synchronize edit mode with isAdmin
  useEffect(() => {
    if (!isAdmin) {
      setIsEditMode(false);
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MODE);
        if (stored !== null) {
          setIsEditMode(JSON.parse(stored));
        } else {
          setIsEditMode(true);
        }
      } catch {
        setIsEditMode(true);
      }
    }
  }, [isAdmin]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setEditMode = useCallback((active: boolean) => {
    setIsEditMode(active);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(active));
    } catch {}
  }, []);

  const openEditModal = useCallback((target: EditTarget) => {
    setActiveEditTarget(target);
  }, []);

  const closeEditModal = useCallback(() => {
    setActiveEditTarget(null);
  }, []);

  // Button text getter
  const getButtonText = useCallback((key: string, defaultText: string): string => {
    if (buttonOverrides[key] && buttonOverrides[key].trim()) {
      return buttonOverrides[key];
    }
    return defaultText;
  }, [buttonOverrides]);

  // Apply track overrides
  const applyTrackOverrides = useCallback((track: Track): Track => {
    const override = trackOverrides[String(track.id)];
    if (!override) return track;
    return {
      ...track,
      title: override.title || track.title,
      artist: override.artist || track.artist,
      albumCover: override.albumCover || track.albumCover,
    };
  }, [trackOverrides]);

  // Apply album overrides
  const applyAlbumOverrides = useCallback((album: Album): Album => {
    const override = albumOverrides[String(album.id)];
    const tracksWithOverrides = album.tracks?.map(applyTrackOverrides);
    if (!override) {
      return tracksWithOverrides ? { ...album, tracks: tracksWithOverrides } : album;
    }
    return {
      ...album,
      title: override.title || album.title,
      artist: override.artist || album.artist,
      coverUrl: override.coverUrl || album.coverUrl,
      tracks: tracksWithOverrides || album.tracks,
    };
  }, [albumOverrides, applyTrackOverrides]);

  // Apply all album overrides
  const applyAllAlbumOverrides = useCallback((albums: Album[]): Album[] => {
    return albums.map(applyAlbumOverrides);
  }, [applyAlbumOverrides]);

  // Apply artist overrides
  const applyArtistOverrides = useCallback((artist: { name: string; img: string; type?: string }) => {
    const override = artistOverrides[artist.name];
    if (!override) return artist;
    return {
      ...artist,
      name: override.name || artist.name,
      img: override.img || artist.img,
    };
  }, [artistOverrides]);

  // Save album override
  const saveAlbumOverride = useCallback(async (albumId: string | number, data: AlbumOverride) => {
    const idStr = String(albumId);
    setAlbumOverrides(prev => {
      const next = {
        ...prev,
        [idStr]: {
          ...prev[idStr],
          ...data,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Also attempt Supabase sync in background if available
    if (supabase) {
      try {
        const updatePayload: Record<string, string> = {};
        if (data.title) updatePayload.album = data.title;
        if (data.artist) updatePayload.artist = data.artist;
        if (data.coverUrl) updatePayload.image_url = data.coverUrl;

        if (Object.keys(updatePayload).length > 0) {
          // Update tracks matching this album
          await supabase.from('tracks').update(updatePayload).eq('album', idStr);
        }
      } catch (err) {
        console.warn('Supabase DB album update sync warning:', err);
      }
    }
  }, [supabase]);

  // Save track override
  const saveTrackOverride = useCallback(async (trackId: string | number, data: TrackOverride) => {
    const idStr = String(trackId);
    setTrackOverrides(prev => {
      const next = {
        ...prev,
        [idStr]: {
          ...prev[idStr],
          ...data,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Supabase sync
    if (supabase) {
      try {
        const updatePayload: Record<string, string> = {};
        if (data.title) updatePayload.title = data.title;
        if (data.artist) updatePayload.artist = data.artist;
        if (data.albumCover) updatePayload.image_url = data.albumCover;

        if (Object.keys(updatePayload).length > 0) {
          await supabase.from('tracks').update(updatePayload).eq('id', Number(trackId));
        }
      } catch (err) {
        console.warn('Supabase DB track update sync warning:', err);
      }
    }
  }, [supabase]);

  // Save artist override
  const saveArtistOverride = useCallback(async (artistName: string, data: ArtistOverride) => {
    setArtistOverrides(prev => {
      const next = {
        ...prev,
        [artistName]: {
          ...prev[artistName],
          ...data,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Supabase sync for tracks by this artist
    if (supabase && data.name) {
      try {
        await supabase.from('tracks').update({ artist: data.name }).eq('artist', artistName);
      } catch (err) {
        console.warn('Supabase DB artist update sync warning:', err);
      }
    }
  }, [supabase]);

  // Save button override
  const saveButtonOverride = useCallback((key: string, newText: string) => {
    setButtonOverrides(prev => {
      const next = {
        ...prev,
        [key]: newText.trim(),
      };
      try {
        localStorage.setItem(STORAGE_KEY_BUTTONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Reset button override
  const resetButtonOverride = useCallback((key: string) => {
    setButtonOverrides(prev => {
      const next = { ...prev };
      delete next[key];
      try {
        localStorage.setItem(STORAGE_KEY_BUTTONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Reset all overrides
  const resetAllOverrides = useCallback(() => {
    setAlbumOverrides({});
    setTrackOverrides({});
    setArtistOverrides({});
    setButtonOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY_ALBUMS);
      localStorage.removeItem(STORAGE_KEY_TRACKS);
      localStorage.removeItem(STORAGE_KEY_ARTISTS);
      localStorage.removeItem(STORAGE_KEY_BUTTONS);
    } catch {}
  }, []);

  const totalOverridesCount = useMemo(() => {
    return (
      Object.keys(albumOverrides).length +
      Object.keys(trackOverrides).length +
      Object.keys(artistOverrides).length +
      Object.keys(buttonOverrides).length
    );
  }, [albumOverrides, trackOverrides, artistOverrides, buttonOverrides]);

  const value = useMemo(
    () => ({
      isAdmin,
      isEditMode,
      toggleEditMode,
      setEditMode,
      activeEditTarget,
      openEditModal,
      closeEditModal,
      getButtonText,
      applyAlbumOverrides,
      applyAllAlbumOverrides,
      applyArtistOverrides,
      applyTrackOverrides,
      saveAlbumOverride,
      saveTrackOverride,
      saveArtistOverride,
      saveButtonOverride,
      resetButtonOverride,
      resetAllOverrides,
      totalOverridesCount,
    }),
    [
      isAdmin,
      isEditMode,
      toggleEditMode,
      setEditMode,
      activeEditTarget,
      openEditModal,
      closeEditModal,
      getButtonText,
      applyAlbumOverrides,
      applyAllAlbumOverrides,
      applyArtistOverrides,
      applyTrackOverrides,
      saveAlbumOverride,
      saveTrackOverride,
      saveArtistOverride,
      saveButtonOverride,
      resetButtonOverride,
      resetAllOverrides,
      totalOverridesCount,
    ]
  );

  return <AdminEditContext.Provider value={value}>{children}</AdminEditContext.Provider>;
};

export const useAdminEdit = (): AdminEditContextType => {
  const context = useContext(AdminEditContext);
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      isAdmin: false,
      isEditMode: false,
      toggleEditMode: () => {},
      setEditMode: () => {},
      activeEditTarget: null,
      openEditModal: () => {},
      closeEditModal: () => {},
      getButtonText: (_key, defaultText) => defaultText,
      applyAlbumOverrides: (album) => album,
      applyAllAlbumOverrides: (albums) => albums,
      applyArtistOverrides: (artist) => artist,
      applyTrackOverrides: (track) => track,
      saveAlbumOverride: async () => {},
      saveTrackOverride: async () => {},
      saveArtistOverride: async () => {},
      saveButtonOverride: () => {},
      resetButtonOverride: () => {},
      resetAllOverrides: () => {},
      totalOverridesCount: 0,
    };
  }
  return context;
};
