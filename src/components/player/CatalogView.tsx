import React from 'react';
import type { Album, Track } from './types';
import { Play } from 'lucide-react';

const DUMMY_ARTISTS = [
  { name: 'Bad Bunny', role: 'Artista', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
  { name: 'KAROL G', role: 'Artista', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
  { name: 'Rauw Alejandro', role: 'Artista', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80' },
  { name: 'J Balvin', role: 'Artista', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { name: 'Maluma', role: 'Artista', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80' },
  { name: 'Feid', role: 'Artista', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { name: 'Danny Ocean', role: 'Artista', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80' },
];

export const CatalogView = ({ 
  albums, 
  loading, 
  onSelectAlbum,
  onPlayTrack
}: { 
  albums: Album[], 
  loading: boolean, 
  onSelectAlbum: (album: Album) => void,
  onPlayTrack: (track: Track, album: Album) => void
}) => {
  // Sacamos todas las canciones del único álbum que tenemos para la sección "Canciones del momento"
  const allTracks = albums.flatMap(a => a.tracks?.map(t => ({ track: t, album: a })) || []);
  const displayTracks = allTracks.slice(0, 8); // Mostrar algunas

  return (
    <div className="w-full h-full px-10 py-10 pb-40 relative z-10">
      
      {/* Canciones del momento */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Canciones del momento</h2>
          <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">Mostrar todo</button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[180px] w-[180px]">
                <div className="w-full aspect-square bg-white/5 rounded-md mb-4 animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded-full w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
              </div>
            ))
          ) : (
            displayTracks.map((item, idx) => (
              <div 
                key={idx} 
                className="min-w-[180px] w-[180px] group cursor-pointer"
                onClick={() => onPlayTrack(item.track, item.album)}
              >
                <div className="w-full aspect-square mb-4 relative rounded-md overflow-hidden bg-white/5 shadow-lg">
                  <img src={item.album.coverUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cover" />
                  
                  {/* Play Button Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-[#a855f7] text-white flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                      <Play className="w-6 h-6 ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm mb-1 truncate">{item.track.title}</h3>
                <p className="text-white/50 text-xs truncate">{item.track.artist}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Artistas Populares */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Artistas populares</h2>
          <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">Mostrar todo</button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {DUMMY_ARTISTS.map((artist, idx) => (
            <div key={idx} className="min-w-[180px] w-[180px] group cursor-pointer flex flex-col items-center text-center">
              <div className="w-full aspect-square mb-4 relative rounded-full overflow-hidden shadow-xl bg-white/5">
                <img src={artist.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={artist.name} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 rounded-full bg-[#a855f7] text-white flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-medium text-sm mb-1 truncate w-full">{artist.name}</h3>
              <p className="text-white/50 text-xs truncate w-full">{artist.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Álbumes (Para poder entrar al AlbumView) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Álbumes destacados</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {albums.map((album, idx) => (
            <div 
              key={idx} 
              className="min-w-[180px] w-[180px] group cursor-pointer"
              onClick={() => onSelectAlbum(album)}
            >
              <div className="w-full aspect-square mb-4 relative rounded-md overflow-hidden bg-white/5 shadow-lg">
                <img src={album.coverUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cover" />
              </div>
              <h3 className="text-white font-medium text-sm mb-1 truncate">{album.title}</h3>
              <p className="text-white/50 text-xs truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
