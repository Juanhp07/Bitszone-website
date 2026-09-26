import React, { useState } from 'react';
import { ArrowLeft, Play, Download, Check, Loader2 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import type { Album } from './types';

export const ArtistView = ({ 
  artist, 
  albums, 
  onBack,
  onSelectAlbum
}: { 
  artist: { name: string, img: string, type?: string }, 
  albums: Album[],
  onBack: () => void,
  onSelectAlbum: (album: Album) => void 
}) => {
  // Filtrar los álbumes que pertenecen a este artista

  const { downloadTrack, isDownloaded } = useDownloads();
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);

  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation();
    setShowDownloadConfirm(album);
  };

  const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    setIsDownloadingAlbum(album.id);
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    for (const track of tracksToDownload) {
      setDownloadingIds(prev => [...prev, track.id]);
      await downloadTrack(track, album);
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
    setIsDownloadingAlbum(null);
  };

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
                  {album.tracks && album.tracks.length > 0 && (
                  <button 
                    onClick={(e) => handleDownloadAlbumClick(e, album)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 opacity-0 group-hover:opacity-100 z-10"
                    disabled={album.tracks.every(t => isDownloaded(t.id)) || isDownloadingAlbum === album.id}
                  >
                    {isDownloadingAlbum === album.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                    ) : album.tracks.every(t => isDownloaded(t.id)) ? (
                      <Check className="w-4 h-4 text-[#a855f7]" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                )}
                </div>
                <h3 className="font-bold text-white mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-white/50 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Download Confirmation Modal */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Descargar Álbum?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              ¿Estás seguro que deseas descargar todas las canciones de <strong>{showDownloadConfirm.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDownloadConfirm(null)} className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={executeDownloadAlbum} className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25">Descargar Todo</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
