import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, Minimize2, Heart } from 'lucide-react';
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
  {time:43.71,text:"When it began"},{time:45.15,text:"I had nothing to say"},{time:46.82,text:"And I get lost in the nothingness inside of me"},{time:49.70,text:"(I was confused)"},{time:50.59,text:"And I let it all out to find"},{time:52.60,text:"That I'm not the only person with these things in mind"},{time:55.53,text:"(Inside of me)"},{time:56.45,text:"But all that they can see the words revealed"},{time:58.68,text:"Is the only real thing that I've got left to feel"},{time:61.45,text:"(Nothing to lose)"},{time:62.36,text:"Just stuck, hollow and alone"},{time:64.44,text:"And the fault is my own, and the fault is my own"},{time:67.53,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:73.34,text:"I wanna let go of the pain I've felt so long"},{time:77.30,text:"(Erase all the pain till it's gone)"},{time:79.29,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:85.20,text:"I wanna find something I've wanted all along"},{time:90.09,text:"Somewhere I belong"},{time:92.49,text:"And I've got nothing to say"},{time:94.07,text:"I can't believe I didn't fall right down on my face"},{time:97.06,text:"(I was confused)"},{time:98.00,text:"Looking everywhere only to find"},{time:100.08,text:"That it's not the way I have imagined it all in my mind"},{time:102.93,text:"(So what am I)"},{time:103.93,text:"What do I have but negativity"},{time:105.85,text:"'Cause I can't justify the way everyone is looking at me"},{time:108.80,text:"(Nothing to lose)"},{time:109.81,text:"Nothing to gain, hollow and alone"},{time:111.80,text:"And the fault is my own, and the fault is my own"},{time:114.80,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:120.66,text:"I wanna let go of the pain I've felt so long"},{time:124.58,text:"(Erase all the pain till it's gone)"},{time:126.62,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:132.62,text:"I wanna find something I've wanted all along"},{time:137.49,text:"Somewhere I belong"},{time:139.83,text:"I will never know myself until I do this on my own"},{time:145.68,text:"And I will never feel anything else until my wounds are healed"},{time:151.58,text:"I will never be anything till I break away from me"},{time:157.46,text:"I will break away, I'll find myself today"},{time:167.15,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:173.99,text:"I wanna let go of the pain I've felt so long"},{time:178.11,text:"(Erase all the pain till it's gone)"},{time:179.95,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:185.86,text:"I wanna find something I've wanted all along"},{time:190.82,text:"Somewhere I belong"},{time:193.22,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:198.93,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:208.66,text:"Somewhere I belong"}
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
  const [activeTab, setActiveTab] = React.useState<"portada" | "letra">("portada");
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
  const activeLyrics = isSomewhereIBelong ? somewhereIBelongLyrics : [];
  

  const { isFavorite, toggleFavorite } = useDownloads();

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
          animation: wave-slide 1s linear infinite;
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
          isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        
        {/* Dynamic Gradient from Album Colors (Focused on Tracklist) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-0 left-0 bottom-0 w-[150%]">
             <img 
               src={album.coverUrl} 
               className="w-full h-full object-cover blur-[120px] saturate-[2.0] opacity-50 transform origin-left" 
               alt=""
             />
           </div>
           {/* Fade heavily to black towards the right side so the cover image can shine */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#05050A]/80 to-[#05050A]" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-8 left-8 md:top-10 md:left-12 xl:left-[5rem] z-50 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white backdrop-blur-md border border-white/5 transition-all group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          title="Minimizar Reproductor"
        >
          <Minimize2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-90 transition-transform" />
        </button>

        {/* 1. LEFT: Tracklist */}
        <div className="absolute top-[110px] left-12 xl:left-[5rem] z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">PISTAS</div>
        <div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[140px] pb-0">
           <div 
             className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] pr-6 xl:pr-12 transition-all duration-700 pb-20 pt-2" 
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
                         className={`absolute left-0 transition-all duration-300 flex items-center justify-center ${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                       >
                         <Heart 
                           className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFavorite(t.id) ? 'text-[#a855f7]' : 'text-white/40 hover:text-white'}`} 
                           fill={isFavorite(t.id) ? "currentColor" : "none"} 
                         />
                       </button>
                       <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 ${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} ${isActive ? 'text-[#a855f7]/80' : 'text-white/40'}`}>
                         {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                       </span>
                     </div>
                     <MarqueeTitle text={t.title} />
                   </div>
                 </div>
               )
             })}
           </div>
        </div>

        {/* 2. RIGHT: Unified Cover, Info & Controls */}
        <div className="w-[65%] h-full relative flex flex-col items-center justify-end pb-12 xl:pb-16 group">
           {/* Vertical Volume Control (Appears on Hover) */}
           <div className="absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
             <button onClick={() => setVolume && setVolume(100)} className="mb-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon">
               <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" />
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
                     className="py-[2px] px-1 flex items-center justify-center group/line cursor-pointer"
                   >
                     <div className={`w-6 h-1 rounded-full transition-all duration-100 ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}`} />
                   </button>
                 );
               })}
             </div>
             <button onClick={() => setVolume && setVolume(0)} className="mt-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon">
               <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" />
             </button>
           </div>
           {/* Background Cover Image with Fades */}
           <div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 40%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 40%, black 100%)' }}>
             <img 
               src={album.coverUrl} 
               alt="Artist/Album Cover" 
               className={`absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}`} 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/80 via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80" />
           </div>

           {/* Top Tabs (PORTADA / LETRA) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 p-1 flex items-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              {/* Sliding Background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm ${activeTab === 'letra' ? 'left-[calc(50%)]' : 'left-1'}`}
              />
              <button 
                onClick={() => setActiveTab('portada')}
                className={`relative z-10 w-[110px] md:w-[130px] flex items-center justify-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-500 ${activeTab === 'portada' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Portada
              </button>
              <button 
                onClick={() => setActiveTab('letra')}
                className={`relative z-10 w-[110px] md:w-[130px] flex items-center justify-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] indent-[0.2em] uppercase transition-colors duration-500 ${activeTab === 'letra' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Letra
              </button>
           </div>

           {/* Lyrics View Area */}
           <div className={`absolute top-[90px] left-0 right-0 bottom-[360px] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
              
              {isSomewhereIBelong ? (
                <div 
                  className="w-full h-full overflow-y-auto px-8 py-[60px] flex flex-col items-center gap-4"
                  style={{ 
                    scrollbarWidth: 'none',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
                  }}
                >
                  {activeLyrics.map((line, i) => (
                    <p 
                      key={i}
                      className="text-center text-lg md:text-xl text-white/70 hover:text-white transition-colors duration-300 font-medium tracking-wide max-w-2xl px-4"
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>
              )}

           </div>

           {/* Floating Content: Info & Controls */}
           <div className={`relative z-30 flex flex-col items-center justify-center w-full px-8 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'translate-y-4 scale-[0.9] opacity-100' : 'translate-y-0 scale-100 opacity-100'}`}>
              <h2 className={`text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white drop-shadow-lg text-center leading-tight [text-shadow:_0_4px_30px_rgba(0,0,0,0.8),_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-[1200ms] ${activeTab === 'letra' ? 'mb-2' : 'mb-4'}`}>
                {album.title}
              </h2>
              <p className={`text-white/70 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)] transition-all duration-[1200ms] ${activeTab === 'letra' ? 'mb-8' : 'mb-12'}`}>
                {album.artist}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-8 md:gap-12 mb-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipBack className="w-5 h-5 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform" fill="currentColor" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] group relative overflow-hidden"
                >
                  {/* Spinning Vinyl Cover */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-full animate-spin"
                    style={{ animationDuration: '12s', animationPlayState: isPlaying ? 'running' : 'paused' }}
                  >
                    <img src={album.coverUrl} className="w-full h-full object-cover scale-110" alt="" />
                  </div>
                  
                  {/* Frosted Glass Overlay (claro con blur) */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition-colors group-hover:bg-white/30" />
                  
                  {/* Vinyl Grooves Details */}
                  <div className="absolute inset-1.5 md:inset-2 rounded-full border border-white/30 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-4 md:inset-6 rounded-full border border-white/20 mix-blend-overlay pointer-events-none" />
                  
                  {/* Vinyl Center Label */}
                  <div className="absolute w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-xl border-[2px] border-black/10 shadow-[0_0_25px_12px_rgba(0,0,0,0.35)] pointer-events-none" />
                  <div className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/10 shadow-inner pointer-events-none" />

                  {/* Play/Pause Icon */}
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10 relative z-10 group-hover:scale-95 transition-transform drop-shadow-md" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-2 relative z-10 group-hover:scale-105 transition-transform drop-shadow-md" fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipForward className="w-5 h-5 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" fill="currentColor" />
                </button>
              </div>

              {/* Squiggly Timeline Progress Bar */}
              <div className={`w-full max-w-xl flex items-center gap-4 font-bold text-white/50 tracking-wider transition-all duration-[1200ms] ${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
                 <span className={`text-right transition-all duration-[1200ms] ${activeTab === 'letra' ? 'w-16' : 'w-10'}`}>{formatTime(progress * track.duration)}</span>
                 
                 <div 
                   className="flex-1 h-8 flex items-center relative cursor-pointer group"
                   onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const p = (e.clientX - rect.left) / rect.width;
                      onSeek?.(p);
                   }}
                 >
                    {/* Unplayed straight line */}
                    <div className="absolute right-0 h-[6px] bg-white/30 rounded-full" style={{ left: `${progress * 100}%` }} />
                    
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
                       className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
                       style={{ left: `${progress * 100}%` }}
                    />
                 </div>

                 <span className={`transition-all duration-[1200ms] ${activeTab === 'letra' ? 'w-16' : 'w-10'}`}>{formatTime(track.duration)}</span>
              </div>
           </div>
        </div>
      </div>
    </>,
    document.body
  );
};