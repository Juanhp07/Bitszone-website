import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown } from 'lucide-react';


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
    <div ref={containerRef} className="overflow-hidden flex-1 relative" style={{ maskImage: isOverflowing ? 'linear-gradient(to right, black 90%, transparent 100%)' : 'none', WebkitMaskImage: isOverflowing ? 'linear-gradient(to right, black 90%, transparent 100%)' : 'none' }}>
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
  onSeek
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
  onSeek?: (progress: number) => void
}) => {
  if (!track || !album) return null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded, onClose]);

  // Waveform pattern
  const wave = [15, 30, 50, 80, 60, 40, 70, 100, 85, 60, 30, 45, 90, 75, 50, 35, 65, 85, 100, 80, 50, 35, 20, 15];
  const activeBars = Math.floor(progress * wave.length);

  return createPortal(
    <>
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
          isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        

        <button 
          onClick={onClose}
          className="absolute top-10 left-12 xl:left-[5rem] z-50 h-10 md:h-12 px-5 md:px-6 flex items-center justify-center gap-2 md:gap-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5 group"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-0.5 transition-transform" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-0.5">Ocultar Reproductor</span>
        </button>

        {/* 1. LEFT: Tracklist */}
        <div className="absolute top-28 left-12 xl:left-[5rem] z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">PISTAS</div>
        <div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-36 pb-0">
           {/* Deep fade masks for Top, Bottom, and Right edges to avoid harsh cuts */}
           <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#05050A] via-[#05050A]/90 to-transparent z-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent z-20 pointer-events-none" />
           <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           
           <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] gap-4 md:gap-5 transition-all duration-700 pb-20 pt-4" style={{ scrollbarWidth: 'none' }}>
             {album.tracks?.map((t, i) => {
               const isActive = track.id === t.id;
               return (
                 <div 
                   key={t.id} 
                   onClick={() => onPlayTrack && onPlayTrack(t, album)}
                   className={`text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                     isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.4)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'
                   }`}
                 >
                   <div className="flex items-center gap-4 md:gap-6">
                     <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest ${isActive ? 'text-[#a855f7]/60' : 'text-white/10'}`}>
                       {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                     </span>
                     <MarqueeTitle text={t.title} />
                   </div>
                 </div>
               )
             })}
           </div>
        </div>

        {/* 2. RIGHT: Unified Cover, Info & Controls */}
        <div className="w-[65%] h-full relative flex flex-col items-center justify-center">
           {/* Background Cover Image */}
           <img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className="absolute inset-0 w-full h-full object-cover opacity-50 z-0 grayscale-[20%] contrast-125" 
           />
           
           {/* Fades on all sides */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80 z-10 pointer-events-none" />

           {/* Top Tabs (PORTADA / LETRA) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
              <button className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Portada</button>
              <button className="text-white/40 hover:text-white transition-colors">Letra</button>
           </div>

           {/* Floating Content: Info & Controls */}
           <div className="relative z-30 flex flex-col items-center justify-center w-full px-8">
              <h2 className="text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white mb-4 drop-shadow-lg text-center leading-tight">
                {album.title}
              </h2>
              <p className="text-white/50 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center drop-shadow-md mb-16">
                {album.artist}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-8 md:gap-12">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipBack className="w-5 h-5 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform" fill="currentColor" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                  className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] group"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-95 transition-transform" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-2 group-hover:scale-105 transition-transform" fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipForward className="w-5 h-5 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" fill="currentColor" />
                </button>
              </div>
           </div>
        </div>
      </div>
    </>,
    document.body
  );
};