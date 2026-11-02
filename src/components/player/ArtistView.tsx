import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';
import { createPortal } from 'react-dom';
import { ArrowLeft, Play, Download, CheckCircle, Loader2, Heart, HeartOff, AlertCircle, X } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import { usePlayback } from './PlaybackContext';
import type { Album } from './types';
import { cardStyle, titleStyle } from '../auth/authUi';
import { useAdminEdit } from '../admin/AdminEditContext';
import { AdminPencil } from '../admin/AdminEditWidgets';

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

export const ArtistView = ({ 
  artist: rawArtist, 
  albums: rawAlbums, 
  onBack,
  onSelectAlbum 
}: { 
  artist: { name: string, img: string, type?: string }, 
  albums: Album[],
  onBack: () => void,
  onSelectAlbum: (album: Album) => void 
}) => {
  const { applyArtistOverrides, applyAlbumOverrides } = useAdminEdit();
  const artist = applyArtistOverrides(rawArtist);
  const albums = rawAlbums.map(applyAlbumOverrides);
  const { isDownloaded, isFavorite, toggleFavoriteAlbum, cancelAlbumDownload, downloadingAlbums, downloadAlbum } = useDownloads();
  const playback = usePlayback();
  const [scrollY, setScrollY] = useState(0);
  const { containerRef: discographyRef, springValue: discographySpringY, scrollProps: discographyScrollProps } = useRubberBand({ axis: 'y' });
  const dominantColor = useAverageColor(artist?.img || '');

  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<Album | null>(null);
  const [completedFlashIds, setCompletedFlashIds] = useState<Record<string, number>>({});

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const handleScroll = () => setScrollY(container.scrollTop);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleCompleted = (e: any) => {
      const id = String(e.detail?.albumId);
      if (!id) return;
      const flashTimestamp = Date.now();
      setCompletedFlashIds(curr => ({ ...curr, [id]: flashTimestamp }));
      setTimeout(() => {
        setCompletedFlashIds(curr => {
          if (curr[id] === flashTimestamp) {
            const next = { ...curr };
            delete next[id];
            return next;
          }
          return curr;
        });
      }, 2000);
    };
    window.addEventListener('bz-album-download-completed', handleCompleted);
    return () => window.removeEventListener('bz-album-download-completed', handleCompleted);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloadConfirm(null);
        setShowCancelConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
  const totalTracks = artistAlbums.reduce((acc, a) => acc + (a.tracks?.length || a.trackCount || 0), 0);

  return (
    <div
      className="flex-1 w-full min-h-full flex flex-col justify-center relative"
      onWheel={(e) => { if (window.innerWidth >= 1024) e.stopPropagation(); }}
    >
      {/* Botón Atrás estilo circular Liquid Glass con expansión suave a texto en hover */}
      <div
        className="absolute top-6 left-6 md:top-8 md:left-8 z-40 transition-opacity duration-300"
        style={{
          opacity: scrollY > 150 ? 0 : 1,
          pointerEvents: scrollY > 150 ? 'none' : 'auto'
        }}
      >
        <button
          onClick={onBack}
          className="group flex items-center h-10 md:h-11 w-10 md:w-11 hover:w-[94px] md:hover:w-[102px] rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-2xl border border-white/20 hover:border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white/90 hover:text-white transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden select-none max-md:!w-10"
          aria-label="Volver al catálogo"
        >
          <div className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.2} aria-hidden="true" />
          </div>
          <span className="opacity-0 group-hover:opacity-100 max-md:hidden transition-opacity duration-200 delay-75 text-sm font-medium tracking-wide pr-3 whitespace-nowrap">
            Atrás
          </span>
        </button>
      </div>

      {/* Estructura general idéntica a AlbumView: centrado vertical, foto circular a la izquierda y álbumes a la derecha */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center w-full max-w-[1680px] mx-auto gap-8 lg:gap-12 xl:gap-16 2xl:gap-24 px-4 md:px-8 lg:px-10 2xl:px-20 py-8 lg:py-0 my-auto">

        {/* Columna Izquierda: Foto circular grande del artista con halo ambiental y datos */}
        <div className="lg:w-auto shrink-0 flex justify-center">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-[min(58vw,230px)] md:w-[270px] lg:w-[clamp(190px,min(24vw,calc(100dvh-420px)),360px)] mt-4 lg:mt-0">
              {/* Resplandor ambiental de color dominante detrás de la foto circular */}
              <div
                className="absolute inset-4 translate-y-6 rounded-full blur-3xl opacity-70 pointer-events-none"
                style={{ background: dominantColor }}
                aria-hidden="true"
              />

              {/* Foto circular del artista */}
              <div className="relative z-10 aspect-square rounded-full overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)] group">
                <img src={artist.img} alt={artist.name} className="w-full h-full object-cover" />
                {/* Reflejos sutiles estilo cristal líquido */}
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.08)_25%,transparent_45%,transparent_70%,rgba(255,255,255,0.10)_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none" />
                <AdminPencil
                  target={{ type: 'artist', artist }}
                  className="bottom-3 right-3 shadow-2xl"
                />
              </div>
            </div>

            {/* Título y metadatos del artista */}
            <div className="flex flex-col items-center text-center mt-5 lg:mt-6 w-full lg:w-[min(31vw,460px)] min-w-0">
              <span className="text-white/60 text-xs font-semibold tracking-[0.25em] uppercase">
                {artist.type || 'Artista'}
              </span>
              <h1 className="mt-2 font-inter font-bold text-white text-3xl md:text-4xl lg:text-[clamp(1.75rem,5dvh,3.25rem)] leading-[1.1] tracking-tight [overflow-wrap:anywhere] pb-1">
                {artist.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-3 text-sm md:text-base text-white/70 font-medium [&>span]:whitespace-nowrap">
                <span>{artistAlbums.length} {artistAlbums.length === 1 ? 'álbum' : 'álbumes'}</span>
                <span aria-hidden="true">•</span>
                <span>{totalTracks} {totalTracks === 1 ? 'canción' : 'canciones'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Álbumes del artista en columnas de dos */}
        <div className="flex-1 min-w-0 lg:max-w-[760px] 2xl:max-w-[840px] w-full flex flex-col">
          <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Discografía</h2>
            <span className="text-xs md:text-sm text-white/50 font-medium">
              {artistAlbums.length} {artistAlbums.length === 1 ? 'lanzamiento' : 'lanzamientos'}
            </span>
          </div>

          {artistAlbums.length === 0 ? (
            <div className="py-16 text-center lg:text-left text-white/50">
              No hay álbumes disponibles para este artista en la biblioteca.
            </div>
          ) : (
            <div 
              ref={discographyRef} 
              {...discographyScrollProps} 
              className="relative max-h-[clamp(340px,min(75vh,calc(100dvh-220px)),660px)] overflow-y-auto overscroll-contain scrollbar-hide -mx-2 px-2 py-1"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <motion.div 
                style={{ y: discographySpringY }}
                className="grid grid-cols-2 gap-4 md:gap-5 pb-4"
              >
                {artistAlbums.map((album) => {
                  const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
                  const totalCount = album.tracks?.length || 0;
                  const isComplete = totalCount > 0 && downloadedCount === totalCount;
                  const isPartial = downloadedCount > 0 && downloadedCount < totalCount;
                  const isDownloading = downloadingAlbums?.includes(String(album.id));
                  const isJustCompleted = Boolean(completedFlashIds[String(album.id)]);
                  const safeSvgId = 'artist_card_' + String(album.id).replace(/[^a-zA-Z0-9_-]/g, '_');

                  return (
                    <div 
                      key={album.id}
                      onClick={() => onSelectAlbum(album)}
                      className="group/card cursor-pointer flex flex-col gap-2.5 min-w-0"
                    >
                      {/* Portada del álbum con animación hover, serpiente de descarga y botón liquid glass play */}
                      <div className="relative w-full aspect-square">
                        <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-xl bg-white/5 transition-all duration-500">
                          <img 
                            src={album.coverUrl} 
                            alt={album.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" 
                          />
                          <AdminPencil
                            target={{ type: 'album', album }}
                            className="top-2 right-2"
                          />

                          {/* Botón de reproducción blanco Liquid Glass y blur */}
                          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <button 
                              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xl md:backdrop-blur-2xl border border-white/20 hover:border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (album.tracks && album.tracks.length > 0) {
                                  playback.playAlbum(album);
                                }
                              }}
                              title={`Reproducir ${album.title}`}
                              aria-label={`Reproducir álbum ${album.title}`}
                            >
                              <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 text-white/90 fill-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {/* Borde animado efecto serpiente en el contorno durante la descarga */}
                        {isDownloading && (
                          <svg className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`snake-grad-${safeSvgId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                                <stop offset="15%" stopColor="#f0abfc" stopOpacity="1" />
                                <stop offset="40%" stopColor="#d946ef" stopOpacity="0.95" />
                                <stop offset="75%" stopColor="#9333ea" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                              </linearGradient>
                              <filter id={`snake-glow-${safeSvgId}`} x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.65" result="shadow" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="glow" />
                                <feMerge>
                                  <feMergeNode in="shadow" />
                                  <feMergeNode in="glow" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            <rect
                              x="0.75"
                              y="0.75"
                              width="98.5"
                              height="98.5"
                              rx="6.5"
                              fill="none"
                              stroke="rgba(0, 0, 0, 0.35)"
                              strokeWidth="2.5"
                              vectorEffect="non-scaling-stroke"
                            />
                            <rect
                              x="0.75"
                              y="0.75"
                              width="98.5"
                              height="98.5"
                              rx="6.5"
                              fill="none"
                              stroke="rgba(192, 132, 252, 0.3)"
                              strokeWidth="1.5"
                              vectorEffect="non-scaling-stroke"
                            />
                            <motion.rect
                              x="0.75"
                              y="0.75"
                              width="98.5"
                              height="98.5"
                              rx="6.5"
                              fill="none"
                              stroke={`url(#snake-grad-${safeSvgId})`}
                              strokeWidth="2.75"
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                              strokeDasharray="90 300"
                              animate={{ strokeDashoffset: [0, -390] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                              filter={`url(#snake-glow-${safeSvgId})`}
                            />
                          </svg>
                        )}

                        {/* Destello de iluminación al terminar la descarga */}
                        <AnimatePresence>
                          {isJustCompleted && (
                            <motion.div
                              key={`destello-${safeSvgId}`}
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0],
                                boxShadow: [
                                  "0 0 0px rgba(192,132,252,0)",
                                  "0 0 18px rgba(192,132,252,0.85), 0 0 6px rgba(255,255,255,0.9)",
                                  "0 0 18px rgba(192,132,252,0.85), 0 0 6px rgba(255,255,255,0.9)",
                                  "0 0 0px rgba(192,132,252,0)"
                                ]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.8, times: [0, 0.15, 0.65, 1], ease: "easeOut" }}
                              className="absolute -inset-[1px] rounded-[17px] pointer-events-none z-30 border-2 border-white"
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Información del álbum y controles integrados */}
                      <div className="flex flex-col mt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1 group-hover/card:text-purple-300 transition-colors">
                              {album.title}
                            </h3>
                            <span className="text-white/50 text-xs md:text-sm mt-0.5 truncate">
                              {album.year ? `${album.year} • ` : ''}{album.tracks?.length || album.trackCount || 0} canciones
                            </span>
                          </div>

                          {/* Iconos de descarga y favorito al costado */}
                          <div className="flex items-center gap-0.5 md:gap-1 shrink-0 -mr-1 -mt-0.5">
                            {album.tracks && album.tracks.length > 0 && (
                              isDownloading ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                                  className="group/cancel p-1.5 md:p-1 rounded-full transition-all hover:scale-110 text-[#a855f7] hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                                  title={`Descargando canciones (${downloadedCount}/${totalCount}) - Clic para cancelar`}
                                  aria-label={`Descargando canciones (${downloadedCount} de ${totalCount}). Clic para cancelar`}
                                >
                                  <Loader2 className="w-4 h-4 animate-spin group-hover/cancel:hidden" aria-hidden="true" />
                                  <X className="w-4 h-4 hidden group-hover/cancel:block text-red-400" aria-hidden="true" />
                                </button>
                              ) : isComplete ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className="p-1.5 md:p-1 text-[#a855f7] flex items-center justify-center cursor-default focus-visible:outline-none"
                                  title="Álbum descargado"
                                  aria-label="Álbum descargado"
                                >
                                  <CheckCircle className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => handleDownloadAlbumClick(e, album)}
                                  className={`p-1.5 md:p-1 rounded-full transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
                                    isPartial ? 'text-[#a855f7]/80 hover:text-[#a855f7]' : 'text-white/30 hover:text-white'
                                  }`}
                                  title={isPartial ? `Descarga parcial (${downloadedCount}/${totalCount}) - Continuar descarga` : `Descargar ${album.title}`}
                                  aria-label={isPartial ? `Descarga parcial (${downloadedCount} de ${totalCount})` : `Descargar ${album.title}`}
                                >
                                  <Download className="w-4 h-4" aria-hidden="true" />
                                </button>
                              )
                            )}

                            {(() => {
                              const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;
                              return (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum(album); }}
                                  className={`group/favbtn p-1.5 md:p-1 rounded-full transition-colors hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}`}
                                  title={isEntireAlbumFavorited ? "Quitar álbum de favoritos" : "Añadir álbum a favoritos"}
                                  aria-label={isEntireAlbumFavorited ? `Quitar ${album.title} de favoritos` : `Añadir ${album.title} a favoritos`}
                                >
                                  {isEntireAlbumFavorited ? (
                                    <>
                                      <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                                      <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" aria-hidden="true" />
                                    </>
                                  ) : (
                                    <Heart className="w-4 h-4" fill="none" aria-hidden="true" />
                                  )}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación para descargar álbum - Estilo Liquid Glass */}
      {/* Modal de confirmación para descargar álbum - Estilo Liquid Glass */}
      {showDownloadConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4" onClick={() => setShowDownloadConfirm(null)}>
          <div className="relative rounded-3xl p-8 sm:p-9 max-w-md w-full shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg">
                <Download className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>¿Descargar Álbum?</h3>
            </div>
            <p className="text-white/80 mb-7 text-base leading-relaxed relative z-10">
              ¿Descargar todas las canciones de <span className="text-white font-medium">{showDownloadConfirm.title}</span>?
            </p>
            <div className="flex gap-3 justify-end relative z-10">
              <button 
                type="button"
                onClick={() => setShowDownloadConfirm(null)} 
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                title="Cancelar y cerrar diálogo"
                aria-label="Cancelar descarga"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={executeDownloadAlbum} 
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                title="Confirmar descarga del álbum"
                aria-label="Confirmar descarga del álbum"
              >
                Descargar Todo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmación para cancelar descarga */}
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4" onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(null); }}>
          <div className="relative rounded-3xl p-8 sm:p-9 max-w-md w-full shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg">
                <AlertCircle className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/80 mb-7 text-base leading-relaxed relative z-10">
              Se detendrá la descarga de <span className="text-white font-medium">{showCancelConfirm.title}</span>. Se mantendrán las canciones ya descargadas.
            </p>
            <div className="flex justify-end gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => setShowCancelConfirm(null)} 
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                title="Continuar con la descarga en curso"
                aria-label="Continuar descarga"
              >
                Continuar
              </button>
              <button 
                type="button"
                onClick={() => {
                  cancelAlbumDownload(String(showCancelConfirm.id));
                  setShowCancelConfirm(null);
                }} 
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
                title="Confirmar cancelación de descarga"
                aria-label="Confirmar cancelación de descarga"
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