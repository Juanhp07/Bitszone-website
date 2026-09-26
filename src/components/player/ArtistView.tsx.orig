import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import type { Album } from './types';

export const ArtistView = ({ 
  artist, 
  albums, 
  onBack,
  onSelectAlbum
}: { 
  artist: { name: string, img: string }, 
  albums: Album[],
  onBack: () => void,
  onSelectAlbum: (album: Album) => void 
}) => {
  // Filtrar los álbumes que pertenecen a este artista
  const artistAlbums = albums.filter(a => a.artist.toLowerCase().includes(artist.name.toLowerCase()));

  return (
    <div className="h-full flex flex-col relative">
      {/* Background Blurred Glow from Top-Right */}
      <div className="absolute top-0 right-0 w-[70vw] h-[700px] z-0 pointer-events-none opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}>
        <div className="absolute inset-0 bg-cover bg-center blur-[100px]" style={{ backgroundImage: `url(${artist.img})` }}></div>
      </div>

      {/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-end gap-6 relative z-10">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="w-52 h-52 shrink-0 rounded-full shadow-2xl overflow-hidden mt-12 relative border-4 border-[#05050A]">
          <img src={artist.img} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Artista</span>
          <h1 className="text-6xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{artist.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{artistAlbums.length} álbumes</span>
          </div>
        </div>
      </div>

      <div className="px-8 relative z-10 flex-1 pt-6 overflow-y-auto pb-32">
        <h2 className="text-2xl font-bold text-white mb-6">Discografía</h2>
        
        {artistAlbums.length === 0 ? (
          <p className="text-white/50">No hay álbumes disponibles para este artista en la base de datos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {artistAlbums.map((album, i) => (
              <div 
                key={i} 
                onClick={() => onSelectAlbum(album)}
                className="group cursor-pointer bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors border border-white/5 hover:border-white/10"
              >
                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center text-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-all">
                      <Play className="w-6 h-6 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-white/50 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
