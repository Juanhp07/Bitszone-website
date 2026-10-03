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

        const ALBUM_YEARS: Record<string, string> = {
          'Thriller': '1982',
          'Ahora Mas Que Nunca': '2001',
          'Meteora': '2003',
          'Hollywood\'s Bleeding': '2019',
          'CALM': '2020',
          'Face Value': '1981',
          'Make Yourself': '1999',
          'Pablo Honey': '1993',
          'True': '2013',
          'UTOPIA': '2023',
          'Whitesnake': '1987',
          'Yeezus': '2013',
          'Unorthodox Jukebox': '2012',
          'Purpose': '2015'
        };
        
        tracks.forEach(t => {
          const albumKey = t.album;
          
          // Filtrar álbumes o carpetas que comiencen con "_"
          if (albumKey && albumKey.startsWith('_')) {
            return;
          }
          if (t.audio_url && t.audio_url.includes('/_')) {
            return;
          }
          
          if (!albumsMap.has(albumKey)) {
            albumsMap.set(albumKey, {
              id: albumKey, // Usamos el nombre del álbum como ID temporal
              title: t.album,
              artist: t.artist,
              coverUrl: t.image_url,
              year: ALBUM_YEARS[albumKey] || '2023', // Asignado dinámicamente
              totalDuration: 0,
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
            duration: (t.duration && t.duration < 10000) ? t.duration * 1000 : (t.duration || 0),
            previewUrl: t.audio_url,
            trackNumber: t.track_number,
                        sizeMb: t.size_mb || t.size || (t.duration / 1000 * 0.023)
          });
          album.trackCount = album.tracks!.length;
          album.totalDuration = (album.totalDuration || 0) + ((t.duration && t.duration < 10000) ? t.duration * 1000 : (t.duration || 0));
        });

        setAlbums(Array.from(albumsMap.values()).filter(a => a.trackCount > 0));
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
