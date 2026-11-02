import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase as defaultSupabase } from '../../lib/supabase';
import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
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

export interface RealtimeCatalogChangePayload {
  type: 'album' | 'track' | 'artist' | 'button' | 'reset';
  id?: string | number;
  data?: any;
}

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
  
  // Mutators & Upload
  uploadCoverFile: (file: File, prefix?: string) => Promise<{ url: string; error?: string | null }>;
  saveAlbumOverride: (albumId: string | number, data: AlbumOverride) => Promise<void>;
  saveTrackOverride: (trackId: string | number, data: TrackOverride) => Promise<void>;
  saveArtistOverride: (artistName: string, data: ArtistOverride) => Promise<void>;
  saveButtonOverride: (key: string, newText: string) => Promise<void>;
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

const ARTIST_CONFIG_PREFIX = 'artist_override:';
const ALBUM_CONFIG_PREFIX = 'album_override:';

const AdminEditContext = createContext<AdminEditContextType | null>(null);

export const AdminEditProvider: React.FC<{
  children: React.ReactNode;
  isAdmin: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}> = ({ children, isAdmin, supabaseUrl, supabaseAnonKey }) => {
  // Supabase client instance (prefer shared singleton from lib/supabase, fallback to new client)
  const supabase: SupabaseClient = useMemo(() => {
    if (defaultSupabase) return defaultSupabase;
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    return defaultSupabase;
  }, [supabaseUrl, supabaseAnonKey]);

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

  // Realtime channel reference
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // 1. Fetch remote global button/UI configs, artist overrides and album overrides from Supabase 'app_config' table
  useEffect(() => {
    let isMounted = true;
    const fetchGlobalConfig = async () => {
      try {
        const { data, error } = await supabase.from('app_config').select('key, value');
        if (error || !data || !isMounted) return;

        const remoteButtons: Record<string, string> = {};
        const remoteArtists: Record<string, ArtistOverride> = {};
        const remoteAlbums: Record<string, AlbumOverride> = {};

        data.forEach((row: any) => {
          if (!row.key || !row.value) return;

          if (row.key.startsWith(ARTIST_CONFIG_PREFIX)) {
            const artistName = row.key.slice(ARTIST_CONFIG_PREFIX.length);
            try {
              const parsed = JSON.parse(row.value);
              remoteArtists[artistName] = parsed;
              if (parsed.name && parsed.name !== artistName) {
                remoteArtists[parsed.name] = parsed;
              }
            } catch {
              remoteArtists[artistName] = { img: row.value };
            }
          } else if (row.key.startsWith(ALBUM_CONFIG_PREFIX)) {
            const albumId = row.key.slice(ALBUM_CONFIG_PREFIX.length);
            try {
              remoteAlbums[albumId] = JSON.parse(row.value);
            } catch {
              remoteAlbums[albumId] = { coverUrl: row.value };
            }
          } else {
            remoteButtons[row.key] = row.value;
          }
        });

        if (isMounted) {
          if (Object.keys(remoteButtons).length > 0) {
            setButtonOverrides(prev => ({
              ...prev,
              ...remoteButtons,
            }));
          }
          if (Object.keys(remoteArtists).length > 0) {
            setArtistOverrides(prev => ({
              ...prev,
              ...remoteArtists,
            }));
          }
          if (Object.keys(remoteAlbums).length > 0) {
            setAlbumOverrides(prev => ({
              ...prev,
              ...remoteAlbums,
            }));
          }
        }

        // Auto-sync: If user is Admin, check if there are any local artist overrides in localStorage
        // from previous sessions that haven't been saved to Supabase app_config yet.
        // This ensures the admin's changes become visible immediately to ALL other users!
        if (isAdmin) {
          try {
            const localStored = localStorage.getItem(STORAGE_KEY_ARTISTS);
            if (localStored) {
              const localArtists: Record<string, ArtistOverride> = JSON.parse(localStored);
              const toSync: { key: string; value: string; updated_at: string }[] = [];
              for (const [name, overrideData] of Object.entries(localArtists)) {
                if (!overrideData || (!overrideData.img && !overrideData.name)) continue;
                const remote = remoteArtists[name];
                if (!remote || (overrideData.img && remote.img !== overrideData.img) || (overrideData.name && remote.name !== overrideData.name)) {
                  toSync.push({
                    key: `${ARTIST_CONFIG_PREFIX}${name}`,
                    value: JSON.stringify(overrideData),
                    updated_at: new Date().toISOString(),
                  });
                }
              }
              if (toSync.length > 0) {
                await supabase.from('app_config').upsert(toSync);
              }
            }
          } catch (syncErr) {
            console.warn('Auto-sync local artist overrides to cloud error:', syncErr);
          }
        }
      } catch (err) {
        // Table might not exist yet before SQL migration, silently fallback to local storage
      }
    };

    fetchGlobalConfig();
    return () => { isMounted = false; };
  }, [supabase, isAdmin]);

  // 2. Setup Supabase Realtime Channel: broadcast + postgres changes
  // This allows ALL active users (normal users and admin) to see changes live in <100ms without reloading!
  useEffect(() => {
    const channelName = 'bz-realtime-catalog';
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: true } }
    });

    realtimeChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'catalog_change' }, (payload: any) => {
        const change: RealtimeCatalogChangePayload = payload?.payload;
        if (!change) return;

        if (change.type === 'album' && change.id) {
          const idStr = String(change.id);
          setAlbumOverrides(prev => ({
            ...prev,
            [idStr]: { ...prev[idStr], ...change.data },
          }));
        } else if (change.type === 'track' && change.id) {
          const idStr = String(change.id);
          setTrackOverrides(prev => ({
            ...prev,
            [idStr]: { ...prev[idStr], ...change.data },
          }));
        } else if (change.type === 'artist' && change.id) {
          const nameStr = String(change.id);
          setArtistOverrides(prev => ({
            ...prev,
            [nameStr]: { ...prev[nameStr], ...change.data },
            ...(change.data?.name ? { [change.data.name]: { ...prev[change.data.name], ...change.data } } : {}),
          }));
        } else if (change.type === 'button' && change.id) {
          const keyStr = String(change.id);
          setButtonOverrides(prev => ({
            ...prev,
            [keyStr]: change.data?.text || change.data,
          }));
        } else if (change.type === 'reset') {
          setAlbumOverrides({});
          setTrackOverrides({});
          setArtistOverrides({});
          setButtonOverrides({});
        }

        // Trigger custom UI event
        window.dispatchEvent(new CustomEvent('bz-catalog-realtime-update', { detail: change }));
      })
      // Also listen to direct database Postgres changes on 'tracks'
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, (payload: any) => {
        const record = payload.new || payload.record;
        if (!record) return;

        if (record.id) {
          setTrackOverrides(prev => ({
            ...prev,
            [String(record.id)]: {
              title: record.title,
              artist: record.artist,
              albumCover: record.image_url,
            },
          }));
        }
        if (record.album) {
          setAlbumOverrides(prev => ({
            ...prev,
            [record.album]: {
              ...prev[record.album],
              title: record.album,
              artist: record.artist,
              coverUrl: record.image_url,
            },
          }));
        }
      })
      // Also listen to direct database Postgres changes on 'app_config'
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, (payload: any) => {
        const record = payload.new || payload.record;
        if (!record || !record.key) return;

        if (record.key.startsWith(ARTIST_CONFIG_PREFIX)) {
          const artistName = record.key.slice(ARTIST_CONFIG_PREFIX.length);
          try {
            const parsed = JSON.parse(record.value);
            setArtistOverrides(prev => ({
              ...prev,
              [artistName]: { ...prev[artistName], ...parsed },
              ...(parsed.name ? { [parsed.name]: { ...prev[parsed.name], ...parsed } } : {}),
            }));
          } catch {
            setArtistOverrides(prev => ({
              ...prev,
              [artistName]: { ...prev[artistName], img: record.value },
            }));
          }
        } else if (record.key.startsWith(ALBUM_CONFIG_PREFIX)) {
          const albumId = record.key.slice(ALBUM_CONFIG_PREFIX.length);
          try {
            const parsed = JSON.parse(record.value);
            setAlbumOverrides(prev => ({
              ...prev,
              [albumId]: { ...prev[albumId], ...parsed },
            }));
          } catch {
            setAlbumOverrides(prev => ({
              ...prev,
              [albumId]: { ...prev[albumId], coverUrl: record.value },
            }));
          }
        } else if (record.value) {
          setButtonOverrides(prev => ({
            ...prev,
            [record.key]: record.value,
          }));
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected to realtime
        }
      });

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [supabase]);

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

  // Helper to broadcast changes instantly to all connected users
  const broadcastChange = useCallback((change: RealtimeCatalogChangePayload) => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'catalog_change',
        payload: change,
      }).catch(err => console.warn('Broadcast send warning:', err));
    }
  }, []);

  // Upload local image file to Supabase Storage 'covers' bucket
  const uploadCoverFile = useCallback(async (file: File, prefix: string = 'cover'): Promise<{ url: string; error?: string | null }> => {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const fileName = `${cleanPrefix}_${Date.now()}.${ext}`;
      const filePath = `covers/${fileName}`;

      // Upload to Supabase Storage bucket 'covers'
      const { data, error } = await supabase.storage.from('covers').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

      if (error) {
        console.warn('Storage upload notice (bucket might need SQL setup):', error);

        // Fallback: convert to base64 Data URL so local & broadcast preview still works seamlessly!
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        return { url: base64Url, error: error.message };
      }

      // Get public URL from Supabase
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(filePath);
      return { url: urlData.publicUrl, error: null };
    } catch (err: any) {
      console.error('File upload exception:', err);
      // Fallback
      const base64Fallback = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      return { url: base64Fallback, error: err?.message || 'Error al procesar archivo' };
    }
  }, [supabase]);

  // Save album override & sync globally to Supabase tracks table + app_config + realtime broadcast
  const saveAlbumOverride = useCallback(async (albumId: string | number, data: AlbumOverride) => {
    const idStr = String(albumId);
    let nextAlbumData: AlbumOverride = {};
    setAlbumOverrides(prev => {
      const merged = {
        ...prev[idStr],
        ...data,
      };
      nextAlbumData = merged;
      const next = {
        ...prev,
        [idStr]: merged,
      };
      try {
        localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Broadcast change immediately to all users!
    broadcastChange({
      type: 'album',
      id: idStr,
      data,
    });

    // Persist to Supabase 'app_config' table for guaranteed global visibility
    try {
      await supabase.from('app_config').upsert({
        key: `${ALBUM_CONFIG_PREFIX}${idStr}`,
        value: JSON.stringify(nextAlbumData),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase app_config album upsert warning:', err);
    }

    // Update Supabase tracks table so changes are permanent for all users forever
    try {
      const updatePayload: Record<string, string> = {};
      if (data.title) updatePayload.album = data.title;
      if (data.artist) updatePayload.artist = data.artist;
      if (data.coverUrl) updatePayload.image_url = data.coverUrl;

      if (Object.keys(updatePayload).length > 0) {
        await supabase.from('tracks').update(updatePayload).eq('album', idStr);
      }
    } catch (err) {
      console.warn('Supabase DB album update sync warning:', err);
    }
  }, [supabase, broadcastChange]);

  // Save track override & sync globally
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

    // Broadcast change immediately to all users!
    broadcastChange({
      type: 'track',
      id: idStr,
      data,
    });

    // Update in Supabase tracks table
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
  }, [supabase, broadcastChange]);

  // Save artist override & sync globally
  const saveArtistOverride = useCallback(async (artistName: string, data: ArtistOverride) => {
    let nextArtistData: ArtistOverride = {};
    setArtistOverrides(prev => {
      const merged = {
        ...prev[artistName],
        ...data,
      };
      nextArtistData = merged;
      const next = {
        ...prev,
        [artistName]: merged,
        ...(data.name ? { [data.name]: merged } : {}),
      };
      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Broadcast change immediately
    broadcastChange({
      type: 'artist',
      id: artistName,
      data,
    });

    // Persist to Supabase 'app_config' table so it's permanent for ALL users
    try {
      await supabase.from('app_config').upsert({
        key: `${ARTIST_CONFIG_PREFIX}${artistName}`,
        value: JSON.stringify(nextArtistData),
        updated_at: new Date().toISOString(),
      });
      if (data.name && data.name !== artistName) {
        await supabase.from('app_config').upsert({
          key: `${ARTIST_CONFIG_PREFIX}${data.name}`,
          value: JSON.stringify(nextArtistData),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Supabase app_config artist upsert warning:', err);
    }

    // Sync to Supabase tracks
    if (data.name && data.name !== artistName) {
      try {
        await supabase.from('tracks').update({ artist: data.name }).eq('artist', artistName);
      } catch (err) {
        console.warn('Supabase DB artist update sync warning:', err);
      }
    }
  }, [supabase, broadcastChange]);

  // Save button override & sync to 'app_config' in Supabase + broadcast
  const saveButtonOverride = useCallback(async (key: string, newText: string) => {
    const trimmed = newText.trim();
    setButtonOverrides(prev => {
      const next = {
        ...prev,
        [key]: trimmed,
      };
      try {
        localStorage.setItem(STORAGE_KEY_BUTTONS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Broadcast change immediately
    broadcastChange({
      type: 'button',
      id: key,
      data: { text: trimmed },
    });

    // Persist to Supabase 'app_config' table if available
    try {
      await supabase.from('app_config').upsert({
        key,
        value: trimmed,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase app_config upsert warning:', err);
    }
  }, [supabase, broadcastChange]);

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
  const resetAllOverrides = useCallback(async () => {
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

    broadcastChange({ type: 'reset' });

    try {
      await supabase.from('app_config').delete().like('key', `${ARTIST_CONFIG_PREFIX}%`);
      await supabase.from('app_config').delete().like('key', `${ALBUM_CONFIG_PREFIX}%`);
    } catch (err) {
      console.warn('Error clearing app_config overrides:', err);
    }
  }, [broadcastChange, supabase]);

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
      uploadCoverFile,
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
      uploadCoverFile,
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
      uploadCoverFile: async () => ({ url: '' }),
      saveAlbumOverride: async () => {},
      saveTrackOverride: async () => {},
      saveArtistOverride: async () => {},
      saveButtonOverride: async () => {},
      resetButtonOverride: () => {},
      resetAllOverrides: () => {},
      totalOverridesCount: 0,
    };
  }
  return context;
};
