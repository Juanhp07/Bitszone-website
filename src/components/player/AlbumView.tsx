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
      

      {/* Sticky Header */}
      <div 
        className={`sticky z-50 mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between ${scrollY > 200 ? 'top-6 shadow-2xl border border-white/10' : 'top-8 border-transparent shadow-none'}`}
        style={{ 
          width: scrollY > 200 ? 'calc(100% - 4rem)' : 'auto',
          alignSelf: scrollY > 200 ? 'center' : 'flex-start',
          marginLeft: scrollY > 200 ? 'auto' : '2rem',
          marginRight: scrollY > 200 ? 'auto' : 'auto',
          background: scrollY > 200 ? `linear-gradient(90deg, ${dominantColor} 0%, rgba(15, 15, 20, 0.95) 100%)` : 'transparent',
          backdropFilter: scrollY > 200 ? 'blur(24px)' : 'none',
          borderRadius: '9999px',
          padding: scrollY > 200 ? '8px 16px 8px 8px' : '0px',
          marginBottom: '-50px',
          transform: 'translateY(0)'
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewChange('catalog')}
            className={`flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-colors border border-white/10 shadow-lg shrink-0 group ${scrollY > 200 ? 'w-10 h-10' : 'gap-2 px-4 py-2'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className={`font-bold tracking-wide uppercase text-[11px] mt-0.5 ${scrollY > 200 ? 'hidden' : 'block'}`}>Volver</span>
          </button>
          
          <div 
            className="flex items-center gap-3 transition-all duration-500 overflow-hidden" 
            style={{ 
              opacity: scrollY > 200 ? 1 : 0, 
              maxWidth: scrollY > 200 ? '800px' : '0px',
              pointerEvents: scrollY > 200 ? 'auto' : 'none' 
            }}
          >
             <img src={album.coverUrl} className="w-10 h-10 rounded-full shadow-md object-cover" alt={album.title} />
             <div className="flex items-center gap-2 whitespace-nowrap">
               <span className="text-white font-bold text-sm">{album.title}</span>
               <span className="text-white/50 text-sm">•</span>
               <span className="text-white/90 text-sm font-medium">{album.artist}</span>
               <span className="text-white/50 text-sm">—</span>
               <span className="text-white/50 text-sm">{album.trackCount} {album.trackCount === 1 ? 'canción' : 'canciones'} • {album.totalDuration ? (Math.floor(album.totalDuration / 3600000) > 0 ? `${Math.floor(album.totalDuration / 3600000)} h ${Math.floor((album.totalDuration % 3600000) / 60000)} min` : `${Math.floor(album.totalDuration / 60000)} min ${Math.floor((album.totalDuration % 60000) / 1000)} s`) : ''} • {album.year}</span>
             </div>
          </div>
        </div>

        <div 
          className="flex items-center gap-2 transition-all duration-500 overflow-hidden"
          style={{ 
            opacity: scrollY > 200 ? 1 : 0,
            maxWidth: scrollY > 200 ? '400px' : '0px',
            transform: `translateX(${scrollY > 200 ? '0' : '20px'})`,
            pointerEvents: scrollY > 200 ? 'auto' : 'none' 
          }}
        >
          <button 
            className="w-10 h-10 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            onClick={() => {
              if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                togglePlay();
              } else if (album.tracks && album.tracks.length > 0) {
                onPlayTrack(album.tracks[0], album);
              }
            }}
          >
            {isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button onClick={() => toggleFavoriteAlbum(album)} className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors ${isEntireAlbumFavorited ? 'text-[#a855f7]' : 'text-white/70 hover:text-white'}`}>
            <Heart className="w-4 h-4" fill={isEntireAlbumFavorited ? "currentColor" : "none"} />
          </button>
          {(() => {
            if (isDownloadingAlbum) {
              return (
                <button onClick={() => setShowCancelConfirm(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </button>
              );
            }
            const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
            const totalCount = album.tracks?.length || 0;
            if (downloadedCount > 0 && downloadedCount === totalCount) {
              return (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#a855f7]/15 text-[#c084fc] hover:bg-[#a855f7]/25 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                </button>
              );
            }
            return (
              <button onClick={() => setShowDownloadConfirm(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors text-white/70 hover:text-white">
                <Download className="w-4 h-4" />
              </button>
            );
          })()}
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-10">
        <div className="flex items-end gap-6">
          <div className="w-52 h-52 shrink-0 rounded-2xl shadow-2xl overflow-hidden mt-12 relative group transition-all duration-500">
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="flex flex-col gap-2 pb-2">
            <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Álbum</span>
            <h1 className="text-6xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{album.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
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
                    className="mt-3 w-max px-3 py-1.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer"
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
                  <div className="mt-3 w-max px-3 py-1.5 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
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
        <div className="flex items-center gap-6 pb-2">
          <button 
            className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 rounded-full flex items-center justify-center text-white transition-all shadow-[0_8px_20px_rgba(168,85,247,0.3)]"
            onClick={() => {
              if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                togglePlay();
              } else if (album.tracks && album.tracks.length > 0) {
                onPlayTrack(album.tracks[0], album);
              }
            }}
          >
            {isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={() => toggleFavoriteAlbum(album)} className={`group/favbtn transition-colors ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}`}>
            {isEntireAlbumFavorited ? (
              <>
                <Heart className="w-8 h-8 block group-hover/favbtn:hidden" fill="currentColor" />
                <HeartOff className="w-8 h-8 hidden group-hover/favbtn:block" />
              </>
            ) : (
              <Heart className="w-8 h-8" fill="none" />
            )}
          </button>

          <button 
            className="text-white/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (isDownloadingAlbum) {
                setShowCancelConfirm(true);
              } else if (!isEntireAlbumDownloaded) {
                setShowDownloadConfirm(true);
              }
            }}
            disabled={isEntireAlbumDownloaded && !isDownloadingAlbum}
          >
            {isDownloadingAlbum ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
            ) : isEntireAlbumDownloaded ? (
              <CheckCircle className="w-8 h-8 text-[#a855f7]" strokeWidth={2.5} />
            ) : (
              <Download className="w-8 h-8" />
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
              className="text-white/50 hover:text-white transition-colors group relative z-50"
            >
              <MoreHorizontal className="w-8 h-8" />
            </button>
            {showMoreMenu && typeof document !== 'undefined' && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowMoreMenu(false)} />
                <div 
                  style={{ top: moreMenuPos.top, left: moreMenuPos.left - 180 }}
                  className="fixed mt-8 w-[220px] border border-white/10 rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30"
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

      <div className="px-8 relative z-10 flex-1">
        <div className="mt-8">
          {/* Header */}
          <div className="grid grid-cols-[50px_1fr_120px_100px_100px_80px_100px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
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
                  className={`grid grid-cols-[50px_1fr_120px_100px_100px_80px_100px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group ${
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
                  
                  <div className="flex flex-col pr-4">
                    <span className={`font-medium line-clamp-1 flex items-center gap-1.5 ${nowPlayingTrackId === track.id ? 'text-[#a855f7]' : 'text-white'}`}>
                      {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
                      <span className="truncate">{track.title}</span>
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {track.previewUrl.includes('explicit') && (
                        <span className="px-1 py-0.5 rounded-sm bg-white/20 text-[10px] font-bold text-white leading-none">E</span>
                      )}
                      <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-white/50 text-sm flex items-center justify-center">{getPlays(track.id)}</div>
                  
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={(e) => handleDownload(e, track)}
                      className="text-white/40 hover:text-white transition-colors"
                      disabled={isDownloading || downloaded}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                      ) : downloaded ? (
                        <CheckCircle className="w-4 h-4 text-[#a855f7]" strokeWidth={2.5} />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <button 
                      onClick={(e) => handleFavorite(e, track)}
                      className={`group/favbtn transition-colors ${favorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/40 hover:text-white'}`}
                    >
                      {favorited ? (
                        <>
                          <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
                          <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
                        </>
                      ) : (
                        <Heart className="w-4 h-4" fill="none" />
                      )}
                    </button>
                  </div>

                  <div className="text-center text-white/50 text-sm flex items-center justify-center">
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
                      className="text-white/40 hover:text-white transition-colors p-3 -m-3"
                    >
                      <MoreHorizontal className="w-4 h-4" />
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
              <button onClick={() => setShowDownloadConfirm(false)} className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleDownloadAlbum} className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25">Descargar Todo</button>
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
            style={{ top: trackMenuPos.top, left: trackMenuPos.left - 240 }}
            className={`fixed w-[280px] border border-white/10 rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 ${trackMenuPos.isUpward ? '-translate-y-full -mt-2' : 'mt-2'}`}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(album!.tracks!.find(t => t.id === openTrackMenu)!); setOpenTrackMenu(null); }}
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
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
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
            >
              {isDownloaded(openTrackMenu) ? 'Eliminar descarga' : 'Descargar canción'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenTrackMenu(null); }}
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
            >
              Crear lista de reproducción
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenTrackMenu(null); }}
              className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10"
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
              <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Continuar descarga</button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(album.id));
                  setShowCancelConfirm(false);
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
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button 
                onClick={() => {
                  if (album.tracks) {
                    album.tracks.forEach(track => removeDownload(track.id, true));
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: `Álbum '${album.title}' eliminado de Descargas` }));
                  }
                  setShowDeleteConfirm(false);
                }} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
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