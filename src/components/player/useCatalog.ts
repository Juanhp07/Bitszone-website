import { useState, useEffect } from 'react';
import type { Album, Track } from './types';

const ARTISTS = ['Michael Jackson', 'Daft Punk', 'The Weeknd', 'Dua Lipa', 'Tame Impala'];

export const useCatalog = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const fetchedAlbums: Album[] = [];
        for (const artist of ARTISTS) {
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=1`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            fetchedAlbums.push({
              id: result.collectionId,
              title: result.collectionName,
              artist: result.artistName,
              coverUrl: result.artworkUrl100.replace('100x100bb', '600x600bb'),
              year: result.releaseDate ? result.releaseDate.substring(0, 4) : 'Unknown',
              genre: result.primaryGenreName,
              trackCount: result.trackCount,
            });
          }
        }
        setAlbums(fetchedAlbums);
      } catch (error) {
        console.error("Error fetching catalog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const fetchAlbumDetails = async (albumId: number): Promise<Album | null> => {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const albumData = data.results.find((r: any) => r.wrapperType === 'collection');
        const tracksData = data.results.filter((r: any) => r.wrapperType === 'track');
        
        return {
          id: albumData.collectionId,
          title: albumData.collectionName,
          artist: albumData.artistName,
          coverUrl: albumData.artworkUrl100.replace('100x100bb', '600x600bb'),
          year: albumData.releaseDate ? albumData.releaseDate.substring(0, 4) : 'Unknown',
          genre: albumData.primaryGenreName,
          trackCount: albumData.trackCount,
          tracks: tracksData.map((t: any) => ({
            id: t.trackId,
            title: t.trackName,
            artist: t.artistName,
            duration: t.trackTimeMillis,
            previewUrl: t.previewUrl,
            trackNumber: t.trackNumber,
          })),
        };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  return { albums, loading, fetchAlbumDetails };
};
