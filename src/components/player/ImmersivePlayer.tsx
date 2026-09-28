import React, { useEffect } from 'react';
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
        

        {/* 1. LEFT: Tracklist */}
        <div className="absolute top-12 left-12 xl:left-20 z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">Artistas</div>
        <div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-24 pb-24">
           {/* Deep fade masks for Top, Bottom, and Right edges to avoid harsh cuts */}
           <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           
           <div className="w-full h-full overflow-y-auto flex flex-col justify-start pl-12 xl:pl-20 gap-4 md:gap-5 transition-all duration-700 pb-32" style={{ scrollbarWidth: 'none' }}>
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
                     <span className="line-clamp-1">{t.title}</span>
                   </div>
                 </div>
               )
             })}
           </div>
        </div>

        {/* 2. CENTER: Visualizer & Controls */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[35%] flex flex-col items-center justify-center z-30 pointer-events-none">
           <h2 className="text-3xl md:text-4xl xl:text-5xl font-serif italic text-white drop-shadow-lg text-center line-clamp-1 px-4">{album.title}</h2>
           <p className="text-white/40 text-xs md:text-sm mt-3 tracking-[0.3em] uppercase text-center">{album.artist}</p>
        </div>
        <div className="w-[35%] h-full flex flex-col items-center justify-center relative z-20">
           
           {/* Visualizer & Play Controls Container */}
           <div className="relative flex items-center justify-center w-full h-[300px]">
              {/* Interactive Seek Layer */}
              <div 
                 className="absolute inset-0 z-0 cursor-pointer"
                 onClick={(e) => {
                    if (!onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    onSeek(percent);
                 }}
              />
              {/* Bars */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 opacity-90 pointer-events-none">
                 {wave.map((h, i) => {
                    const isPlayed = i <= activeBars;
                    return (
                      <div 
                        key={i} 
                        className={`w-2 md:w-3 rounded-full transition-all duration-300 ${isPlayed ? 'bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`} 
                        style={{ height: `${h}%` }} 
                      />
                    );
                 })}
              </div>

              {/* Controls */}
              <div className="relative z-10 flex items-center gap-8">
                 <button onClick={onPrev} className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-[#252525] transition-all shadow-xl">
                   <SkipBack className="w-7 h-7 fill-current" />
                 </button>
                 <button onClick={togglePlay} className="w-28 h-28 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-105 hover:bg-[#252525] transition-all shadow-2xl">
                   {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
                 </button>
                 <button onClick={onNext} className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-[#252525] transition-all shadow-xl">
                   <SkipForward className="w-7 h-7 fill-current" />
                 </button>
              </div>
           </div>

           {/* Volume */}
           <div className="absolute bottom-20 flex items-center gap-4 w-[70%] max-w-md">
              <button onClick={onToggleMute} className="text-white/50 hover:text-white transition-colors focus:outline-none">
                {volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="flex-1 h-2 bg-white/10 rounded-full relative cursor-pointer group flex items-center">
                <div className="absolute left-0 h-full bg-[#a855f7] rounded-full transition-all pointer-events-none" style={{ width: `${volume}%` }} />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume && setVolume(parseFloat(e.target.value))}
                  className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
                />
              </div>
              <span className="text-white/40 text-sm font-medium w-10 text-right">{Math.round(volume)}%</span>
           </div>
        </div>

        {/* 3. RIGHT: Cover & Tabs */}
        <div className="w-[30%] h-full relative">
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-[#05050A]/40 to-transparent z-10 pointer-events-none" />
           <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#05050A] to-transparent z-10 pointer-events-none" />
           <img src={album.coverUrl} className="w-full h-full object-cover grayscale-[30%] contrast-125" alt="Artist/Album Cover" />
           
           <div className="absolute top-10 right-16 z-20 flex gap-8 text-xs font-bold tracking-[0.2em] uppercase">
              <button className="text-white">Portada</button>
              <button className="text-white/40 hover:text-white transition-colors">Letra</button>
           </div>
        </div>
      </div>
    </>,
    document.body
  );
};
