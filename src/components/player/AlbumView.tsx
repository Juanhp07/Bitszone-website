import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, CheckCircle, Loader2, AlertCircle , Trash2 } from 'lucide-react';
import type { Album, Track } from './types';
import { useDownloads } from './DownloadsContext';


const useAverageColor = (src: string) => {
  const [color, setColor] = useState('rgba(45, 10, 70, 0.8)');
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setColor(`rgba(${r}, ${g}, ${b}, 0.85)`);
      }
    };
    img.onerror = () => setColor('rgba(45, 10, 70, 0.8)');
    img.src = src;
  }, [src]);
  return color;
};

export const AlbumView = ({ 
  album, 
  loading,
  onViewChange,
  onPlayTrack,
  nowPlayingTrackId,
  isPlaying,
  togglePlay
}: { 
  album: Album | null, 
  loading: boolean,
  onViewChange: (view: any) => void,
  onPlayTrack: (t: Track, a: Album) => void,
  nowPlayingTrackId?: number,
  isPlaying: boolean,
  togglePlay: () => void
}) => {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const handleScroll = () => {
      setScrollY(container.scrollTop);
      setShowMoreMenu(false);
      setOpenTrackMenu(null);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloadConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDownloadConfirm]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLButtonElement>(null);
  const [moreMenuPos, setMoreMenuPos] = useState({ top: 0, left: 0 });
  const [openTrackMenu, setOpenTrackMenu] = useState<number | null>(null);
  const [trackMenuPos, setTrackMenuPos] = useState({ top: 0, left: 0, isUpward: false });
  const { isLicensed, downloadTrack, isDownloaded, toggleFavorite, isFavorite, toggleFavoriteAlbum, removeDownload, downloadingAlbums, downloadAlbum, cancelAlbumDownload } = useDownloads();
  const dominantColor = useAverageColor(album?.coverUrl || '');
  const isDownloadingAlbum = downloadingAlbums.includes(String(album?.id));

useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowMoreMenu(false); setOpenTrackMenu(null); }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
      return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!album) return null;

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPlays = (id: number) => {
    // Generate a pseudo-random looking number based on the ID so it doesn't change on re-render
    const num = ((id * 1234567) % 900000) + 100000;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleDownload = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (isDownloaded(track.id)) return;
    setDownloadingIds(prev => [...prev, track.id]);
    await downloadTrack(track, album);
    setDownloadingIds(prev => prev.filter(id => id !== track.id));
  };

  const handleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    toggleFavorite(track, album);
  };

  
  const handleDownloadAlbum = () => {
    setShowDownloadConfirm(false);
    downloadAlbum(album);
  };

  const isEntireAlbumDownloaded = album.tracks?.every(t => isDownloaded(t.id)) ?? false;
  const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;

  return (
    <div className="h-full flex flex-col relative">
      

      {/* Static Volver Button (Unscrolled State) */}
      <div 
        className="absolute top-4 left-4 md:top-8 md:left-8 z-40 transition-opacity duration-300"
        style={{ 
          opacity: scrollY > 150 ? 0 : 1, 
          pointerEvents: scrollY > 150 ? 'none' : 'auto' 
        }}
      >
        <button 
          onClick={() => onViewChange('catalog')}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-colors border border-white/10 shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          title="Volver al catálogo"
          aria-label="Volver al catálogo"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="font-bold tracking-wide uppercase text-[11px] mt-0.5">Volver</span>
        </button>
      </div>

      {/* Floating Pill (Sticky/Scrolled State) */}
      <div 
        className="sticky top-24 z-50 mx-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between shadow-2xl overflow-hidden border border-white/10"
        style={{ 
          width: 'calc(100% - 4rem)',
          background: `linear-gradient(90deg, ${dominantColor} 0%, rgba(15, 15, 20, 0.95) 100%)`,
          backdropFilter: 'blur(24px)',
          borderRadius: '9999px',
          padding: '8px 16px 8px 8px',
          opacity: scrollY > 200 ? 1 : 0,
          transform: scrollY > 200 ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
          pointerEvents: scrollY > 200 ? 'auto' : 'none',
          marginBottom: '-64px'
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={() => onViewChange('catalog')}
            className="flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-colors shadow-lg shrink-0 w-10 h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            title="Volver al catálogo"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          
          <img src={album.coverUrl} className="w-10 h-10 rounded-full shadow-md object-cover shrink-0" alt={album.title} />
          
          <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-white font-bold text-sm truncate">{album.title}</span>
            <span className="text-white/50 text-sm shrink-0">•</span>
            <span className="text-white/90 text-sm font-medium shrink-0">{album.artist}</span>
            <span className="text-white/50 text-sm shrink-0">—</span>
            <span className="text-white/50 text-sm shrink-0">{album.trackCount} {album.trackCount === 1 ? 'canción' : 'canciones'} • {album.totalDuration ? (Math.floor(album.totalDuration / 3600000) > 0 ? `${Math.floor(album.totalDuration / 3600000)} h ${Math.floor((album.totalDuration % 3600000) / 60000)} min` : `${Math.floor(album.totalDuration / 60000)} min ${Math.floor((album.totalDuration % 60000) / 1000)} s`) : ''} • {album.year}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            className="w-10 h-10 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 rounded-full flex items-center justify-center text-white transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            onClick={() => {
              if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                togglePlay();
              } else if (album.tracks && album.tracks.length > 0) {
                onPlayTrack(album.tracks[0], album);
              }
            }}
            title={isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? "Pausar álbum" : "Reproducir álbum"}
            aria-label={isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? "Pausar álbum" : "Reproducir álbum"}
          >
            {isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? (
              <Pause className="w-4 h-4" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <button 
            onClick={() => toggleFavoriteAlbum(album)} 
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7]' : 'text-white/70 hover:text-white'}`}
            title={isEntireAlbumFavorited ? "Quitar álbum de favoritos" : "Guardar álbum en favoritos"}
            aria-label={isEntireAlbumFavorited ? "Quitar álbum de favoritos" : "Guardar álbum en favoritos"}
          >
            <Heart className="w-4 h-4" fill={isEntireAlbumFavorited ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          {(() => {
            if (isDownloadingAlbum) {
              return (
                <button 
                  onClick={() => setShowCancelConfirm(true)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                  title="Cancelar descarga del álbum"
                  aria-label="Cancelar descarga del álbum"
                >
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                </button>
              );
            }
            const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
            const totalCount = album.tracks?.length || 0;
            if (downloadedCount > 0 && downloadedCount === totalCount) {
              return (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#a855f7]/15 text-[#c084fc] hover:bg-[#a855f7]/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  title="Eliminar descargas del álbum"
                  aria-label="Eliminar descargas del álbum"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                </button>
              );
            }
            return (
              <button 
                onClick={() => setShowDownloadConfirm(true)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Descargar álbum completo"
                aria-label="Descargar álbum completo"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </button>
            );
          })()}
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 md:px-8 pt-16 md:pt-20 pb-4 md:pb-6 flex flex-col lg:flex-row items-center md:items-start lg:items-end lg:justify-between gap-5 lg:gap-0 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto min-w-0 md:min-w-[auto]">
          <div className="w-[min(56vw,220px)] h-[min(56vw,220px)] md:w-52 md:h-52 shrink-0 rounded-2xl shadow-2xl overflow-hidden mt-8 md:mt-12 relative group transition-all duration-500">
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5 md:gap-2 pb-0 md:pb-2 min-w-0 md:min-w-[auto] w-full md:w-auto">
            <span className="text-white/70 text-xs md:text-sm font-semibold tracking-widest uppercase">Álbum</span>
            <h1 className="text-[26px] leading-tight md:text-5xl lg:text-6xl md:leading-none font-black text-white tracking-tight break-words line-clamp-3 md:line-clamp-none" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{album.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-0.5 mt-1 md:mt-2 text-sm md:text-base text-white/80 font-medium">
              <span className="text-white">{album.artist}</span>
              <span>•</span>
              <span>{album.year}</span>
              <span>•</span>
              <span>{album.trackCount} {album.trackCount === 1 ? "canción" : "canciones"}</span>
              <span>•</span>
              <span className="text-white/50">
                {album.totalDuration ? (
                  Math.floor(album.totalDuration / 3600000) > 0
                    ? `${Math.floor(album.totalDuration / 3600000)} h ${Math.floor((album.totalDuration % 3600000) / 60000)} min`
                    : `${Math.floor(album.totalDuration / 60000)} min ${Math.floor((album.totalDuration % 60000) / 1000)} s`
                ) : ''}
              </span>
            </div>
            {(() => {
              if (isDownloadingAlbum) {
                return (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
                    className="mt-2 md:mt-3 w-max px-3 py-1.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 mr-1.5" />
                    <span className="text-blue-400 text-xs font-bold tracking-wider uppercase">
                      Descargando...
                    </span>
                  </button>
                );
              }
              const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
              const totalCount = album.tracks?.length || 0;
              const isComplete = downloadedCount > 0 && downloadedCount === totalCount;
              const isPartial = downloadedCount > 0 && downloadedCount < totalCount;
              if (isComplete || isPartial) {
                return (
                  <div className="mt-2 md:mt-3 w-max px-3 py-1.5 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
                    <span className="text-[#c084fc] text-xs font-bold tracking-wider uppercase">
                      {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6 pb-0 md:pb-2">
          <button 
            className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 rounded-full flex items-center justify-center text-white transition-all shadow-[0_8px_20px_rgba(168,85,247,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            onClick={() => {
              if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                togglePlay();
              } else if (album.tracks && album.tracks.length > 0) {
                onPlayTrack(album.tracks[0], album);
              }
            }}
            title={isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? "Pausar álbum" : "Reproducir álbum"}
            aria-label={isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? "Pausar álbum" : "Reproducir álbum"}
          >
            {isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? (
              <Pause className="w-6 h-6" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="w-6 h-6 ml-1" fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <button 
            onClick={() => toggleFavoriteAlbum(album)} 
            className={`group/favbtn w-11 h-11 md:w-auto md:h-auto flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}`}
            title={isEntireAlbumFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-label={isEntireAlbumFavorited ? "Quitar álbum de favoritos" : "Añadir álbum a favoritos"}
          >
            {isEntireAlbumFavorited ? (
              <>
                <Heart className="w-7 h-7 md:w-8 md:h-8 block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                <HeartOff className="w-7 h-7 md:w-8 md:h-8 hidden group-hover/favbtn:block" aria-hidden="true" />
              </>
            ) : (
              <Heart className="w-7 h-7 md:w-8 md:h-8" fill="none" aria-hidden="true" />
            )}
          </button>

          <button 
            className="w-11 h-11 md:w-auto md:h-auto flex items-center justify-center text-white/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
            onClick={() => {
              if (isDownloadingAlbum) {
                setShowCancelConfirm(true);
              } else if (!isEntireAlbumDownloaded) {
                setShowDownloadConfirm(true);
              }
            }}
            disabled={isEntireAlbumDownloaded && !isDownloadingAlbum}
            title={isDownloadingAlbum ? "Descargando álbum..." : isEntireAlbumDownloaded ? "Álbum descargado" : "Descargar álbum"}
            aria-label={isDownloadingAlbum ? "Descargando álbum..." : isEntireAlbumDownloaded ? "Álbum ya descargado" : "Descargar álbum"}
          >
            {isDownloadingAlbum ? (
              <Loader2 className="w-7 h-7 md:w-8 md:h-8 animate-spin text-[#a855f7]" aria-hidden="true" />
            ) : isEntireAlbumDownloaded ? (
              <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Download className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
            )}
          </button>

          <div className="relative z-50">
            <button 
              ref={moreMenuRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMoreMenuPos({ top: rect.bottom, left: rect.left });
                setShowMoreMenu(!showMoreMenu);
              }}
              className="w-11 h-11 md:w-auto md:h-auto flex md:inline-block items-center justify-center text-white/50 hover:text-white transition-colors group relative z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
              title="Más opciones del álbum"
              aria-label="Más opciones del álbum"
              aria-expanded={showMoreMenu}
            >
              <MoreHorizontal className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
            </button>
            {showMoreMenu && typeof document !== 'undefined' && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowMoreMenu(false)} />
                <div 
                  style={{ top: moreMenuPos.top, left: Math.max(8, Math.min(moreMenuPos.left - 180, window.innerWidth - 228)) }}
                  className="fixed mt-8 w-[220px] border border-white/10 rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-[#140d1f]/95 md:bg-black/30"
                >
                  <button 
                    onClick={() => { toggleFavoriteAlbum(album); setShowMoreMenu(false); }}
                    className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {isEntireAlbumFavorited ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
                    <Heart className="w-4 h-4" fill={isEntireAlbumFavorited ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => { 
                      if (!isEntireAlbumDownloaded) {
                        setShowDownloadConfirm(true);
                      } else {
                        setShowDeleteConfirm(true);
                      }
                      setShowMoreMenu(false); 
                    }}
                    className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {isEntireAlbumDownloaded ? 'Eliminar descarga' : 'Descargar álbum'}
                    {isEntireAlbumDownloaded ? <CheckCircle className="w-4 h-4" strokeWidth={2.5} /> : <Download className="w-4 h-4" />}
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
      </div>

      <div className="px-2 md:px-8 relative z-10 flex-1">
        <div className="mt-2 md:mt-8">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[50px_1fr_120px_100px_100px_80px_100px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
            <div className="text-left">#</div>
            <div className="text-left">TÍTULO</div>
            <div className="text-center">REPRODUCCIONES</div>
            <div className="text-center">DESCARGAR</div>
            <div className="text-center">FAVORITOS</div>
            <div className="text-center">TIEMPO</div>
            <div className="text-center">OPCIONES</div>
          </div>

          {/* Tracklist */}
          <div className="flex flex-col gap-1 pb-8">
            {album.tracks?.map((track, index) => {
              const isPlayingTrack = nowPlayingTrackId === track.id;
              const isHovered = hoveredTrack === track.id;
              const downloaded = isDownloaded(track.id);
              const isDownloading = downloadingIds.includes(track.id);
              const favorited = isFavorite(track.id);

              return (
                <div 
                  key={track.id}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onClick={() => onPlayTrack(track, album)}
                  className={`grid grid-cols-[28px_minmax(0,1fr)_44px_44px] lg:grid-cols-[50px_1fr_120px_100px_100px_80px_100px] gap-2 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3 items-center rounded-xl cursor-pointer group ${
                    nowPlayingTrackId === track.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="text-left text-white/50 font-medium flex items-center">
                    {isPlayingTrack ? (
                      <div className="flex items-end justify-center gap-[2.5px] h-4 w-4 mx-auto">
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-2 animate-[bounce_1s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-4 animate-[bounce_1.2s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-3 animate-[bounce_0.8s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[10px] animate-[bounce_1.1s_infinite]' : 'h-[4px]'}`}></div>
                      </div>
                    ) : isHovered ? (
                      <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
                    ) : (
                      <span className={nowPlayingTrackId === track.id ? 'text-[#a855f7]' : ''}>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0 pr-1 lg:pr-4">
                    <span className={`text-[15px] lg:text-base font-medium line-clamp-1 flex items-center gap-1.5 ${nowPlayingTrackId === track.id ? 'text-[#a855f7]' : 'text-white'}`}>
                      {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
                      <span className="truncate">{track.title}</span>
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {track.previewUrl.includes('explicit') && (
                        <span className="px-1 py-0.5 rounded-sm bg-white/20 text-[10px] font-bold text-white leading-none">E</span>
                      )}
                      <span className="text-white/50 text-[13px] lg:text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex text-center text-white/50 text-sm items-center justify-center">{getPlays(track.id)}</div>
                  
                  <div className="hidden lg:flex items-center justify-center">
                    <button 
                      onClick={(e) => handleDownload(e, track)}
                      className="text-white/40 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
                      disabled={isDownloading || downloaded}
                      title={isDownloading ? "Descargando..." : downloaded ? "Canción descargada" : `Descargar ${track.title}`}
                      aria-label={isDownloading ? "Descargando canción" : downloaded ? "Canción descargada" : `Descargar ${track.title}`}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" aria-hidden="true" />
                      ) : downloaded ? (
                        <CheckCircle className="w-4 h-4 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
                      ) : (
                        <Download className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <button 
                      onClick={(e) => handleFavorite(e, track)}
                      className={`group/favbtn w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${favorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/40 hover:text-white'}`}
                      title={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
                      aria-label={favorited ? `Quitar ${track.title} de favoritos` : `Añadir ${track.title} a favoritos`}
                    >
                      {favorited ? (
                        <>
                          <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                          <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" aria-hidden="true" />
                        </>
                      ) : (
                        <Heart className="w-4 h-4" fill="none" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="hidden lg:flex text-center text-white/50 text-sm items-center justify-center">
                    {formatDuration(track.duration)}
                  </div>
                  
                  <div className="flex items-center justify-center relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const isUpward = spaceBelow < 250;
                        setTrackMenuPos({ 
                          top: isUpward ? rect.top : rect.bottom, 
                          left: rect.left,
                          isUpward 
                        });
                        setOpenTrackMenu(openTrackMenu === track.id ? null : track.id);
                      }}
                      className="w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center text-white/40 hover:text-white transition-colors p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                      title="Más opciones de la canción"
                      aria-label={`Más opciones para ${track.title}`}
                      aria-expanded={openTrackMenu === track.id}
                    >
                      <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Download Confirmation Modal */}
      {showDownloadConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowDownloadConfirm(false)}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Descargar Álbum?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              ¿Estás seguro que deseas descargar todas las canciones de <strong>{album.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDownloadConfirm(false)} 
                title="Cancelar descarga del álbum"
                aria-label="Cancelar descarga del álbum"
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDownloadAlbum} 
                title="Descargar todas las canciones de este álbum"
                aria-label="Descargar todas las canciones de este álbum"
                className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Descargar Todo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    
      {/* Cancel Download Confirmation Modal */}
      
      {openTrackMenu !== null && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenTrackMenu(null)} />
          <div 
            style={{ top: trackMenuPos.top, left: Math.max(8, Math.min(trackMenuPos.left - 240, window.innerWidth - 288)) }}
            className={`fixed w-[280px] border border-white/10 rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-[#140d1f]/95 md:bg-black/30 ${trackMenuPos.isUpward ? '-translate-y-full -mt-2' : 'mt-2'}`}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(album!.tracks!.find(t => t.id === openTrackMenu)!); setOpenTrackMenu(null); }}
              title={isFavorite(openTrackMenu) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
              aria-label={isFavorite(openTrackMenu) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              {isFavorite(openTrackMenu) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const track = album!.tracks!.find(t => t.id === openTrackMenu)!;
                if (isDownloaded(track.id)) {
                  removeDownload(track.id);
                } else {
                  downloadTrack(track);
                }
                setOpenTrackMenu(null); 
              }}
              title={isDownloaded(openTrackMenu) ? 'Eliminar descarga' : 'Descargar canción'}
              aria-label={isDownloaded(openTrackMenu) ? 'Eliminar descarga' : 'Descargar canción'}
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              {isDownloaded(openTrackMenu) ? 'Eliminar descarga' : 'Descargar canción'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenTrackMenu(null); }}
              title="Crear lista de reproducción"
              aria-label="Crear lista de reproducción"
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Crear lista de reproducción
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenTrackMenu(null); }}
              title="Agregar a lista de reproducción"
              aria-label="Agregar a lista de reproducción"
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Agregar a lista de reproducción
            </button>
          </div>
        </>,
        document.body
      )}

      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(false); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas cancelar la descarga de <strong>{album.title}</strong>? Las canciones que ya se han descargado se mantendrán.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCancelConfirm(false)} 
                title="Continuar con la descarga"
                aria-label="Continuar con la descarga"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Continuar descarga
              </button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(album.id));
                  setShowCancelConfirm(false);
                }} 
                title="Confirmar cancelación de descarga"
                aria-label="Confirmar cancelación de descarga"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    
      {/* Delete Download Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Eliminar descargas?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas eliminar todas las canciones descargadas de <strong>{album.title}</strong>? Perderás el acceso sin conexión a este álbum.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                title="Cancelar y mantener descargas"
                aria-label="Cancelar y mantener descargas"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Cancelar
              </button>
              <button 
                title="Confirmar eliminación de descargas"
                aria-label="Confirmar eliminación de descargas"
                onClick={() => {
                  if (album.tracks) {
                    album.tracks.forEach(track => removeDownload(track.id, true));
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: `Álbum '${album.title}' eliminado de Descargas` }));
                  }
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};