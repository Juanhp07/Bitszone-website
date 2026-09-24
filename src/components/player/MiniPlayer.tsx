import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import type { Album, Track } from './types';

export const MiniPlayer = ({ 
  track,
  album,
  isPlaying,
  togglePlay,
  progress,
  volume,
  onExpand,
  onNext,
  onPrev 
}: { 
  track: Track,
  album: Album,
  isPlaying: boolean,
  togglePlay: () => void,
  progress: number,
  volume: number,
  onExpand: () => void,
  onNext: () => void,
  onPrev: () => void
}) => {

  const durationSecs = Math.floor((track.duration || 0) / 1000);
  const currentSecs = Math.floor(durationSecs * progress);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none opacity-30"></div>
      
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px] relative z-10">
        <div 
          onClick={onExpand}
          className="w-14 h-14 rounded-md overflow-hidden bg-white/10 cursor-pointer relative group shadow-md"
        >
          <img src={album.coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </div>
        </div>
        <div className="flex flex-col cursor-pointer" onClick={onExpand}>
          <h4 className="text-white font-semibold text-sm line-clamp-1 hover:underline">{track.title}</h4>
          <span className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline">{track.artist}</span>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px] relative z-10">
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-white/70 hover:text-white transition-colors" onClick={onPrev}>
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          <button 
            className="w-10 h-10 bg-white hover:scale-105 rounded-full flex items-center justify-center text-black transition-transform shadow-lg" 
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-1" fill="currentColor" />}
          </button>
          <button className="text-white/70 hover:text-white transition-colors" onClick={onNext}>
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-medium text-white/50 tabular-nums w-10 text-right">{formatTime(currentSecs)}</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer relative">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-full bg-white rounded-full group-hover:bg-[#a855f7] transition-colors" style={{ width: `${progress * 100}%` }}></div>
          </div>
          <span className="text-[11px] font-medium text-white/50 tabular-nums w-10">{formatTime(durationSecs)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px] relative z-10">
        <button className="text-white/50 hover:text-white transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <Volume2 className="w-4 h-4 text-white/50" />
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
          <div className="h-full bg-white group-hover:bg-[#a855f7] transition-colors" style={{ width: `${volume}%` }}></div>
        </div>
      </div>
    </div>
  );
};
