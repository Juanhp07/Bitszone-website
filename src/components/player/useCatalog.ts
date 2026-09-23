import { useState, useEffect } from 'react';
import type { Album, Track } from './types';
import { createClient } from '@supabase/supabase-js';

export const useCatalog = (supabaseUrl?: string, supabaseAnonKey?: string) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Usar el cliente de Supabase solo si tenemos las credenciales
  const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      try {
        // Agrupar todas las canciones por álbum desde la base de datos
        const { data: tracks, error } = await supabase.from('tracks').select('*').order('track_number', { ascending: true });
        
        if (error) throw error;
        if (!tracks) return;

        // Convertir la lista plana de tracks a una lista de álbumes únicos
        const albumsMap = new Map<string, Album>();
        
        tracks.forEach(t => {
          const albumKey = t.album;
          if (!albumsMap.has(albumKey)) {
            albumsMap.set(albumKey, {
              id: albumKey, // Usamos el nombre del álbum como ID temporal
              title: t.album,
              artist: t.artist,
              coverUrl: t.image_url,
              year: '1982', // Hardcodeado por ahora para Thriller, o sacar de DB
              genre: 'Pop/Rock',
              trackCount: 0, // Lo calculamos luego
              tracks: []
            });
          }
          
          const album = albumsMap.get(albumKey)!;
          album.tracks!.push({
            id: t.id,
            title: t.title,
            artist: t.artist,
            duration: t.duration,
            previewUrl: t.audio_url,
            trackNumber: t.track_number,
          });
          album.trackCount = album.tracks!.length;
        });

        setAlbums(Array.from(albumsMap.values()));
      } catch (error) {
        console.error("Error fetching catalog from Supabase", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [supabaseUrl, supabaseAnonKey]); // re-run if credentials change

  const fetchAlbumDetails = async (albumId: string | number): Promise<Album | null> => {
    // Como ya cargamos todas las canciones de golpe en el fetchCatalog, 
    // simplemente devolvemos el álbum que ya tenemos en memoria.
    return albums.find(a => a.id === albumId) || null;
  };

  return { albums, loading, fetchAlbumDetails };
};
