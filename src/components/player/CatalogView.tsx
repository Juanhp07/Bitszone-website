import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { DownloadCloud } from 'lucide-react';
import { Play, Pause, Download, Check, CheckCircle, Loader2, ChevronLeft, Heart, AlertCircle, HeartOff, X } from 'lucide-react';
import type { Album, Track } from './types';
import { useDownloads } from './DownloadsContext';
import { usePlayback } from './PlaybackContext';
import { ScrollableList } from '../ui/ScrollableList';
import { DownloadProgressPill } from './DownloadProgressPill';

export const CatalogView = ({ 
  albums,
  loading,
  isInitialEntrance = false,
  onSelectAlbum,
  onPlayTrack,
  onSelectArtist
}: { 
  albums: Album[],
  loading: boolean,
  isInitialEntrance?: boolean,
  onSelectAlbum: (album: Album) => void,
  onPlayTrack: (t: Track, a: Album) => void,
  onSelectArtist?: (artist: {name: string, img: string, type?: string}) => void
}) => {
  const [hoveredAlbum, setHoveredAlbum] = useState<string | number | null>(null);
  const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum, cancelAlbumDownload, downloadingAlbums, downloadAlbum } = useDownloads();
  const playback = usePlayback();
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
    const [expandedSection, setExpandedSection] = useState<'canciones' | 'artistas' | 'destacados' | null>(null);

  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation();
    setShowDownloadConfirm(album);
  };

  const knownArtistImages: Record<string, string> = {
    'Michael Jackson': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg/500px-Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg',
    'LINKIN PARK': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg',
    'Post Malone': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Post_Malone_July_2021_%28cropped%29.jpg/500px-Post_Malone_July_2021_%28cropped%29.jpg',
    'Post Malone & Swae Lee': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Post_Malone_July_2021_%28cropped%29.jpg/500px-Post_Malone_July_2021_%28cropped%29.jpg',
    '5 Seconds of Summer': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/5sos-NZ4A4323.jpg/500px-5sos-NZ4A4323.jpg',
    'Adolescent\'s Orquesta': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/PORFI_Y_SUS_ADOLECENTES.png/500px-PORFI_Y_SUS_ADOLECENTES.png',
    'Phil Collins': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Phil_Collins%2C_2025_for_%22Eras%22_%28cropped%29.jpg/500px-Phil_Collins%2C_2025_for_%22Eras%22_%28cropped%29.jpg',
    'Incubus': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Incubus.jpg/500px-Incubus.jpg',
    'Radiohead': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/RadioheadO2211125_composite.jpg/500px-RadioheadO2211125_composite.jpg',
    'Travis Scott': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg/500px-Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg',
    'Whitesnake': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Whitesnake_1984_Promo_2.jpg/500px-Whitesnake_1984_Promo_2.jpg',
    'Bruno Mars': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg/500px-BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg',
    'Justin Bieber': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Justin_Bieber_20161111_009-2_%28cropped%29.jpg/500px-Justin_Bieber_20161111_009-2_%28cropped%29.jpg'
  };

  const artistsMap = new Map();
  albums.forEach(album => {
    if (!artistsMap.has(album.artist)) {
      artistsMap.set(album.artist, {
        name: album.artist,
        img: knownArtistImages[album.artist] || album.coverUrl,
        type: album.artist.includes('Combo') || album.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista'
      });
    }
  });
  const dynamicArtists = Array.from(artistsMap.values());

  const renderList = (items: any[], isExpanded: boolean, renderItem: (item: any, i: number) => React.ReactNode, chevronTop?: number) => {
    if (isExpanded) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 md:gap-6 pb-8">
          {items.map(renderItem)}
        </div>
      );
    }
    return (
      <ScrollableList chevronTop={chevronTop}>
        {items.map(renderItem)}
      </ScrollableList>
    );
  };

  const renderSkeletonCards = () => (
    <div className="flex gap-6 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-64 shrink-0 flex flex-col gap-3 animate-pulse">
          <div className="w-64 h-64 rounded-2xl bg-white/[0.04] border border-white/5 relative overflow-hidden" />
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-4 w-3/4 rounded-md bg-white/[0.06]" />
            <div className="h-3 w-1/2 rounded-md bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeletonArtists = () => (
    <div className="flex gap-6 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-56 shrink-0 flex flex-col items-center gap-4 animate-pulse">
          <div className="w-56 h-56 rounded-full bg-white/[0.04] border border-white/5 relative overflow-hidden" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-3.5 w-28 rounded-md bg-white/[0.06]" />
            <div className="h-3 w-20 rounded-md bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );

  const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    await downloadAlbum(album);
  };

  const renderAlbumCard = (album: Album, showTrackTitle: boolean = false) => {
    const downloadedCount = album.tracks?.filter(t => isDownloaded(t.id)).length || 0;
    const totalCount = album.tracks?.length || 0;
    const isComplete = downloadedCount > 0 && downloadedCount === totalCount;
    const isPartial = downloadedCount > 0 && downloadedCount < totalCount;

    return (
    <div 
      key={album.id}
      className={`${expandedSection ? 'w-full' : 'w-[48vw] max-w-[210px] sm:w-56 md:w-64 md:max-w-none'} shrink-0 snap-start flex flex-col gap-2 md:gap-3 group cursor-pointer`}
      onClick={() => onSelectAlbum(album)}
    >
      <div className={`${expandedSection ? 'w-full aspect-square' : 'w-full aspect-square md:w-64 md:h-64'} rounded-2xl overflow-hidden relative shadow-xl transition-all duration-500`}>
        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {downloadingAlbums?.includes(String(album.id)) && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
            className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 border border-emerald-500/35 hover:border-red-500/40 backdrop-blur-md flex items-center justify-center transition-all z-20 group/cancel shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
            title={`Cancelar descarga de ${album.title}`}
            aria-label={`Cancelar descarga de ${album.title}`}
          >
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400 group-hover/cancel:hidden" aria-hidden="true" />
            <X className="w-5 h-5 hidden group-hover/cancel:block text-red-400" aria-hidden="true" />
          </button>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (album.tracks && album.tracks.length > 0) {
                if (showTrackTitle) onPlayTrack(album.tracks[0], album); else playback.playAlbum(album);
              }
            }}
            title={`Reproducir ${album.title}`}
            aria-label={`Reproducir álbum ${album.title}`}
          >
            <Play className="w-6 h-6 ml-1" fill="currentColor" aria-hidden="true" />
          </button>
        </div>
        {album.tracks && album.tracks.length > 0 && (
          <button 
            onClick={(e) => handleDownloadAlbumClick(e, album)}
            aria-label={album.tracks.every(t => isDownloaded(t.id)) ? `Álbum ${album.title} ya descargado` : `Descargar álbum ${album.title}`}
            title={album.tracks.every(t => isDownloaded(t.id)) ? "Álbum ya descargado" : `Descargar ${album.title}`}
            className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 z-10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            disabled={album.tracks.every(t => isDownloaded(t.id)) || downloadingAlbums?.includes(String(album.id))}
          >
            {downloadingAlbums?.includes(String(album.id)) ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" aria-hidden="true" />
            ) : album.tracks.every(t => isDownloaded(t.id)) ? (
              <CheckCircle className="w-4 h-4 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Download className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <div className="flex flex-col mt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-white font-semibold text-sm md:text-[15px] line-clamp-1">{showTrackTitle && album.tracks && album.tracks.length > 0 ? album.tracks[0].title : album.title}</h3>
            <span className="text-white/50 text-xs md:text-[13px] mt-0.5 truncate">{album.artist}</span>
          </div>
          {(() => {
            const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;
            return (
              <button 
                 onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum(album); }}
                 className={`group/favbtn shrink-0 p-2 -m-1.5 md:p-1 md:-mt-0.5 md:-mr-1 md:m-0 rounded-full transition-colors hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}`}
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
        {downloadingAlbums?.includes(String(album.id)) ? (
          <DownloadProgressPill 
            downloadedCount={downloadedCount}
            totalCount={totalCount}
            onCancel={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
          />
        ) : (isComplete || isPartial) ? (
          <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
            <span className="text-[#c084fc] text-[9px] font-bold tracking-wider uppercase">
              {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
  };

  const getSectionSpring = (delay: number) => isInitialEntrance ? {
    y: { type: "spring" as const, stiffness: 110, damping: 11, mass: 0.85, delay },
    scale: { type: "spring" as const, stiffness: 110, damping: 12, mass: 0.85, delay },
    opacity: { duration: 0.45, ease: "easeOut" as const, delay }
  } : { duration: 0 };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pt-1.5 md:pt-2.5 pb-5 md:pb-6">
      {(!expandedSection || expandedSection === 'canciones') && (
      <motion.section 
        initial={isInitialEntrance ? { y: 100, opacity: 0, scale: 0.92 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={getSectionSpring(0.08)}
        className="px-4 md:px-8"
      >
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {expandedSection && (
              <button 
                onClick={() => setExpandedSection(null)} 
                className="p-2 -ml-2 md:ml-0 hover:bg-white/10 rounded-full transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Volver a la vista principal"
                aria-label="Volver a la vista principal"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">Canciones del momento</h2>
          </div>
          {!expandedSection && (
            <button 
              onClick={() => setExpandedSection('canciones')} 
              className="shrink-0 whitespace-nowrap py-2 md:py-0 text-[13px] md:text-sm font-medium text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg px-2 cursor-pointer"
              title="Mostrar todas las canciones del momento"
              aria-label="Mostrar todas las canciones del momento"
            >
              Mostrar todo
            </button>
          )}
        </div>
        {loading ? renderSkeletonCards() : renderList(albums, expandedSection === 'canciones', (album) => renderAlbumCard(album, true), 128)}
      </motion.section>
      )}

      {(!expandedSection || expandedSection === 'artistas') && (
      <motion.section 
        initial={isInitialEntrance ? { y: 100, opacity: 0, scale: 0.92 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={getSectionSpring(0.22)}
        className="px-4 md:px-8"
      >
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {expandedSection && (
              <button 
                onClick={() => setExpandedSection(null)} 
                className="p-2 -ml-2 md:ml-0 hover:bg-white/10 rounded-full transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Volver a la vista principal"
                aria-label="Volver a la vista principal"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">Artistas populares</h2>
          </div>
          {!expandedSection && (
            <button 
              onClick={() => setExpandedSection('artistas')} 
              className="shrink-0 whitespace-nowrap py-2 md:py-0 text-[13px] md:text-sm font-medium text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg px-2 cursor-pointer"
              title="Mostrar todos los artistas populares"
              aria-label="Mostrar todos los artistas populares"
            >
              Mostrar todo
            </button>
          )}
        </div>
        {loading ? renderSkeletonArtists() : renderList(dynamicArtists, expandedSection === 'artistas', (artist, i) => (
          <div key={i} className={`${expandedSection ? 'w-full' : 'w-[40vw] max-w-[180px] sm:w-48 md:w-56 md:max-w-none'} shrink-0 snap-start flex flex-col items-center gap-3 md:gap-4 group cursor-pointer`} onClick={() => onSelectArtist && onSelectArtist(artist)}>
            <div className={`${expandedSection ? 'w-full aspect-square' : 'w-full aspect-square md:w-56 md:h-56'} rounded-full overflow-hidden shadow-xl relative`}>
              <img src={artist.img} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-white font-semibold text-sm md:text-[15px] text-center line-clamp-1">{artist.name}</h3>
              <span className="text-white/50 text-xs md:text-[13px] mt-1">{artist.type || 'Artista'}</span>
            </div>
          </div>
        ), 112)}
      </motion.section>
      )}

      {(!expandedSection || expandedSection === 'destacados') && (
      <motion.section 
        initial={isInitialEntrance ? { y: 100, opacity: 0, scale: 0.92 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={getSectionSpring(0.36)}
        className="px-4 md:px-8"
      >
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {expandedSection && (
              <button 
                onClick={() => setExpandedSection(null)} 
                className="p-2 -ml-2 md:ml-0 hover:bg-white/10 rounded-full transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Volver a la vista principal"
                aria-label="Volver a la vista principal"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">Álbumes destacados</h2>
          </div>
          {!expandedSection && (
            <button 
              onClick={() => setExpandedSection('destacados')} 
              className="shrink-0 whitespace-nowrap py-2 md:py-0 text-[13px] md:text-sm font-medium text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg px-2 cursor-pointer"
              title="Mostrar todos los álbumes destacados"
              aria-label="Mostrar todos los álbumes destacados"
            >
              Mostrar todo
            </button>
          )}
        </div>
        {loading ? renderSkeletonCards() : renderList([...albums].sort((a, b) => a.title.localeCompare(b.title)), expandedSection === 'destacados', (album) => renderAlbumCard(album), 128)}
      </motion.section>
      )}
      
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
              <button 
                onClick={() => setShowDownloadConfirm(null)} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Cancelar y cerrar diálogo"
                aria-label="Cancelar descarga"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDownloadAlbum} 
                className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                title="Confirmar descarga completa"
                aria-label="Confirmar y descargar todo el álbum"
              >
                Descargar Todo
              </button>
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
              <button 
                onClick={() => setShowCancelConfirm(null)} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                title="Continuar con la descarga en curso"
                aria-label="Continuar descarga"
              >
                Continuar descarga
              </button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(showCancelConfirm.id));
                  setShowCancelConfirm(null);
                }} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
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