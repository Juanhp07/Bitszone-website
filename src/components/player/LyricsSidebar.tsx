import React, { useEffect, useRef } from 'react';
import type { Track, Album } from './types';

const somewhereIBelongLyrics = [
  {time: 40.51,text:"When it began"},{time: 41.95,text:"I had nothing to say"},{time: 43.62,text:"And I get lost in the nothingness inside of me"},{time: 46.50,text:"(I was confused)"},{time: 47.39,text:"And I let it all out to find"},{time: 49.40,text:"That I'm not the only person with these things in mind"},{time: 52.33,text:"(Inside of me)"},{time: 53.25,text:"But all that they can see the words revealed"},{time: 55.48,text:"Is the only real thing that I've got left to feel"},{time: 58.25,text:"(Nothing to lose)"},{time: 59.16,text:"Just stuck, hollow and alone"},{time: 61.24,text:"And the fault is my own, and the fault is my own"},{time: 64.33,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 70.14,text:"I wanna let go of the pain I've felt so long"},{time: 74.10,text:"(Erase all the pain till it's gone)"},{time: 76.09,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 82.00,text:"I wanna find something I've wanted all along"},{time: 86.89,text:"Somewhere I belong"},{time: 89.29,text:"And I've got nothing to say"},{time: 90.87,text:"I can't believe I didn't fall right down on my face"},{time: 93.86,text:"(I was confused)"},{time: 94.80,text:"Looking everywhere only to find"},{time: 96.88,text:"That it's not the way I have imagined it all in my mind"},{time: 99.73,text:"(So what am I)"},{time: 100.73,text:"What do I have but negativity"},{time: 102.65,text:"'Cause I can't justify the way everyone is looking at me"},{time: 105.60,text:"(Nothing to lose)"},{time: 106.61,text:"Nothing to gain, hollow and alone"},{time: 108.60,text:"And the fault is my own, and the fault is my own"},{time: 111.60,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 117.46,text:"I wanna let go of the pain I've felt so long"},{time: 121.38,text:"(Erase all the pain till it's gone)"},{time: 123.42,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 129.42,text:"I wanna find something I've wanted all along"},{time: 134.29,text:"Somewhere I belong"},{time: 136.63,text:"I will never know myself until I do this on my own"},{time: 142.48,text:"And I will never feel anything else until my wounds are healed"},{time: 148.38,text:"I will never be anything till I break away from me"},{time: 154.26,text:"I will break away, I'll find myself today"},{time: 163.95,text:"I wanna heal, I wanna feel, what I thought was never real"},{time: 170.79,text:"I wanna let go of the pain I've felt so long"},{time: 174.91,text:"(Erase all the pain till it's gone)"},{time: 176.75,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time: 182.66,text:"I wanna find something I've wanted all along"},{time: 187.62,text:"Somewhere I belong"},{time: 190.02,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time: 195.73,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time: 205.46,text:"Somewhere I belong"}
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
          top: elementOffset - (containerHeight / 2) + (elementHeight / 2),
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
            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">{track.title}</h2>
            <p className="text-sm font-medium text-white/70 drop-shadow-md">{album?.artist}</p>
          </div>
          
          {/* Lyrics Content (Scrollable with Mask) */}
          <div 
            ref={containerRef}
            className="relative flex-1 overflow-y-auto scrollbar-hide px-6 pb-8 text-lg tracking-wide"
            style={{ 
              scrollbarWidth: 'none',
              maskImage: 'linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 32px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 32px), transparent 100%)'
            }}
          >
            {activeLyrics ? (
              <div className="space-y-6 pt-4">
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
              <div className="space-y-6 pt-4 text-white/50 font-medium">
                <p>♪</p>
                <p>Letra no disponible aún...</p>
                <p className="text-sm text-white/30 font-normal">(Esta es una vista previa del panel de letras. Aquí se integraría la API de letras en el futuro).</p>
                <p>♪</p>
              </div>
            )}
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
