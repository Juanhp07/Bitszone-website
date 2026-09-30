import React, { useEffect, useRef } from 'react';
import type { Track, Album } from './types';

const somewhereIBelongLyrics = [
  {time:43.71,text:"When it began"},{time:45.15,text:"I had nothing to say"},{time:46.82,text:"And I get lost in the nothingness inside of me"},{time:49.70,text:"(I was confused)"},{time:50.59,text:"And I let it all out to find"},{time:52.60,text:"That I'm not the only person with these things in mind"},{time:55.53,text:"(Inside of me)"},{time:56.45,text:"But all that they can see the words revealed"},{time:58.68,text:"Is the only real thing that I've got left to feel"},{time:61.45,text:"(Nothing to lose)"},{time:62.36,text:"Just stuck, hollow and alone"},{time:64.44,text:"And the fault is my own, and the fault is my own"},{time:67.53,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:73.34,text:"I wanna let go of the pain I've felt so long"},{time:77.30,text:"(Erase all the pain till it's gone)"},{time:79.29,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:85.20,text:"I wanna find something I've wanted all along"},{time:90.09,text:"Somewhere I belong"},{time:92.49,text:"And I've got nothing to say"},{time:94.07,text:"I can't believe I didn't fall right down on my face"},{time:97.06,text:"(I was confused)"},{time:98.00,text:"Looking everywhere only to find"},{time:100.08,text:"That it's not the way I have imagined it all in my mind"},{time:102.93,text:"(So what am I)"},{time:103.93,text:"What do I have but negativity"},{time:105.85,text:"'Cause I can't justify the way everyone is looking at me"},{time:108.80,text:"(Nothing to lose)"},{time:109.81,text:"Nothing to gain, hollow and alone"},{time:111.80,text:"And the fault is my own, and the fault is my own"},{time:114.80,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:120.66,text:"I wanna let go of the pain I've felt so long"},{time:124.58,text:"(Erase all the pain till it's gone)"},{time:126.62,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:132.62,text:"I wanna find something I've wanted all along"},{time:137.49,text:"Somewhere I belong"},{time:139.83,text:"I will never know myself until I do this on my own"},{time:145.68,text:"And I will never feel anything else until my wounds are healed"},{time:151.58,text:"I will never be anything till I break away from me"},{time:157.46,text:"I will break away, I'll find myself today"},{time:167.15,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:173.99,text:"I wanna let go of the pain I've felt so long"},{time:178.11,text:"(Erase all the pain till it's gone)"},{time:179.95,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:185.86,text:"I wanna find something I've wanted all along"},{time:190.82,text:"Somewhere I belong"},{time:193.22,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:198.93,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:208.66,text:"Somewhere I belong"}
];

export const LyricsSidebar = ({ 
  track, 
  album,
  progress = 0
}: { 
  track: Track | null;
  album: Album | null;
  progress?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const isSomewhereIBelong = track?.title === "Somewhere I Belong";
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

  // Smooth scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div 
      ref={containerRef}
      className="w-80 h-full bg-[#050505]/40 border-l border-white/20 backdrop-blur-[64px] p-6 overflow-y-auto scrollbar-hide flex flex-col z-20 transition-all duration-300" 
      style={{ scrollbarWidth: 'none' }}
    >
      {track ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-8 shrink-0">
            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">{track.title}</h2>
            <p className="text-sm font-medium text-white/70 drop-shadow-md">{album?.artist}</p>
          </div>
          
          {/* Lyrics Content */}
          <div className="flex-1 text-lg tracking-wide pb-[50vh]">
            {activeLyrics ? (
              <div className="space-y-6">
                {activeLyrics.map((line, i) => {
                  const isActive = i === activeIndex;
                  const isPast = i < activeIndex;
                  return (
                    <p 
                      key={i}
                      ref={isActive ? activeLineRef : null}
                      className={`transition-all duration-500 font-bold ${
                        isActive 
                          ? 'text-white scale-[1.02] transform origin-left drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                          : isPast 
                            ? 'text-white/40' 
                            : 'text-white/30'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6 text-white/50 font-medium">
                <p>♪</p>
                <p>Letra no disponible aún...</p>
                <p className="text-sm text-white/30 font-normal">(Esta es una vista previa del panel de letras. Aquí se integraría la API de letras en el futuro).</p>
                <p>♪</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-white/40 font-medium drop-shadow-sm">
          <p>Reproduce una canción</p>
        </div>
      )}
    </div>
  );
};
