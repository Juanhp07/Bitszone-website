import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Play, Download, Check, CheckCircle, Loader2, Heart, HeartOff, AlertCircle, X } from 'lucide-react';
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

  const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum, cancelAlbumDownload, downloadingAlbums, downloadAlbum } = useDownloads();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const handleScroll = () => setScrollY(container.scrollTop);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<Album | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloadConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDownloadConfirm]);
  
  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation();
    setShowDownloadConfirm(album);
  };

  const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    await downloadAlbum(album);
  };

  const artistAlbums = albums.filter(a => a.artist.toLowerCase().includes(artist.name.toLowerCase()));

  return (
    <div className="h-full flex flex-col relative">
      

      {/* Sticky Header */}
      <div 
        className="sticky top-16 md:top-20 z-50 flex items-center h-16 md:h-[80px] -mb-16 md:-mb-20 px-4 md:px-8 transition-all duration-300 w-full"  
        style={{ 
          background: scrollY > 10 ? 'linear-gradient(90deg, rgba(45, 10, 70, 0.6) 0%, rgba(15, 15, 20, 0.95) 100%)' : 'transparent', 
          backdropFilter: scrollY > 10 ? 'blur(20px)' : 'none', 
          borderBottom: scrollY > 10 ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'
        }}
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 h-10 md:h-auto md:py-2 px-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-colors border border-white/10 shadow-lg shrink-0 group"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold tracking-wide uppercase text-[11px] mt-0.5">Volver</span>
        </button>
        
        <div 
          className="flex-1 min-w-0 flex items-center gap-3 md:gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ml-3 md:ml-6"  
          style={{ 
            opacity: scrollY > 200 ? 1 : 0, 
            transform: `translateY(${scrollY > 200 ? '0' : '15px'})`, 
            pointerEvents: scrollY > 200 ? 'auto' : 'none' 
          }}
        >
           <img src={artist.img} className="w-10 h-10 rounded-full shadow-md object-cover shrink-0" alt="" />
           <div className="flex flex-col min-w-0">
             <span className="text-white font-bold text-sm leading-tight line-clamp-1">{artist.name}</span>
             <span className="text-white/60 text-xs font-medium leading-tight">{artist.type || "Artista"}</span>
           </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 md:px-8 pt-2 md:pt-8 pb-4 md:pb-6 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 relative z-10">
        

        <div className="w-[min(48vw,190px)] h-[min(48vw,190px)] md:w-52 md:h-52 shrink-0 rounded-full shadow-2xl overflow-hidden mt-16 md:mt-12 relative border-4 border-[#05050A]">
          <img src={artist.img} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5 md:gap-2 pb-0 md:pb-2 min-w-0 md:min-w-[auto] w-full md:w-auto">
          <span className="text-white/70 text-xs md:text-sm font-semibold tracking-widest uppercase">Artista</span>
          <h1 className="text-[28px] leading-tight md:text-5xl lg:text-6xl md:leading-none font-black text-white tracking-tight break-words line-clamp-3 md:line-clamp-none" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{artist.name}</h1>
          <div className="flex items-center gap-2 mt-1 md:mt-2 text-sm md:text-base text-white/80 font-medium">
            <span>{artistAlbums.length} {artistAlbums.length === 1 ? "álbum" : "álbumes"}</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 relative z-10 flex-1 pt-4 md:pt-6 pb-10 md:pb-32">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Discografía</h2>
        
        {artistAlbums.length === 0 ? (
          <p className="text-white/50">No hay álbumes disponibles para este artista en la base de datos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {artistAlbums.map((album, i) => (
              <div 
                key={i} 
                onClick={() => onSelectAlbum(album)}
                className="group cursor-pointer bg-white/5 hover:bg-white/10 p-2.5 md:p-4 rounded-xl transition-colors border border-white/5 hover:border-white/10 min-w-0"
              >
                <div className={`relative aspect-square mb-3 md:mb-4 rounded-lg overflow-hidden shadow-lg transition-all duration-500 `}>
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {downloadingAlbums?.includes(String(album.id)) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center transition-all z-20 group/cancel shadow-lg"
                      title="Cancelar descarga"
                    >
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400 group-hover/cancel:hidden" />
                      <X className="w-5 h-5 hidden group-hover/cancel:block text-red-400" />
                    </button>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center text-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-all">
                      <Play className="w-6 h-6 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {album.tracks && album.tracks.length > 0 && (
                  <button 
                    onClick={(e) => handleDownloadAlbumClick(e, album)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 opacity-0 [@media(hover:none)]:opacity-100 group-hover:opacity-100 z-10"
                    disabled={album.tracks.every(t => isDownloaded(t.id)) || downloadingAlbums?.includes(String(album.id))}
                  >
                    {downloadingAlbums?.includes(String(album.id)) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                    ) : album.tracks.every(t => isDownloaded(t.id)) ? (
                      <CheckCircle className="w-4 h-4 text-[#a855f7]" strokeWidth={2.5} />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                )}
                </div>
                <div className="flex items-start justify-between gap-2 mt-1">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{album.title}</h3>
                    <p className="text-xs text-white/50 truncate mt-0.5">{album.artist}</p>
                    
                  </div>
                  {(() => {
                    const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;
                    return (
                      <button 
                 onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum(album); }}
                 className={`group/favbtn shrink-0 p-1 -mt-0.5 -mr-1 rounded-full transition-colors hover:scale-110 ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}`}
              >
                 {isEntireAlbumFavorited ? (
                   <>
                     <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
                     <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
                   </>
                 ) : (
                   <Heart className="w-4 h-4" fill="none" />
                 )}
              </button>
                    );
                  })()}
                </div>
                {(() => {
                  const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
                  const totalCount = album.tracks?.length || 0;
                  const isComplete = downloadedCount > 0 && downloadedCount === totalCount;
                  const isPartial = downloadedCount > 0 && downloadedCount < totalCount;
                  
                  if (downloadingAlbums?.includes(String(album.id))) {
                    return (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                        className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer group/dlpill"
                      >
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400 mr-1.5 group-hover/dlpill:hidden" />
                        <X className="w-3 h-3 text-red-400 mr-1.5 hidden group-hover/dlpill:block" />
                        <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase group-hover/dlpill:text-red-400">
                          Descargando...
                        </span>
                      </button>
                    );
                  }
                  if (isComplete || isPartial) {
                    return (
                      <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
                        <span className="text-[#c084fc] text-[9px] font-bold tracking-wider uppercase">
                          {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Download Confirmation Modal */}
      {showDownloadConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowDownloadConfirm(null)}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
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
        </div>,
        document.body
      )}

    
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(null); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas cancelar la descarga de <strong>{showCancelConfirm.title}</strong>? Las canciones que ya se han descargado se mantendrán.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Continuar descarga</button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(showCancelConfirm.id));
                  setShowCancelConfirm(null);
                }} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};