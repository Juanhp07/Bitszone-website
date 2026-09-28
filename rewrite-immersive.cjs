const fs = require('fs');

const playerCode = `import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';

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
  onToggleMute
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
  onToggleMute?: () => void
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
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={\`fixed inset-0 bg-[#020202]/90 backdrop-blur-md z-[100] transition-opacity duration-500 \${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }\`}
      />

      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={\`fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[85vh] max-w-[1600px] max-h-[1000px] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#05050A] flex \${
          isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }\`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 text-white/50 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. LEFT: Angled Tracklist */}
        <div className="w-[35%] h-full relative overflow-hidden flex items-center">
           {/* Fade mask for top and bottom */}
           <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #05050A 0%, transparent 20%, transparent 80%, #05050A 100%)' }} />
           
           <div className="w-full h-[200%] flex flex-col justify-center pl-16 xl:pl-24 gap-4 md:gap-6 transform -rotate-6 translate-y-10 origin-left transition-all duration-700">
             {album.tracks?.map((t, i) => {
               const isActive = track.id === t.id;
               return (
                 <div 
                   key={t.id} 
                   onClick={() => onPlayTrack && onPlayTrack(t, album)}
                   className={\`text-3xl md:text-4xl xl:text-5xl font-bold cursor-pointer transition-all duration-300 line-clamp-1 \${
                     isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'
                   }\`}
                 >
                   {t.title}
                 </div>
               )
             })}
           </div>
        </div>

        {/* 2. CENTER: Visualizer & Controls */}
        <div className="w-[35%] h-full flex flex-col items-center justify-center relative z-20">
           
           {/* Visualizer & Play Controls Container */}
           <div className="relative flex items-center justify-center w-full h-[300px]">
              {/* Bars */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 opacity-90">
                 {wave.map((h, i) => {
                    const isPlayed = i <= activeBars;
                    return (
                      <div 
                        key={i} 
                        className={\`w-2 md:w-3 rounded-full transition-all duration-300 \${isPlayed ? 'bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}\`} 
                        style={{ height: \`\${h}%\` }} 
                      />
                    );
                 })}
              </div>

              {/* Controls */}
              <div className="relative z-10 flex items-center gap-6">
                 <button onClick={onPrev} className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-[#252525] transition-all shadow-xl">
                   <SkipBack className="w-6 h-6 fill-current" />
                 </button>
                 <button onClick={togglePlay} className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-105 hover:bg-[#252525] transition-all shadow-2xl">
                   {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                 </button>
                 <button onClick={onNext} className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-[#252525] transition-all shadow-xl">
                   <SkipForward className="w-6 h-6 fill-current" />
                 </button>
              </div>
           </div>

           {/* Volume */}
           <div className="absolute bottom-16 flex items-center gap-4 w-[70%] max-w-sm">
              <button onClick={onToggleMute} className="text-white/50 hover:text-white transition-colors focus:outline-none">
                {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="flex-1 h-2 bg-white/10 rounded-full relative cursor-pointer group flex items-center">
                <div className="absolute left-0 h-full bg-[#a855f7] rounded-full transition-all pointer-events-none" style={{ width: \`\${volume}%\` }} />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume && setVolume(parseFloat(e.target.value))}
                  className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
                />
              </div>
              <span className="text-white/40 text-xs font-medium w-8 text-right">{Math.round(volume)}%</span>
           </div>
        </div>

        {/* 3. RIGHT: Cover & Tabs */}
        <div className="w-[30%] h-full relative">
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-[#05050A]/40 to-transparent z-10" />
           <img src={album.coverUrl} className="w-full h-full object-cover grayscale-[30%] contrast-125" alt="Artist/Album Cover" />
           
           <div className="absolute top-10 right-14 z-20 flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase">
              <button className="text-white">Portada</button>
              <button className="text-white/40 hover:text-white transition-colors">Letra</button>
           </div>
        </div>
      </div>
    </>,
    document.body
  );
};
`;

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', playerCode);
console.log('ImmersivePlayer successfully completely rewritten to original design');
