import React, { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { Track } from './types';

export const SadView = ({ 
  track, 
  isPlaying, 
  onTogglePlay 
}: { 
  track: Track | null,
  isPlaying: boolean,
  onTogglePlay: () => void
}) => {
  const [drops, setDrops] = useState<Array<{ id: number; left: string; duration: string; delay: string; opacity: number }>>([]);

  useEffect(() => {
    // Generate random raindrops
    const newDrops = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 1 + 0.5}s`,
      delay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505] flex items-center justify-center animate-in fade-in duration-1000">
      
      {/* Rain animation layer */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))'
      }}>
        {drops.map(drop => (
          <div 
            key={drop.id}
            className="absolute top-[-20px] bg-white rounded-full w-[1px] h-[15px]"
            style={{
              left: drop.left,
              opacity: drop.opacity,
              animation: `fall ${drop.duration} linear ${drop.delay} infinite`
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(5deg);
          }
        }
      `}} />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-md w-full px-6">
        <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl mb-8 relative group transition-transform duration-700 hover:scale-105 border border-white/5">
          <img 
            src={track?.albumCover || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop"} 
            alt="Melancolía" 
            className="w-full h-full object-cover grayscale-[50%] blur-[2px] scale-110 group-hover:blur-0 group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button 
              onClick={onTogglePlay}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"
            >
              {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-2 font-serif italic text-center">
          {track?.title || "Triste Payaso"}
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase mb-12">
          Para Fabrizzio y Johan
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
};
