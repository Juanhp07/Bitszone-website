import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';
import type { Track, Album } from './types';
import { fetchTrackLyrics, type LyricsResult, somewhereIBelongLyrics } from '../../services/lyricsService';
import { Mic2 } from 'lucide-react';

export const LyricsSidebar = ({ 
  track, 
  album,
  progress = 0,
  onSeek
}: { 
  track: Track | null;
  album: Album | null;
  progress?: number;
  onSeek?: (progress: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const { springValue: lyricsSpringY, scrollProps: lyricsScrollProps } = useRubberBand({ axis: 'y', customRef: containerRef });

  const [lyricsResult, setLyricsResult] = useState<LyricsResult | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (!track) {
      setLyricsResult(null);
      return;
    }

    setLoadingLyrics(true);
    const durationSec = Math.floor((track.duration || 0) / 1000);
    const artistName = track.artist || album?.artist || '';

    fetchTrackLyrics(track.title, artistName, album?.title, durationSec)
      .then((res) => {
        if (!isCancelled) {
          setLyricsResult(res);
          setLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyricsResult(null);
          setLoadingLyrics(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [track?.id, track?.title, track?.artist, album?.title]);

  const activeLyrics = lyricsResult?.lines || (track?.title === "Somewhere I Belong" ? somewhereIBelongLyrics : null);

  const durationSecs = Math.floor((track?.duration || 0) / 1000);
  const currentSecs = progress * durationSecs;

  let activeIndex = -1;
  if (activeLyrics && activeLyrics.length > 0) {
    for (let i = 0; i < activeLyrics.length; i++) {
      if (currentSecs >= activeLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth scroll to active line
  useEffect(() => {
    if (containerRef.current) {
      if (activeIndex === -1) {
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (activeLineRef.current) {
        const container = containerRef.current;
        const element = activeLineRef.current;
        const containerHeight = container.clientHeight;
        const elementOffset = element.offsetTop;
        const elementHeight = element.clientHeight;
        
        container.scrollTo({
          top: elementOffset - (containerHeight * 0.36) + (elementHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="w-80 h-full bg-[#050505]/40 border-l border-white/5 backdrop-blur-[64px] flex flex-col z-20 transition-all duration-300">
      {track ? (
        <>
          {/* Header (Fixed at top) */}
          <div className="p-6 pb-2 shrink-0">
            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md truncate">{track.title}</h2>
            <p className="text-sm font-medium text-white/70 drop-shadow-md truncate">{album?.artist || track.artist}</p>
          </div>
          
          {/* Lyrics Content (Scrollable with Mask & Rubber Band Bounce) */}
          <div 
            ref={containerRef}
            {...lyricsScrollProps}
            className="relative flex-1 overflow-y-auto scrollbar-hide px-6 pb-16 text-lg tracking-wide"
            style={{ 
              scrollbarWidth: 'none',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%)'
            }}
          >
            <motion.div style={{ y: lyricsSpringY }}>
              {loadingLyrics && (!activeLyrics || activeLyrics.length === 0) ? (
                <div className="space-y-6 pt-6 animate-pulse">
                  <div className="h-6 bg-white/10 rounded-xl w-3/4 blur-sm" />
                  <div className="h-7 bg-white/20 rounded-xl w-1/2 blur-none" />
                  <div className="h-6 bg-white/10 rounded-xl w-5/6 blur-sm" />
                  <div className="h-6 bg-white/10 rounded-xl w-2/3 blur-sm" />
                </div>
              ) : activeLyrics && activeLyrics.length > 0 ? (
                <div className="space-y-6 pt-6 pb-[30vh]">
                  {activeLyrics.map((line, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <div 
                        key={`${line.time}-${i}`}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => {
                          if (onSeek && durationSecs > 0) {
                            onSeek(Math.min(1, Math.max(0, line.time / durationSecs)));
                          }
                        }}
                        className={`transition-all duration-500 font-bold select-none cursor-pointer transform origin-left ${
                          isActive 
                            ? 'text-white text-xl sm:text-2xl leading-snug scale-[1.03] opacity-100 blur-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)]' 
                            : 'text-white/35 text-xl sm:text-2xl leading-snug scale-[0.98] blur-[1px] hover:text-white/70 hover:blur-none hover:scale-[1.0]'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-3">
                    <Mic2 className="w-6 h-6" />
                  </div>
                  <p className="text-white/80 font-bold text-base">Letra no disponible</p>
                  <p className="text-white/40 text-xs mt-1">No encontramos la letra para esta canción.</p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-white/40 font-medium drop-shadow-sm">
          <p>Reproduce una canción</p>
        </div>
      )}
    </div>
  );
};
