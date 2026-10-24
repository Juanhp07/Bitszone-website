import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, Minimize2, Heart, HeartOff, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';


const MarqueeTitle = ({ text }: { text: string }) => {
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
        className={`whitespace-nowrap ${isOverflowing ? 'animate-marquee-pingpong' : ''}`}
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
  activeTab?: "portada" | "letra" | "pistas",
  onTabChange?: (tab: "portada" | "letra" | "pistas") => void
}) => {
  if (!track || !album) return null;
  
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

  

  const { isFavorite, toggleFavorite, isLicensed } = useDownloads();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

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


  const waveSvg = "data:image/svg+xml,%3Csvg width='80' height='20' viewBox='0 0 80 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10C13 2 27 18 40 10C53 2 67 18 80 10' stroke='%23ffffff' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E";

  return createPortal(
    <>
      <style>{`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -80px; }
        }
        .animate-wave-slide {
          animation: wave-slide 2s linear infinite;
        }
      `}</style>
      {/* Backdrop (though the modal is fullscreen, keeping this for transition) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-[#020202]/90 backdrop-blur-md z-[100] transition-opacity duration-500 ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Fullscreen Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-[100] inset-0 w-full h-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#05050A] flex ${
          isExpanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-[100%] pointer-events-none'
        }`}
      >
        
        {/* Dynamic Gradient from Album Colors (Focused on Tracklist on the RIGHT) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-0 right-0 bottom-0 w-[150%]">
             <img 
               src={(track.albumCover || album.coverUrl)} 
               className="w-full h-full object-cover blur-[120px] saturate-[2.0] opacity-50 transform origin-right" 
               alt=""
             />
           </div>
           {/* Fade heavily to black towards the left side so the cover image can shine */}
           <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#05050A]/80 to-[#05050A]" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 md:top-8 xl:top-10 left-6 md:left-8 xl:left-10 z-50 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white backdrop-blur-2xl border border-white/20 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Minimizar reproductor (F o Esc)"
          aria-label="Minimizar reproductor"
        >
          <Minimize2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-90 transition-transform" aria-hidden="true" />
        </button>

        {/* 1. LEFT: Unified Cover, Info & Controls */}
        <div className="w-full md:w-[65%] h-full relative flex flex-col justify-center items-center group px-6 md:px-12 py-8 overflow-y-auto scrollbar-hide">
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

           {/* Background Cover Image with Moderate Blur (Artwork visible in background) */}
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden max-md:![mask-image:none] max-md:![-webkit-mask-image:none]" style={{ maskImage: 'linear-gradient(to left, transparent 0%, transparent 5%, black 40%, black 100%)', WebkitMaskImage: 'linear-gradient(to left, transparent 0%, transparent 5%, black 40%, black 100%)' }}>
             <img 
               src={(track.albumCover || album.coverUrl)} 
               alt="" 
               className="absolute inset-0 w-full h-full object-cover scale-105 blur-[12px] md:blur-[16px] opacity-55" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[#05050A]/40 via-transparent to-[#05050A]/90 opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/50 via-transparent to-[#05050A]/80 opacity-80" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#05050A_100%)] opacity-60" />
           </div>

           {/* Floating Content: Album Title -> Square -> Artist -> Player Controls */}
           <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-2xl">
              {/* Album Title (Above the Square) */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-serif italic font-bold text-white drop-shadow-lg text-center leading-tight [text-shadow:_0_4px_30px_rgba(0,0,0,0.8),_0_2px_10px_rgba(0,0,0,0.5)] mb-3 md:mb-5 px-4">
                {(track.albumTitle || album.title)}
              </h2>

              {/* Album Cover Square (Enlarged to fill space comfortably) */}
              <div className="w-[min(75vw,18rem)] h-[min(75vw,18rem)] sm:w-[min(70vw,22rem)] sm:h-[min(70vw,22rem)] md:w-[min(45vw,25rem,45vh)] md:h-[min(45vw,25rem,45vh)] xl:w-[min(45vw,28rem,48vh)] xl:h-[min(45vw,28rem,48vh)] aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.06)] border border-white/20 mb-3 md:mb-4 shrink-0 relative group/square transition-transform duration-300 hover:scale-[1.02]">
                <img 
                  src={(track.albumCover || album.coverUrl)} 
                  alt={album.title} 
                  className="w-full h-full object-cover select-none" 
                />
              </div>

              {/* Artist Name (Below the Square) */}
              <p className="text-white/70 text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-center [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)] mb-4 md:mb-5 px-4">
                {album.artist}
              </p>

              {/* Controls (Below Artist, More Compact) */}
              <div className="flex items-center gap-3 sm:gap-4 md:gap-8 mb-4 md:mb-6">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleShuffle?.(); }}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-pressed={isShuffle}
                >
                  <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  title="Canción anterior"
                  aria-label="Reproducir canción anterior"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] group relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 cursor-pointer shrink-0"
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
                  <div className="absolute w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-xl border border-black/10 shadow-[0_0_15px_8px_rgba(0,0,0,0.35)] pointer-events-none" />
                  <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/10 shadow-inner pointer-events-none" />

                  {/* Play/Pause Icon */}
                  {isPlaying ? (
                    <Pause className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:scale-95 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 relative z-10 group-hover:scale-105 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
                  )}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                  title="Siguiente canción"
                  aria-label="Reproducir siguiente canción"
                >
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleRepeat?.(); }}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
                  aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'una canción' : repeatMode === 'all' ? 'todas' : 'desactivado'}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> : <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />}
                </button>
              </div>

              {/* Squiggly Timeline Progress Bar (More Compact) */}
              <div className="w-full max-w-md flex items-center gap-2.5 md:gap-3.5 font-bold text-white/50 tracking-wider tabular-nums text-xs md:text-sm">
                 <span className="text-right w-9">{formatTime(progress * track.duration)}</span>
                 
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
                    
                    {/* Played wavy line clipping container */}
                    <div className="absolute left-0 top-0 bottom-0 overflow-hidden" style={{ width: `${progress * 100}%` }}>
                       <div 
                         className={`absolute left-0 top-0 bottom-0 w-[200vw] ${isPlaying ? 'animate-wave-slide' : ''}`}
                         style={{
                           backgroundImage: `url("${waveSvg}")`,
                           backgroundRepeat: 'repeat-x',
                           backgroundPosition: 'left center',
                           backgroundSize: '80px 20px',
                           maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)',
                           WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)'
                         }}
                       />
                    </div>
                    
                    {/* The Dot (Handle) */}
                    <div 
                       className="absolute w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
                       style={{ left: `${progress * 100}%` }}
                    />
                 </div>

                 <span className="w-9">{formatTime(track.duration)}</span>
              </div>
           </div>
        </div>

        {/* 2. RIGHT: Tracklist & Lyrics Tabs */}
        <div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-8 md:pt-10 pb-0">
           {/* Top Tabs (PISTAS / LETRA) - Centered Liquid Glass Pill */}
           <div className="w-full mb-6 shrink-0 z-40 flex items-center justify-center px-4">
              <div 
                className="relative inline-flex items-center rounded-full p-1 bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.3)] transition-colors duration-300" 
                role="tablist"
              >
                {/* Sliding Background */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white/[0.1] backdrop-blur-md border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'left-[calc(50%)]' : 'left-1'}`}
                />
                <button 
                  role="tab"
                  aria-selected={activeTab !== 'letra'}
                  onClick={() => onTabChange && onTabChange('pistas' as any)}
                  className={`relative z-10 w-[88px] md:w-[100px] flex items-center justify-center py-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-300 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${activeTab !== 'letra' ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white/35 hover:text-white/60'}`}
                  title="Mostrar pistas del álbum"
                  aria-label="Ver lista de pistas"
                >
                  Pistas
                </button>
                <button 
                  role="tab"
                  aria-selected={activeTab === 'letra'}
                  onClick={() => onTabChange && onTabChange('letra')}
                  className={`relative z-10 w-[88px] md:w-[100px] flex items-center justify-center py-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-300 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${activeTab === 'letra' ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white/35 hover:text-white/60'}`}
                  title="Mostrar letra sincronizada"
                  aria-label="Ver letra sincronizada"
                >
                  Letra
                </button>
              </div>
           </div>

           {/* Tab Content: PISTAS or LETRA */}
           {activeTab === 'letra' ? (
              <div className="relative w-full flex-1 overflow-hidden flex flex-col justify-start pl-6 xl:pl-10 pr-12 xl:pr-[5rem] pb-16 animate-in fade-in duration-300">
                {isSomewhereIBelong ? (
                  <div 
                    ref={lyricsContainerRef}
                    className="relative w-full h-full overflow-y-auto pt-[18vh] pb-[25vh] flex flex-col gap-6"
                    style={{ 
                      scrollbarWidth: 'none',
                      maskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)'
                    }}
                  >
                    {activeLyrics?.map((line, i) => {
                      const isActive = i === activeIndex;
                      const isPast = i < activeIndex;
                      return (
                        <p 
                          key={i}
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
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>
                  </div>
                )}
              </div>
           ) : (
              <div 
                className="relative w-full flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-6 xl:pl-10 pr-12 xl:pr-[5rem] transition-all duration-700 pb-20 pt-1 animate-in fade-in duration-300" 
                style={{ 
                  scrollbarWidth: 'none',
                  maskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)'
                }}>
                {album.tracks?.map((t, i) => {
                  const isActive = track.id === t.id;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => onPlayTrack && onPlayTrack(t, album)}
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
                          <MarqueeTitle text={t.title} />
                        </div>
                        {isActive && (
                          <div className="flex items-end justify-center gap-[3px] h-5 md:h-6 ml-2 md:ml-4 shrink-0 opacity-80">
                            <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[12px] animate-[bounce_1s_infinite]' : 'h-[4px]'}`}></div>
                            <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[20px] animate-[bounce_1.2s_infinite]' : 'h-[4px]'}`}></div>
                            <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[16px] animate-[bounce_0.8s_infinite]' : 'h-[4px]'}`}></div>
                            <div className={`w-[3px] md:w-[4px] bg-[#a855f7] rounded-full transition-all duration-150 ${isPlaying ? 'h-[24px] animate-[bounce_1.1s_infinite]' : 'h-[4px]'}`}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
           )}
        </div>
      </div>
    </>,
    document.body
  );
};