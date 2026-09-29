import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
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
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSelectAlbum,
  onSelectArtist
}: { 
  track: Track,
  album: Album,
  isPlaying: boolean,
  togglePlay: () => void,
  progress: number,
  volume: number,
  onExpand: () => void,
  onNext: () => void,
  onPrev: () => void,
  onSeek?: (progress: number) => void,
  onVolumeChange?: (volume: number) => void,
  onToggleMute?: () => void,
  onSelectAlbum?: () => void,
  onSelectArtist?: () => void
}) => {
  const { isFavorite, toggleFavorite } = useDownloads();

  const durationSecs = Math.floor((track.duration || 0) / 1000);
  const currentSecs = Math.floor(durationSecs * progress);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  const waveSvg = "data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E";

  return (
    <div className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none">
      <style>{`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -24px; }
        }
        .animate-wave-slide {
          animation: wave-slide 1s linear infinite;
        }
      `}</style>
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
        <div className="flex flex-col justify-center">
          <h4 
            onClick={(e) => { e.stopPropagation(); onSelectAlbum && onSelectAlbum(); }} 
            className="text-white font-semibold text-sm line-clamp-1 hover:underline cursor-pointer"
          >
            {track.title}
          </h4>
          <span 
            onClick={(e) => { e.stopPropagation(); onSelectArtist && onSelectArtist(); }} 
            className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline cursor-pointer"
          >
            {track.artist}
          </span>
        </div>
        <button 
          className="ml-4 text-white/50 hover:text-white transition-colors"
          onClick={() => toggleFavorite(track, album)}
        >
          <Heart 
            className="w-5 h-5" 
            fill={isFavorite(track.id) ? "#a855f7" : "none"} 
            color={isFavorite(track.id) ? "#a855f7" : "currentColor"} 
          />
        </button>
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
          <div className="flex-1 h-6 relative group flex items-center cursor-pointer">
            {/* Unplayed straight line */}
            <div className="absolute left-0 right-0 h-[2px] bg-white/20 rounded-full pointer-events-none" />
            
            {/* Played wavy line clipping container */}
            <div className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none" style={{ width: `${progress * 100}%` }}>
               <div 
                 className={`absolute left-0 top-0 bottom-0 w-[200vw] ${isPlaying ? 'animate-wave-slide' : ''}`}
                 style={{
                   backgroundImage: `url("${waveSvg}")`,
                   backgroundRepeat: 'repeat-x',
                   backgroundPosition: 'left center',
                   backgroundSize: '24px 12px'
                 }}
               />
            </div>
            
            {/* The Dot (Handle) */}
            <div 
               className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
               style={{ left: `${progress * 100}%` }}
            />
            
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001" 
              value={progress}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
            />
          </div>
          <span className="text-[11px] font-medium text-white/50 tabular-nums w-10">{formatTime(durationSecs)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px] relative z-10">
        <button className="text-white/50 hover:text-white transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
                <button onClick={onToggleMute} className="text-white/50 hover:text-white transition-colors focus:outline-none">
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 50 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="w-24 h-1.5 bg-white/10 rounded-full relative group cursor-pointer flex items-center">
          <div className="absolute left-0 h-full bg-white group-hover:bg-[#a855f7] rounded-full transition-colors pointer-events-none" style={{ width: `${volume}%` }}></div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume}
            onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
          />
        </div>
      </div>
    </div>
  );
};
