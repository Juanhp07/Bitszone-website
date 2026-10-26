import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, Minimize2, Heart, HeartOff, Shuffle, Repeat, Repeat1, ListMusic, Mic2, ListOrdered, Download, CheckCircle, Loader2, MoreHorizontal, ListX, ListPlus } from 'lucide-react';
import { TrackMenu } from './TrackMenu';
import { usePlayback } from './PlaybackContext';
import { usePlaylists, withAlbumInfo } from './PlaylistsContext';
import { ListScrollbar } from '../ui/ListScrollbar';
import { WavyProgress } from './MiniPlayer';
import { useDownloads } from './DownloadsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';


const MarqueeTitle = ({ text, active = false }: { text: string; active?: boolean }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [overflowAmount, setOverflowAmount] = React.useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const tWidth = textRef.current.scrollWidth;
        if (tWidth > cWidth) {
          setIsOverflowing(true);
          setOverflowAmount(tWidth - cWidth + 30); // 30px extra padding so it scrolls past the last letter
        } else {
          setIsOverflowing(false);
          setOverflowAmount(0);
        }
      }
    };
    checkOverflow();
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className="overflow-hidden flex-1 relative px-4 -mx-4 py-4 -my-4" style={{ maskImage: 'linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)' }}>
      <div
        className={`whitespace-nowrap ${isOverflowing ? (active ? 'animate-marquee-pingpong' : 'marquee-on-hover') : ''}`}
        style={isOverflowing ? { '--overflow-amount': `-${overflowAmount}px` } as React.CSSProperties : {}}
      >
        <span ref={textRef} className="inline-block truncate-none">
          {text}
        </span>
      </div>
    </div>
  );
};


const somewhereIBelongLyrics = [
  {time: 40.51,text:"When it began"},{time: 41.95,text:"I had nothing to say"},{time: 43.62,text:"And I get lost in the nothingness inside of me"},{time: 46.50,text:"(I was confused)"},{time: 47.39,text:"And I let it all out to find"},{time: 49.40,text:"That I'm not the only person with these things in mind"},{time: 52.33,text:"(Inside of me)"},{time: 53.25,text:"But all that they can see the words revealed"},{time: 55.48,text:"Is the only real thing that I've got left to feel"},{time: 58.25,text:"(Nothing to lose)"},{time: 59.16,text:"Just stuck, hollow and alone"},{time: 61.24,text:"And the fault is my own, and the fault is my own"},{time: 64.33,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 70.14,text:"I wanna let go of the pain I've felt so long"},{time: 74.10,text:"(Erase all the pain till it's gone)"},{time: 76.09,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 82.00,text:"I wanna find something I've wanted all along"},{time: 86.89,text:"Somewhere I belong"},{time: 89.29,text:"And I've got nothing to say"},{time: 90.87,text:"I can't believe I didn't fall right down on my face"},{time: 93.86,text:"(I was confused)"},{time: 94.80,text:"Looking everywhere only to find"},{time: 96.88,text:"That it's not the way I have imagined it all in my mind"},{time: 99.73,text:"(So what am I)"},{time: 100.73,text:"What do I have but negativity"},{time: 102.65,text:"'Cause I can't justify the way everyone is looking at me"},{time: 105.60,text:"(Nothing to lose)"},{time: 106.61,text:"Nothing to gain, hollow and alone"},{time: 108.60,text:"And the fault is my own, and the fault is my own"},{time: 111.60,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 117.46,text:"I wanna let go of the pain I've felt so long"},{time: 121.38,text:"(Erase all the pain till it's gone)"},{time: 123.42,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 129.42,text:"I wanna find something I've wanted all along"},{time: 134.29,text:"Somewhere I belong"},{time: 136.63,text:"I will never know myself until I do this on my own"},{time: 142.48,text:"And I will never feel anything else until my wounds are healed"},{time: 148.38,text:"I will never be anything till I break away from me"},{time: 154.26,text:"I will break away, I'll find myself today"},{time: 163.95,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 170.79,text:"I wanna let go of the pain I've felt so long"},{time: 174.91,text:"(Erase all the pain till it's gone)"},{time: 176.75,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 182.66,text:"I wanna find something I've wanted all along"},{time: 187.62,text:"Somewhere I belong"},{time: 190.02,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time: 195.73,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time: 205.46,text:"Somewhere I belong"}
];

