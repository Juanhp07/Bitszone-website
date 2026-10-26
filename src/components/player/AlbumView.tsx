import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, CheckCircle, Loader2, AlertCircle, Trash2, X, ListEnd, ListPlus, Pencil, ListX, ListMusic } from 'lucide-react';
import type { Album, Track } from './types';
import { useDownloads } from './DownloadsContext';
import { DownloadProgressPill } from './DownloadProgressPill';
import { motion } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';
import { ListScrollbar } from '../ui/ListScrollbar';
import { PopoverMenu, type PopoverMenuItem } from '../ui/PopoverMenu';
import { TrackMenu } from './TrackMenu';
import { usePlayback } from './PlaybackContext';
import { usePlaylists, isPlaylistAlbum, withAlbumInfo, PLAYLIST_ID_PREFIX } from './PlaylistsContext';

// Desktop tracklist shows this many rows; longer albums scroll inside the list
const VISIBLE_TRACKS = 9;


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
  album: albumProp, 
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
  const { playlists, playlistAsAlbum, createPlaylist, removeFromPlaylist, renamePlaylist, deletePlaylist } = usePlaylists();
  const playback = usePlayback();
  const isPlaylist = isPlaylistAlbum(albumProp);
  const playlistId = isPlaylist ? String(albumProp!.id).slice(PLAYLIST_ID_PREFIX.length) : null;
  const livePlaylist = playlistId ? playlists.find(p => p.id === playlistId) : undefined;
  const album = isPlaylist ? (livePlaylist ? playlistAsAlbum(livePlaylist) : null) : albumProp;
  const [isRenaming, setIsRenaming] = useState(false);
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
  const { containerRef: listRef, springValue: listSpringY, scrollProps: listScrollProps, triggerBounce: listBounce } = useRubberBand({ axis: 'y' });
  const [listMaxHeight, setListMaxHeight] = useState<number | undefined>(undefined);
  const [listEdges, setListEdges] = useState({ top: false, bottom: false });

  // Cap the desktop list at VISIBLE_TRACKS rows so every album page keeps the same layout
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      const rows = inner ? (Array.from(inner.children) as HTMLElement[]) : [];
      if (window.innerWidth < 1024 || rows.length <= VISIBLE_TRACKS) { setListMaxHeight(undefined); return; }
      const first = rows[0].getBoundingClientRect();
      const last = rows[VISIBLE_TRACKS - 1].getBoundingClientRect();
      setListMaxHeight(Math.ceil(last.bottom - first.top) + 8);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [album?.id, album?.tracks?.length, loading, listRef]);

  const updateListEdges = () => {
    const el = listRef.current;
    if (!el) return;
    setListEdges({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 });
  };

  useEffect(updateListEdges, [listMaxHeight]);

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

  // An empty playlist is not 'downloaded'
  const isEntireAlbumDownloaded = !!album.tracks?.length && album.tracks.every(t => isDownloaded(t.id));
  const isEmpty = !album.tracks?.length;
  const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;
  const isAlbumActive = !!nowPlayingTrackId && !!album.tracks?.some(t => t.id === nowPlayingTrackId);
  const isAlbumPlaying = isPlaying && isAlbumActive;

  return (
    <div
      className="h-full flex flex-col relative"
      // Desktop album page fits one screen: keep the page-level bounce for mobile only
      onWheel={(e) => { if (window.innerWidth >= 1024) e.stopPropagation(); }}
    >
      

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
          className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full opacity-80 hover:opacity-100 hover:-translate-x-0.5 transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          style={{ color: `color-mix(in srgb, ${dominantColor} 30%, #e9e6ee)` }}
          title="Volver"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>

      {/* Floating Pill (Sticky/Scrolled State) */}
      <div 
        className="lg:hidden sticky top-24 z-50 mx-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between shadow-2xl overflow-hidden border border-white/10"
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
            title="Volver"
            aria-label="Volver"
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
                playback.playAlbum(album);
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
            className={`${isPlaylist ? 'hidden' : ''} w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7]' : 'text-white/70 hover:text-white'}`}
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/15 hover:bg-red-500/20 text-emerald-400 hover:text-red-400 border border-emerald-500/35 hover:border-red-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer group/cancelbtn"
                  title="Cancelar descarga del álbum"
                  aria-label="Cancelar descarga del álbum"
                >
                  <Loader2 className="w-4 h-4 animate-spin group-hover/cancelbtn:hidden" aria-hidden="true" />
                  <X className="w-4 h-4 hidden group-hover/cancelbtn:block text-red-400" aria-hidden="true" />
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

      {/* Album layout: glass sleeve (left, sticky on desktop) + tracklist (right) */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center w-full max-w-[1680px] mx-auto lg:min-h-[calc(100dvh-170px)] gap-8 lg:gap-10 2xl:gap-20 px-4 md:px-8 lg:px-10 2xl:px-20 pt-16 md:pt-20 lg:pt-6 pb-10">

        {/* Left column */}
        <div className="lg:w-auto shrink-0 flex justify-center">
          <div className="lg:sticky lg:top-8 flex flex-col items-center w-full">

            {/* Glass vinyl sleeve */}
            <div className={`relative w-[min(64vw,260px)] md:w-[300px] lg:w-[min(27vw,500px)] [perspective:1400px] mt-6 lg:mt-10 transition-[margin] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAlbumActive ? 'lg:mr-[min(12vw,220px)]' : ''}`}>
              {/* Vinyl: slides out from behind the sleeve while a track of this album is loaded, spins only while playing */}
              <div
                aria-hidden="true"
                className={`hidden lg:block absolute top-[5%] bottom-[5%] right-[5%] aspect-square transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAlbumActive ? 'translate-x-[48%] opacity-100' : 'translate-x-0 opacity-0'}`}
              >
                <div
                  className="relative w-full h-full rounded-full animate-[spin_6s_linear_infinite] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                  style={{
                    animationPlayState: isAlbumPlaying ? 'running' : 'paused',
                    background: 'radial-gradient(circle, transparent 0 31%, rgba(255,255,255,0.05) 31.5% 32%, transparent 32.5%), repeating-radial-gradient(circle, #0c0c0e 0 2px, #17171a 2.5px 3.5px), #111',
                  }}
                >
                  {/* Light catching the grooves */}
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,0.10)_40deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.07)_220deg,transparent_260deg)]" />
                  {/* Center label with the cover art */}
                  <img src={album.coverUrl} alt="" className="absolute inset-[34%] w-[32%] h-[32%] rounded-full object-cover ring-2 ring-black/60" />
                  <div className="absolute left-1/2 top-1/2 w-[3%] h-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a]" />
                </div>
              </div>
              <div
                className="relative z-10 aspect-square transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d]"
              >
                {/* Shadow tinted with the album color */}
                <div className="absolute inset-4 translate-y-8 rounded-[22px] blur-3xl opacity-70" style={{ background: dominantColor }} aria-hidden="true" />
                <div className="absolute inset-0 rounded-[22px] overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                  {isEmpty && isPlaylist ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/[0.06] backdrop-blur-xl">
                      <ListMusic className="w-16 h-16 text-white/25" aria-hidden="true" />
                    </div>
                  ) : (
                    <img src={album.coverUrl} alt={album.title} data-cover-source="album" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {/* Glass sheen + thickness */}
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.08)_22%,transparent_40%,transparent_70%,rgba(255,255,255,0.10)_100%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none" />
                </div>
              </div>

              {/* Actions — bottom-right of the sleeve */}
              <div className="relative lg:absolute lg:-bottom-4 lg:-right-2 mt-5 lg:mt-0 flex items-center justify-center gap-1 p-1.5 rounded-full bg-black/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] w-max mx-auto lg:mx-0 z-20">
                <button
                  className="w-12 h-12 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 active:scale-95 rounded-full flex items-center justify-center text-white transition-all shadow-[0_6px_14px_rgba(168,85,247,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  onClick={() => {
                    if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                      togglePlay();
                    } else if (album.tracks && album.tracks.length > 0) {
                      playback.playAlbum(album);
                    }
                  }}
                  title={isAlbumPlaying ? "Pausar álbum" : "Reproducir álbum"}
                  aria-label={isAlbumPlaying ? "Pausar álbum" : "Reproducir álbum"}
                >
                  {isAlbumPlaying ? (
                    <Pause className="w-5 h-5" fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" aria-hidden="true" />
                  )}
                </button>
                <button
                  onClick={() => toggleFavoriteAlbum(album)}
                  className={`${isPlaylist ? 'hidden' : ''} group/favbtn w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/60 hover:text-white'}`}
                  title={isEntireAlbumFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
                  aria-label={isEntireAlbumFavorited ? "Quitar álbum de favoritos" : "Añadir álbum a favoritos"}
                >
                  {isEntireAlbumFavorited ? (
                    <>
                      <Heart className="w-5 h-5 block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                      <HeartOff className="w-5 h-5 hidden group-hover/favbtn:block" aria-hidden="true" />
                    </>
                  ) : (
                    <Heart className="w-5 h-5" fill="none" aria-hidden="true" />
                  )}
                </button>
                <button
                  className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  onClick={() => {
                    if (isDownloadingAlbum) {
                      setShowCancelConfirm(true);
                    } else if (!isEntireAlbumDownloaded) {
                      setShowDownloadConfirm(true);
                    }
                  }}
                  disabled={(isEntireAlbumDownloaded && !isDownloadingAlbum) || isEmpty}
                  title={isDownloadingAlbum ? "Descargando álbum..." : isEntireAlbumDownloaded ? "Álbum descargado" : "Descargar álbum"}
                  aria-label={isDownloadingAlbum ? "Descargando álbum..." : isEntireAlbumDownloaded ? "Álbum ya descargado" : "Descargar álbum"}
                >
                  {isDownloadingAlbum ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#a855f7]" aria-hidden="true" />
                  ) : isEntireAlbumDownloaded ? (
                    <CheckCircle className="w-5 h-5 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Download className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
                <div className="relative z-50">
                  <button
                    ref={moreMenuRef}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMoreMenuPos({ top: rect.bottom + 8, left: rect.right - 220 });
                      setShowMoreMenu(!showMoreMenu);
                    }}
                    className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                    title="Más opciones del álbum"
                    aria-label="Más opciones del álbum"
                    aria-expanded={showMoreMenu}
                  >
                    <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <PopoverMenu
                    open={showMoreMenu}
                    anchor={showMoreMenu ? { x: moreMenuPos.left, y: moreMenuPos.top } : null}
                    width={220}
                    onClose={() => setShowMoreMenu(false)}
                    items={[
                      ...(isPlaylist ? [] : [{ label: isEntireAlbumFavorited ? 'Eliminar de favoritos' : 'Agregar a favoritos', icon: <Heart className="w-4 h-4" fill={isEntireAlbumFavorited ? 'currentColor' : 'none'} />, onSelect: () => toggleFavoriteAlbum(album) }]),
                      ...(isEmpty ? [] : [{
                        label: isEntireAlbumDownloaded ? 'Eliminar descarga' : 'Descargar álbum',
                        icon: isEntireAlbumDownloaded ? <CheckCircle className="w-4 h-4" strokeWidth={2.5} /> : <Download className="w-4 h-4" />,
                        onSelect: () => (isEntireAlbumDownloaded ? setShowDeleteConfirm(true) : setShowDownloadConfirm(true)),
                      }]),
                      ...(isEmpty ? [] : [{ label: 'Añadir a la cola', icon: <ListEnd className="w-4 h-4" />, onSelect: () => album.tracks?.forEach(t => playback.addToQueue(t, album)) }]),
                      ...(isPlaylist ? [
                        { label: 'Cambiar nombre', icon: <Pencil className="w-4 h-4" />, onSelect: () => setIsRenaming(true) },
                        { label: 'Eliminar lista', icon: <Trash2 className="w-4 h-4" />, danger: true, onSelect: () => { deletePlaylist(playlistId!); onViewChange('library-playlists'); } },
                      ] : [
                        { label: 'Guardar como lista nueva', icon: <ListPlus className="w-4 h-4" />, onSelect: () => createPlaylist((album.tracks ?? []).map(t => withAlbumInfo(t, album)), album.title) },
                      ]),
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Title + meta */}
            <div className="flex flex-col items-center text-center mt-6 lg:mt-14 w-full lg:w-[min(31vw,580px)] min-w-0">
              <span className="text-white/60 text-xs font-semibold tracking-[0.25em] uppercase">{isPlaylist ? 'Lista de reproducción' : 'Álbum'}</span>
              {isPlaylist && isRenaming ? (
                <input
                  autoFocus
                  defaultValue={album.title}
                  aria-label="Nombre de la lista"
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={(e) => { renamePlaylist(playlistId!, e.currentTarget.value); setIsRenaming(false); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') { e.stopPropagation(); setIsRenaming(false); }
                  }}
                  className="mt-2 w-full text-center bg-white/5 border border-white/15 rounded-xl px-3 py-1 font-inter font-bold text-white text-4xl md:text-5xl xl:text-6xl leading-[1.1] tracking-tight outline-none focus:border-purple-400/60"
                />
              ) : (
                <h1
                  onDoubleClick={() => isPlaylist && setIsRenaming(true)}
                  title={isPlaylist ? 'Doble clic para cambiar el nombre' : undefined}
                  className="mt-2 font-inter font-bold text-white text-4xl md:text-5xl xl:text-6xl leading-[1.1] tracking-tight [overflow-wrap:anywhere] pb-1"
                >
                  {album.title}
                </h1>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-3 text-sm md:text-base xl:text-lg text-white/70 font-medium [&>span]:whitespace-nowrap">
                <span className="text-white font-semibold uppercase tracking-wide">{album.artist}</span>
                <span aria-hidden="true">•</span>
                <span>{album.year}</span>
                <span aria-hidden="true">•</span>
                <span>{album.trackCount} {album.trackCount === 1 ? "canción" : "canciones"}</span>
                {album.totalDuration ? (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="text-white/50">
                      {Math.floor(album.totalDuration / 3600000) > 0
                        ? `${Math.floor(album.totalDuration / 3600000)} h ${Math.floor((album.totalDuration % 3600000) / 60000)} min`
                        : `${Math.floor(album.totalDuration / 60000)} min ${Math.floor((album.totalDuration % 60000) / 1000)} s`}
                    </span>
                  </>
                ) : null}
              </div>
              {(() => {
                const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
                const totalCount = album.tracks?.length || 0;
                if (isDownloadingAlbum) {
                  return (
                    <DownloadProgressPill
                      size="md"
                      downloadedCount={downloadedCount}
                      totalCount={totalCount}
                      onCancel={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
                    />
                  );
                }
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
        </div>

        {/* Right column: tracklist */}
        <div className="group/list relative flex-1 min-w-0 lg:max-w-[780px]">
          {listMaxHeight && <ListScrollbar containerRef={listRef} onBounce={listBounce} springY={listSpringY} className="-right-5 top-2 bottom-2" />}
          <div
            ref={listRef}
            {...listScrollProps}
            onScroll={() => { listScrollProps.onScroll(); updateListEdges(); setOpenTrackMenu(null); }}
            onWheel={(e) => {
              listScrollProps.onWheel(e);
              // Keep the page still while the list itself scrolls
              if (listMaxHeight) e.stopPropagation();
            }}
            className={`relative ${listMaxHeight ? 'overflow-y-auto overscroll-contain scrollbar-hide -mx-2 px-2' : ''}`}
            style={{
              maxHeight: listMaxHeight,
              scrollbarWidth: 'none',
              // iOS picker-like fade on the edges that still have content
              maskImage: listMaxHeight ? `linear-gradient(to bottom, ${listEdges.top ? 'transparent 0, black 48px' : 'black 0'}, ${listEdges.bottom ? 'black calc(100% - 48px), transparent 100%' : 'black 100%'})` : undefined,
              WebkitMaskImage: listMaxHeight ? `linear-gradient(to bottom, ${listEdges.top ? 'transparent 0, black 48px' : 'black 0'}, ${listEdges.bottom ? 'black calc(100% - 48px), transparent 100%' : 'black 100%'})` : undefined,
            }}
          >
          <motion.div style={{ y: listSpringY, '--album-tint': dominantColor } as any} className="flex flex-col gap-1">
            {isEmpty && (
              <div className="py-16 text-center lg:text-left flex flex-col gap-2">
                <p className="text-white/80 font-semibold text-lg">Esta lista está vacía</p>
                <p className="text-white/45 text-sm">Usa ⋯ o clic derecho en cualquier canción y elige "Guardar en lista de reproducción".</p>
              </div>
            )}
            {album.tracks?.map((track, index) => {
              const isPlayingTrack = nowPlayingTrackId === track.id;
              const isHovered = hoveredTrack === track.id;
              const downloaded = isDownloaded(track.id);
              const isDownloading = downloadingIds.includes(track.id);
              const favorited = isFavorite(track.id);
              const menuOpen = openTrackMenu === track.id;

              return (
                <div
                  key={track.id}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onClick={() => (isPlaylist ? playback.playAlbum(album, track) : onPlayTrack(track, album))}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setTrackMenuPos({ top: e.clientY, left: e.clientX, isUpward: false });
                    setOpenTrackMenu(track.id);
                  }}
                  className={`group/row relative overflow-hidden grid grid-cols-[28px_minmax(0,1fr)_auto] lg:grid-cols-[44px_minmax(0,1fr)_auto] gap-2 lg:gap-4 px-2 lg:px-5 py-2.5 lg:py-3.5 xl:py-4 items-center rounded-xl cursor-pointer transition-colors ${
                    isPlayingTrack ? 'bg-[color-mix(in_srgb,var(--album-tint)_30%,rgba(255,255,255,0.06))] backdrop-blur-2xl ring-1 ring-white/10' : 'hover:bg-[color-mix(in_srgb,var(--album-tint)_22%,rgba(255,255,255,0.05))] hover:backdrop-blur-2xl'
                  }`}
                >
                  <div className="relative text-white/50 font-medium flex items-center justify-center tabular-nums">
                    {isPlayingTrack ? (
                      <div className="flex items-end justify-center gap-[2.5px] h-4 w-4">
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-2 animate-[bounce_1s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-4 animate-[bounce_1.2s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-3 animate-[bounce_0.8s_infinite]' : 'h-[4px]'}`}></div>
                        <div className={`w-[3px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[10px] animate-[bounce_1.1s_infinite]' : 'h-[4px]'}`}></div>
                      </div>
                    ) : isHovered ? (
                      <Play className="w-4 h-4 text-white" fill="currentColor" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="relative flex flex-col min-w-0">
                    <span className={`text-[15px] lg:text-base xl:text-[17px] font-medium flex items-center gap-1.5 min-w-0 ${isPlayingTrack ? 'text-[#a855f7]' : 'text-white'}`}>
                      {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
                      <span className="truncate">{track.title}</span>
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                      {track.previewUrl.includes('explicit') && (
                        <span className="px-1 py-0.5 rounded-sm bg-white/20 text-[10px] font-bold text-white leading-none">E</span>
                      )}
                      <span className="text-white/50 text-[13px] lg:text-sm truncate group-hover/row:text-white/80 transition-colors">{track.artist}</span>
                    </div>
                  </div>

                  {/* Right side: actions revealed on hover (always visible on touch) */}
                  <div className="relative flex items-center gap-1 lg:gap-3">
                    <div
                      className={`flex items-center gap-1 lg:gap-3 lg:absolute lg:right-full lg:mr-1 lg:top-1/2 lg:-translate-y-1/2 transition-[opacity,clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:none)]:opacity-100 ${
                        isHovered || menuOpen ? 'opacity-100 lg:[clip-path:inset(0_0_0_0)]' : 'opacity-0 lg:[clip-path:inset(0_100%_0_0)] pointer-events-none [@media(hover:none)]:pointer-events-auto'
                      }`}
                    >
                      <button
                        onClick={(e) => handleDownload(e, track)}
                        className="hidden lg:flex text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
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
                      <button
                        onClick={(e) => handleFavorite(e, track)}
                        className={`group/favbtn w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${favorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}`}
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

                    {/* Resting state indicators (hidden while actions show) */}
                    <div className={`hidden lg:flex items-center gap-2 transition-opacity duration-200 ${isHovered || menuOpen ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
                      {downloaded && <CheckCircle className="w-3.5 h-3.5 text-[#a855f7]/80" strokeWidth={2.5} />}
                      {favorited && <Heart className="w-3.5 h-3.5 text-[#a855f7]/80" fill="currentColor" />}
                    </div>

                    <span className="hidden lg:block w-12 text-right text-white/50 text-sm tabular-nums">
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTrackMenuPos({ top: rect.bottom + 6, left: rect.right - 270, isUpward: false });
                        setOpenTrackMenu(openTrackMenu === track.id ? null : track.id);
                      }}
                      className={`w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center text-white/50 hover:text-white transition-[opacity,color] duration-300 p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:opacity-100 cursor-pointer [@media(hover:none)]:opacity-100 ${isHovered || menuOpen ? 'opacity-100' : 'lg:opacity-0'}`}
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
          </motion.div>
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
      
      {(() => {
        const menuTrack = openTrackMenu !== null ? album.tracks?.find(t => t.id === openTrackMenu) ?? null : null;
        return (
          <TrackMenu
            track={menuTrack}
            album={album}
            hideGoToAlbum={!isPlaylist}
            anchor={menuTrack ? { x: trackMenuPos.left, y: trackMenuPos.top } : null}
            onClose={() => setOpenTrackMenu(null)}
            leadingItems={menuTrack ? [
              { label: isFavorite(menuTrack.id) ? 'Eliminar de favoritos' : 'Agregar a favoritos', icon: <Heart className="w-4 h-4" fill={isFavorite(menuTrack.id) ? 'currentColor' : 'none'} />, onSelect: () => toggleFavorite(menuTrack, album) },
              {
                label: isDownloaded(menuTrack.id) ? 'Eliminar descarga' : 'Descargar canción',
                icon: isDownloaded(menuTrack.id) ? <Trash2 className="w-4 h-4" /> : <Download className="w-4 h-4" />,
                onSelect: () => (isDownloaded(menuTrack.id) ? removeDownload(menuTrack.id) : downloadTrack(menuTrack, album)),
              },
            ] : []}
            trailingItems={menuTrack && isPlaylist ? [
              { label: 'Quitar de esta lista', icon: <ListX className="w-4 h-4" />, danger: true, onSelect: () => removeFromPlaylist(playlistId!, menuTrack.id) },
            ] : []}
          />
        );
      })()}

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