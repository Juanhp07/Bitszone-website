import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export const MiniPlayer = ({ onExpand }: { onExpand: () => void }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-40">
      <div 
        onClick={onExpand}
        className="flex items-center justify-between w-full bg-[#111111]/90 backdrop-blur-3xl px-6 py-4 rounded-3xl border border-white/5 shadow-2xl cursor-pointer hover:bg-[#1a1a1a]/90 transition-colors group"
      >
        {/* Left: Now Playing Info */}
        <div className="flex items-center gap-4 w-[30%]">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 shadow-lg relative group-hover:shadow-purple-500/20 transition-all">
            <img src="/mj.png" alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-white font-medium text-sm">Thriller</h4>
            <span className="text-white/50 text-xs mt-0.5">Michael Jackson • Almacenamiento local (FLAC)</span>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-6">
            <button className="text-white/40 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
            </button>
            <button className="text-white/70 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <Pause className="w-5 h-5" fill="currentColor" />
            </button>
            <button className="text-white/70 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full max-w-[400px]">
            <span className="text-[10px] font-medium text-white/40 tabular-nums">01:42</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#a855f7] w-[35%] rounded-full shadow-[0_0_10px_#a855f7]"></div>
            </div>
            <span className="text-[10px] font-medium text-white/40 tabular-nums">04:28</span>
          </div>
        </div>

        {/* Right: Volume & Extra */}
        <div className="flex items-center justify-end gap-4 w-[30%]">
          <Volume2 className="w-4 h-4 text-white/50" />
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 w-[70%] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