export const ImmersivePlayer = ({
  isExpanded,
  onClose,
  track,
  album,
  isPlaying,
  togglePlay,
  onPlayTrack,
  volume = 100,
  setVolume,
  progress = 0,
  onNext,
  onPrev,
  onToggleMute,
  onSeek,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  activeTab = "pistas",
  onTabChange
}: {
  isExpanded: boolean,
  onClose: () => void,
  track: Track | null,
  album: Album | null,
  isPlaying: boolean,
  togglePlay: () => void,
  onPlayTrack?: (t: Track, a: Album) => void,
  volume?: number,
  setVolume?: (v: number) => void,
  progress?: number,
  onNext?: () => void,
  onPrev?: () => void,
  onToggleMute?: () => void,
  onSeek?: (progress: number) => void,
  isShuffle?: boolean,
  repeatMode?: "off" | "all" | "one",
  onToggleShuffle?: () => void,
  onToggleRepeat?: () => void,
  activeTab?: "portada" | "letra" | "pistas" | "cola",
  onTabChange?: (tab: "portada" | "letra" | "pistas" | "cola") => void
}) => {
  if (!track || !album) return null;

  const [currentTab, setCurrentTab] = useState<"pistas" | "letra" | "cola">(
    activeTab === "letra" ? "letra" : activeTab === "cola" ? "cola" : "pistas"
  );

  useEffect(() => {
    if (activeTab === "letra" || activeTab === "cola" || activeTab === "pistas") {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabSelect = (tab: "pistas" | "letra" | "cola") => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const currentIndex = album?.tracks?.findIndex(t => t.id === track.id) ?? -1;
  const playback = usePlayback();
  const { createPlaylist } = usePlaylists();
  const upcomingEntries = playback.upNext;

  // Apple-style rubber band bounce for right scrollable area
  const { containerRef: rightScrollRef, springValue: rightSpringY, scrollProps: rightScrollProps, triggerBounce: rightBounce } = useRubberBand({ axis: 'y' });

  // Top-to-bottom cascade animation variants
  const tabListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      }
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  const cascadedItemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const volumeRef = React.useRef<HTMLDivElement>(null);
  const isDraggingVol = React.useRef(false);
  const handleVolumeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!setVolume || !volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    let p = 1 - ((e.clientY - rect.top) / rect.height);
    p = Math.max(0, Math.min(1, p));
    const newVol = Math.round(p * 20) * 5;
    setVolume(newVol);
  };

  const isSomewhereIBelong = track.title === "Somewhere I Belong";
  const activeLyrics = isSomewhereIBelong ? somewhereIBelongLyrics : null;

  const durationSecs = Math.floor((track?.duration || 0) / 1000);
  const currentSecs = progress * durationSecs;

  let activeIndex = -1;
  if (activeLyrics) {
    for (let i = 0; i < activeLyrics.length; i++) {
      if (currentSecs >= activeLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  useEffect(() => {
    if (activeTab === 'letra' && lyricsContainerRef.current) {
      if (activeIndex === -1) {
        lyricsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (activeLyricRef.current) {
        const container = lyricsContainerRef.current;
        const element = activeLyricRef.current;
        const containerHeight = container.clientHeight;
        const elementOffset = element.offsetTop;
        const elementHeight = element.clientHeight;

        container.scrollTo({
          top: elementOffset - (containerHeight / 2) + (elementHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, activeTab]);



  const { isFavorite, toggleFavorite, isLicensed, isDownloaded, downloadTrack } = useDownloads();
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [rowMenu, setRowMenu] = useState<{ track: Track; album: Album; inQueue: boolean; anchor: { x: number; y: number } } | null>(null);

  const handleRowDownload = async (t: Track, from: Album) => {
    if (isDownloaded(t.id) || downloadingIds.includes(t.id)) return;
    setDownloadingIds(prev => [...prev, t.id]);
    await downloadTrack(t, String(from.id).startsWith('playlist:') ? undefined : from);
    setDownloadingIds(prev => prev.filter(id => id !== t.id));
  };

  const openRowMenu = (e: React.MouseEvent, t: Track, from: Album, inQueue: boolean, atCursor: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRowMenu({ track: t, album: from, inQueue, anchor: atCursor ? { x: e.clientX, y: e.clientY } : { x: rect.right - 270, y: rect.bottom + 6 } });
  };

  // Download + more, revealed on row hover (right side)
  const renderRowActions = (t: Track, from: Album, inQueue: boolean) => {
    const downloaded = isDownloaded(t.id);
    const downloading = downloadingIds.includes(t.id);
    const menuOpen = rowMenu?.track.id === t.id;
    return (
      <div className={`flex items-center gap-1 md:gap-2 ml-3 shrink-0 transition-opacity duration-300 [@media(hover:none)]:opacity-100 ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleRowDownload(t, from); }}
          disabled={downloaded || downloading}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer disabled:cursor-default"
          title={downloading ? 'Descargando...' : downloaded ? 'Canción descargada' : `Descargar ${t.title}`}
          aria-label={downloading ? 'Descargando canción' : downloaded ? 'Canción descargada' : `Descargar ${t.title}`}
        >
          {downloading ? <Loader2 className="w-5 h-5 animate-spin text-[#a855f7]" aria-hidden="true" />
            : downloaded ? <CheckCircle className="w-5 h-5 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
            : <Download className="w-5 h-5" aria-hidden="true" />}
        </button>
        <button
          onClick={(e) => openRowMenu(e, t, from, inQueue, false)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          title="Más opciones"
          aria-label={`Más opciones para ${t.title}`}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    );
  };
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

  const coverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isExpanded) return;
    const dest = coverRef.current;
    if (!dest || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const coverUrl = track.albumCover || album.coverUrl;
    const albumImg = document.querySelector<HTMLImageElement>('img[data-cover-source="album"]');
    const source = albumImg && albumImg.getAttribute('src') === coverUrl && albumImg.getBoundingClientRect().width > 0
      ? albumImg
      : document.querySelector<HTMLElement>('[data-cover-source="mini"]');
    if (!source) return;
    const from = source.getBoundingClientRect();
    const to = dest.getBoundingClientRect();
    if (!from.width || !to.width) return;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    dest.getAnimations().forEach((a) => a.cancel());
    dest.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` }, { transform: 'none' }],
      { duration: 600, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }
    );
  }, [isExpanded]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded, onClose]);

  // Waveform pattern
  const formatTime = (ms?: number) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const wave = [15, 30, 50, 80, 60, 40, 70, 100, 85, 60, 30, 45, 90, 75, 50, 35, 65, 85, 100, 80, 50, 35, 20, 15];
  const activeBars = Math.floor(progress * wave.length);



  return createPortal(
    <>
      {/* Backdrop (though the modal is fullscreen, keeping this for transition) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Fullscreen Modal Container */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          const target = e.target as HTMLElement;
          if (!target.closest('button, a, input, img, [role="slider"], [role="tab"], [role="menu"], .cursor-pointer, h2, p')) onClose();
        }}
        className={`fixed z-[100] inset-0 w-full h-full overflow-hidden transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-[#050505] flex ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >

        {/* Album ambience: same blurred cover as the album page, a touch darker */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-cover bg-center blur-[120px] scale-125 saturate-150 opacity-90" style={{ backgroundImage: `url(${track.albumCover || album.coverUrl})` }} />
           <div className="absolute inset-0 bg-black/55" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 md:top-8 xl:top-10 left-6 md:left-8 xl:left-10 z-50 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] rounded-full text-white/60 hover:text-white backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-300 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Minimizar reproductor (F o Esc)"
          aria-label="Minimizar reproductor"
        >
          <Minimize2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-90 transition-transform" aria-hidden="true" />
        </button>

        {/* 1. LEFT: Unified Cover, Info & Controls */}
        <div className="w-full md:w-[52%] h-full relative flex flex-col justify-center items-center group px-6 md:px-12 md:pl-24 py-8 overflow-y-auto scrollbar-hide">
           {/* Vertical Volume Control (Always visible, aligned with minimize button) */}
           <div className="hidden md:flex absolute left-6 md:left-8 xl:left-10 top-1/2 -translate-y-1/2 z-50 w-11 md:w-12 flex-col items-center gap-2 opacity-100 transition-all duration-300">
             <button
               onClick={() => setVolume && setVolume(100)}
               className="mb-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
               title="Volumen al máximo (100%)"
               aria-label="Subir volumen al máximo"
             >
               <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" aria-hidden="true" />
             </button>
             <div
               ref={volumeRef}
               className="flex flex-col gap-[3px] py-1 touch-none"
               onPointerDown={(e) => {
                 isDraggingVol.current = true;
                 handleVolumeDrag(e);
                 e.currentTarget.setPointerCapture(e.pointerId);
               }}
               onPointerMove={(e) => {
                 if (isDraggingVol.current) handleVolumeDrag(e);
               }}
               onPointerUp={(e) => {
                 isDraggingVol.current = false;
                 e.currentTarget.releasePointerCapture(e.pointerId);
               }}
               onPointerCancel={(e) => {
                 isDraggingVol.current = false;
                 e.currentTarget.releasePointerCapture(e.pointerId);
               }}
               onWheel={(e) => {
                 e.stopPropagation();
                 if (!setVolume) return;
                 const delta = e.deltaY;
                 const currentVol = volume || 0;
                 let newVol = currentVol;
                 if (delta > 0) newVol = Math.max(0, currentVol - 5);
                 if (delta < 0) newVol = Math.min(100, currentVol + 5);
                 if (newVol !== currentVol) {
                   setVolume(newVol);
                 }
               }}
             >
               {Array.from({ length: 20 }).map((_, i) => {
                 const level = (20 - i) * 5;
                 const isActive = (volume || 0) >= level;
                 return (
                   <button
                     key={level}
                     onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }}
                     className="py-[2px] px-1 flex items-center justify-center group/line cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 rounded-sm"
                     title={`Ajustar volumen al ${level}%`}
                     aria-label={`Volumen ${level}%`}
                   >
                     <div className={`w-6 h-1 rounded-full transition-all duration-100 ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}`} />
                   </button>
                 );
               })}
             </div>
             <button
               onClick={() => setVolume && setVolume(0)}
               className="mt-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
               title="Silenciar reproductor"
               aria-label="Silenciar reproductor"
             >
               <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" aria-hidden="true" />
             </button>
           </div>

           {/* Floating Content: Album Title -> Square -> Artist -> Player Controls */}
           <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-2xl">
              {/* Cover: same glass sleeve as the album page */}
              <div ref={coverRef} className="w-[min(75vw,18rem)] h-[min(75vw,18rem)] sm:w-[min(70vw,22rem)] sm:h-[min(70vw,22rem)] md:w-[min(30vw,520px,46vh)] md:h-[min(30vw,520px,46vh)] aspect-square rounded-2xl md:rounded-[22px] overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)] shrink-0 relative">
                <img
                  src={(track.albumCover || album.coverUrl)}
                  alt={album.title}
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.08)_22%,transparent_40%,transparent_70%,rgba(255,255,255,0.10)_100%)] pointer-events-none" />
                <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none" />
              </div>

              {/* Title + meta, laid out like the album page */}
              <div className="flex flex-col items-center text-center mt-5 md:mt-7 mb-5 md:mb-6 w-full md:w-[min(40vw,680px)] min-w-0 px-4">
                <h2 className="font-inter font-bold text-white text-2xl md:text-4xl xl:text-5xl leading-tight tracking-tight truncate max-w-full">
                  {track.title}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-2 text-sm md:text-base xl:text-lg text-white/70 font-medium [&>span]:whitespace-nowrap">
                  <button
                    onClick={() => playback.goToArtist(playback.nowPlayingOrigin ?? album)}
                    className="text-white font-semibold uppercase tracking-wide hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                    title="Ir al artista"
                  >
                    {track.artist || album.artist}
                  </button>
                  <span aria-hidden="true">•</span>
                  <button
                    onClick={() => playback.goToAlbum(playback.nowPlayingOrigin ?? album)}
                    className="hover:text-white hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                    title="Ir al álbum"
                  >
                    {playback.nowPlayingOrigin?.title || track.albumTitle || album.title}
                  </button>
                  {playback.nowPlayingOrigin?.year && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="text-white/50">{playback.nowPlayingOrigin.year}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Controls (Below Artist, More Compact) */}
              <div className="flex items-center gap-3 sm:gap-4 md:gap-12 mb-4 md:mb-6">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleShuffle?.(); }}
                  className={`w-9 h-9 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-pressed={isShuffle}
                >
                  <Shuffle className="w-3.5 h-3.5 md:w-6 md:h-6" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                  className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.25)] text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  title="Canción anterior"
                  aria-label="Reproducir canción anterior"
                >
                  <SkipBack className="w-4 h-4 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-14 h-14 md:w-24 md:h-24 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] group relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 cursor-pointer shrink-0"
                  title={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
                  aria-label={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
                  aria-pressed={isPlaying}
                >
                  {/* Spinning Vinyl Cover */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-full animate-spin"
                    style={{ animationDuration: '12s', animationPlayState: isPlaying ? 'running' : 'paused' }}
                  >
                    <img src={(track.albumCover || album.coverUrl)} className="w-full h-full object-cover scale-110" alt="" />
                  </div>

                  {/* Frosted Glass Overlay */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition-colors group-hover:bg-white/30" />

                  {/* Vinyl Grooves Details */}
                  <div className="absolute inset-1 rounded-full border border-white/30 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-2.5 md:inset-3 rounded-full border border-white/20 mix-blend-overlay pointer-events-none" />

                  {/* Vinyl Center Label */}
                  <div className="absolute w-7 h-7 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-xl border border-black/10 shadow-[0_0_15px_8px_rgba(0,0,0,0.35)] pointer-events-none" />
                  <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/10 shadow-inner pointer-events-none" />

                  {/* Play/Pause Icon */}
                  {isPlaying ? (
                    <Pause className="w-6 h-6 md:w-9 md:h-9 relative z-10 group-hover:scale-95 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play className="w-6 h-6 md:w-9 md:h-9 ml-1 relative z-10 group-hover:scale-105 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
                  )}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                  className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.25)] text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  title="Siguiente canción"
                  aria-label="Reproducir siguiente canción"
                >
                  <SkipForward className="w-4 h-4 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleRepeat?.(); }}
                  className={`w-9 h-9 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
                  aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'una canción' : repeatMode === 'all' ? 'todas' : 'desactivado'}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 md:w-6 md:h-6" aria-hidden="true" /> : <Repeat className="w-3.5 h-3.5 md:w-6 md:h-6" aria-hidden="true" />}
                </button>
              </div>

              {/* Squiggly Timeline Progress Bar (More Compact) */}
              <div className="w-full max-w-md md:max-w-none md:w-[min(42vw,760px)] flex items-center gap-2.5 md:gap-4 font-bold text-white/50 tracking-wider tabular-nums text-xs md:text-base">
                 <span className="text-right w-9 md:w-12">{formatTime(progress * track.duration)}</span>

                 <div
                   role="slider"
                   aria-label="Progreso de la canción"
                   aria-valuemin={0}
                   aria-valuemax={100}
                   aria-valuenow={Math.round(progress * 100)}
                   className="flex-1 h-8 md:h-7 flex items-center relative cursor-pointer group touch-none"
                   onPointerDown={(e) => {
                      e.stopPropagation();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      const rect = e.currentTarget.getBoundingClientRect();
                      onSeek?.(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                   }}
                   onPointerMove={(e) => {
                      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      onSeek?.(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                   }}
                   onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
                 >
                    {/* Unplayed straight line */}
                    <div className="absolute right-0 h-[4px] md:h-[5px] bg-white/25 rounded-full" style={{ left: `${progress * 100}%` }} />

                    {/* Played part: same live squiggle as the mini player */}
                    <WavyProgress progress={progress} isPlaying={isPlaying} />

                    {/* The Dot (Handle) */}
                    <div
                       className="absolute w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
                       style={{ left: `${progress * 100}%` }}
                    />
                 </div>

                 <span className="w-9 md:w-12">{formatTime(track.duration)}</span>
              </div>
           </div>
        </div>

        {/* 2. RIGHT: Tracklist, Lyrics & Queue Tabs */}
        <div className="group/list w-[48%] h-full relative overflow-hidden flex flex-col pt-8 md:pt-[19vh] pb-0 md:pb-[8vh]">
           <ListScrollbar containerRef={rightScrollRef} onBounce={rightBounce} springY={rightSpringY} className="hidden md:flex right-8 xl:right-12 top-[19vh] bottom-[8vh]" />
           <TrackMenu
             track={rowMenu?.track ?? null}
             album={rowMenu?.album ?? album}
             anchor={rowMenu?.anchor ?? null}
             onClose={() => setRowMenu(null)}
             trailingItems={rowMenu?.inQueue ? [{ label: 'Eliminar de la cola', icon: <ListX className="w-4 h-4" />, onSelect: () => playback.removeFromQueue(rowMenu.track.id), danger: true }] : []}
           />
           {/* Top Tabs (PISTAS / LETRA / COLA) - Centered Liquid Glass Pill */}
           <div className="md:absolute md:top-8 xl:top-10 md:right-8 xl:right-10 w-full md:w-auto mb-6 md:mb-0 shrink-0 z-40 flex items-center justify-center px-4 md:px-0">
              <div
                className="relative inline-flex items-center rounded-full p-1 w-[270px] sm:w-[300px] md:w-[330px] bg-black/30 hover:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.25)] transition-colors duration-300"
                role="tablist"
              >
                {/* Sliding Background */}
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-white/[0.1] backdrop-blur-md border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    width: 'calc(33.333% - 4px)',
                    left: currentTab === 'pistas' ? '4px' : currentTab === 'letra' ? 'calc(33.333% + 2px)' : 'calc(66.666% - 0px)'
                  }}
                />
                <button
                  role="tab"
                  aria-selected={currentTab === 'pistas'}
                  onClick={() => handleTabSelect('pistas')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-300 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${currentTab === 'pistas' ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white/35 hover:text-white/60'}`}
                  title="Mostrar pistas del álbum"
                  aria-label="Ver lista de pistas"
                >
                  <ListMusic className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />Pistas
                </button>
                <button
                  role="tab"
                  aria-selected={currentTab === 'letra'}
                  onClick={() => handleTabSelect('letra')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-300 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${currentTab === 'letra' ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white/35 hover:text-white/60'}`}
                  title="Mostrar letra sincronizada"
                  aria-label="Ver letra sincronizada"
                >
                  <Mic2 className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />Letra
                </button>
                <button
                  role="tab"
                  aria-selected={currentTab === 'cola'}
                  onClick={() => handleTabSelect('cola')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-300 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${currentTab === 'cola' ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white/35 hover:text-white/60'}`}
                  title="Mostrar cola de reproducción"
                  aria-label="Ver cola de reproducción"
                >
                  <ListOrdered className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />Cola
                </button>
              </div>
           </div>

           {/* Tab Content: PISTAS, LETRA or COLA with Apple Rubber Band & Smooth Top-to-Bottom Cascade */}
           <div
             ref={rightScrollRef}
             {...rightScrollProps}
             className="relative w-full flex-1 overflow-y-auto overscroll-y-contain flex flex-col justify-start pl-6 xl:pl-4 pr-12 xl:pr-[8rem] pb-20 pt-1 scrollbar-hide"
             style={{
               scrollbarWidth: 'none',
               maskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)'
             }}
           >
             <motion.div style={{ y: rightSpringY }} className="w-full">
               <AnimatePresence mode="wait">
                 {currentTab === 'letra' && (
                   <motion.div
                     key="letra"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col justify-start"
                   >
                     {isSomewhereIBelong ? (
                       <div
                         ref={lyricsContainerRef}
                         className="relative w-full h-full pt-[18vh] pb-[25vh] flex flex-col gap-6"
                       >
                         {activeLyrics?.map((line, i) => {
                           const isActive = i === activeIndex;
                           const isPast = i < activeIndex;
                           return (
                             <motion.p
                               key={i}
                               variants={cascadedItemVariants}
                               ref={isActive ? activeLyricRef : null}
                               className={`text-left text-xl md:text-2xl xl:text-3xl transition-all duration-500 font-bold leading-relaxed ${
                                 isActive
                                   ? 'text-white scale-[1.03] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                                   : isPast
                                     ? 'text-white/40'
                                     : 'text-white/20'
                               }`}
                             >
                               {line.text}
                             </motion.p>
                           );
                         })}
                       </div>
                     ) : (
                       <motion.div variants={cascadedItemVariants} className="flex items-center justify-center py-24">
                         <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>
                       </motion.div>
                     )}
                   </motion.div>
                 )}

                 {currentTab === 'pistas' && (
                   <motion.div
                     key="pistas"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col"
                   >
                     {album.tracks?.map((t, i) => {
                       const isActive = track.id === t.id;
                       return (
                         <motion.div
                           key={t.id}
                           variants={cascadedItemVariants}
                           onClick={() => onPlayTrack && onPlayTrack(t, album)}
                           onContextMenu={(e) => openRowMenu(e, t, album, false, true)}
                           className={`group py-2 md:py-2.5 text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                             isActive
                               ? 'text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] translate-x-4'
                               : 'text-white/50 hover:text-white/80'
                           }`}
                         >
                           <div className="flex items-center gap-4 md:gap-6">
                             <div className="flex items-center relative min-w-[3.5rem] shrink-0">
                               <button
                                 onClick={(e) => { e.stopPropagation(); toggleFavorite(t, album); }}
                                 className={`group/favbtn absolute left-0 transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-1 cursor-pointer ${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                                 title={isFavorite(t.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                 aria-label={isFavorite(t.id) ? `Quitar ${t.title} de favoritos` : `Añadir ${t.title} a favoritos`}
                               >
                                 {isFavorite(t.id) ? (
                                   <>
                                     <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                                     <HeartOff className="w-4 h-4 md:w-5 md:h-5 text-[#b066f8] hidden group-hover/favbtn:block" aria-hidden="true" />
                                   </>
                                 ) : (
                                   <Heart className="w-4 h-4 md:w-5 md:h-5 text-white/40 hover:text-white transition-colors" fill="none" aria-hidden="true" />
                                 )}
                               </button>
                               <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 ${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} ${isActive ? 'text-[#a855f7]/80' : 'text-white/40'}`}>
                                 {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                               </span>
                             </div>
                             <div className="flex items-center flex-1 min-w-0">
                               {isLicensed(t.id) && <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2 shrink-0" fill="currentColor" />}
                               <MarqueeTitle text={t.title} active={isActive} />
                             </div>
                             {isActive && (
                               <div className="flex items-end justify-center gap-[3px] h-5 md:h-6 ml-2 md:ml-4 shrink-0 opacity-80">
                                 <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[12px] animate-[bounce_1s_infinite]' : 'h-[4px]'}`}></div>
                                 <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[20px] animate-[bounce_1.2s_infinite]' : 'h-[4px]'}`}></div>
                                 <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[16px] animate-[bounce_0.8s_infinite]' : 'h-[4px]'}`}></div>
                                 <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[24px] animate-[bounce_1.1s_infinite]' : 'h-[4px]'}`}></div>
                               </div>
                             )}
                             {renderRowActions(t, album, false)}
                           </div>
                         </motion.div>
                       );
                     })}
                   </motion.div>
                 )}

                 {currentTab === 'cola' && (
                   <motion.div
                     key="cola"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col gap-6"
                   >
                     {/* Currently Playing Track */}
                     <motion.div variants={cascadedItemVariants} className="flex flex-col gap-1.5 pb-3 border-b border-white/5">
                       <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/70">
                         En Reproducción
                       </span>
                       <div className="py-1.5 text-2xl md:text-3xl font-bold text-white flex items-center gap-4">
                         <div className="flex items-center min-w-[2.5rem] shrink-0 text-[#a855f7]">
                           <span className="text-base md:text-lg font-medium tracking-widest">01</span>
                         </div>
                         <div className="flex items-center flex-1 min-w-0">
                           <MarqueeTitle text={track.title} active />
                         </div>
                         <div className="flex items-end justify-center gap-[3px] h-5 md:h-6 ml-2 md:ml-4 shrink-0 opacity-80">
                           <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[12px] animate-[bounce_1s_infinite]' : 'h-[4px]'}`}></div>
                           <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[20px] animate-[bounce_1.2s_infinite]' : 'h-[4px]'}`}></div>
                           <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[16px] animate-[bounce_0.8s_infinite]' : 'h-[4px]'}`}></div>
                           <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[24px] animate-[bounce_1.1s_infinite]' : 'h-[4px]'}`}></div>
                         </div>
                       </div>
                     </motion.div>

                     {/* Upcoming Queue Tracks */}
                     <div className="flex flex-col gap-1">
                       <motion.div variants={cascadedItemVariants} className="flex items-center justify-between mb-2">
                         <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/40">A Continuación</span>
                         <button
                           onClick={() => createPlaylist([withAlbumInfo(track, album), ...upcomingEntries.map(e => withAlbumInfo(e.track, e.album))])}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide text-white/70 hover:text-white bg-black/30 hover:bg-black/40 backdrop-blur-2xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                           title="Crear una lista con la canción actual y la cola"
                         >
                           <ListPlus className="w-3.5 h-3.5" aria-hidden="true" />
                           Guardar como lista
                         </button>
                       </motion.div>
                       {upcomingEntries.length > 0 ? (
                         upcomingEntries.map(({ track: t, album: from }, idx) => (
                           <motion.div
                             key={t.id}
                             variants={cascadedItemVariants}
                             onClick={() => playback.jumpTo(t.id)}
                             onContextMenu={(e) => openRowMenu(e, t, from, true, true)}
                             className="group py-2 md:py-2.5 text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 text-white/50 hover:text-white/80"
                           >
                             <div className="flex items-center gap-4 md:gap-6">
                               <div className="flex items-center relative min-w-[3.5rem] shrink-0">
                                 <button
                                   onClick={(e) => { e.stopPropagation(); toggleFavorite(t, from); }}
                                   className={`group/favbtn absolute left-0 transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-1 cursor-pointer ${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                                   title={isFavorite(t.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                   aria-label={isFavorite(t.id) ? `Quitar ${t.title} de favoritos` : `Añadir ${t.title} a favoritos`}
                                 >
                                   {isFavorite(t.id) ? (
                                     <>
                                       <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                                       <HeartOff className="w-4 h-4 md:w-5 md:h-5 text-[#b066f8] hidden group-hover/favbtn:block" aria-hidden="true" />
                                     </>
                                   ) : (
                                     <Heart className="w-4 h-4 md:w-5 md:h-5 text-white/40 hover:text-white transition-colors" fill="none" aria-hidden="true" />
                                   )}
                                 </button>
                                 <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 ${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} text-white/40`}>
                                   {(idx + 2).toString().padStart(2, '0')}
                                 </span>
                               </div>
                               <div className="flex items-center flex-1 min-w-0">
                                 {isLicensed(t.id) && <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2 shrink-0" fill="currentColor" />}
                                 <MarqueeTitle text={t.title} />
                               </div>
                               {renderRowActions(t, from, true)}
                             </div>
                           </motion.div>
                         ))
                       ) : (
                         <motion.div variants={cascadedItemVariants} className="py-4 text-white/35 text-sm font-medium">
                           Tu cola está vacía. Usa ⋯ o clic derecho en una canción para añadirla.
                         </motion.div>
                       )}
                     </div>

                     {/* Autoplay suggestions: separate from the queue (YT Music style) */}
                     {playback.recommendations.length > 0 && (
                       <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
                         <motion.span variants={cascadedItemVariants} className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/40 mb-2">
                           Reproducción automática
                         </motion.span>
                         {playback.recommendations.map(({ track: t, album: from }) => (
                           <motion.div
                             key={`rec-${t.id}`}
                             variants={cascadedItemVariants}
                             onClick={() => playback.jumpTo(t.id)}
                             onContextMenu={(e) => openRowMenu(e, t, from, false, true)}
                             className="group flex items-center gap-4 py-2 px-2 -mx-2 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.05]"
                           >
                             <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-md overflow-hidden shrink-0 bg-white/5">
                               <img src={t.albumCover || from.coverUrl} alt="" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Play className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true" />
                               </div>
                             </div>
                             <div className="flex flex-col flex-1 min-w-0">
                               <span className="text-white/80 group-hover:text-white text-base md:text-lg font-semibold truncate transition-colors">{t.title}</span>
                               <span className="text-white/45 text-sm truncate">{t.artist}</span>
                             </div>
                             <span className="text-white/40 text-sm tabular-nums shrink-0">{formatTime(t.duration)}</span>
                             {renderRowActions(t, from, false)}
                           </motion.div>
                         ))}
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
           </div>
        </div>
      </div>
    </>,
    document.body
  );
};