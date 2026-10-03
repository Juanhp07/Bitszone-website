const fs = require('fs');

// 1. Fix audio playback in MainApp.tsx
let mainCode = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldSetters = `          setNowPlayingAlbum(sadAlbum as any);
          setNowPlayingTrack(trackData as any);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }`;

const newSetters = `          setNowPlayingAlbum(sadAlbum as any);
          setNowPlayingTrack(trackData as any);
          setIsPlaying(true);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = trackData.url;
              audioRef.current.play().catch(console.error);
            }
          }, 100);
        } else {
          setIsPlaying(false);
          if (audioRef.current) {
             audioRef.current.pause();
          }
        }`;

mainCode = mainCode.replace(oldSetters, newSetters);
fs.writeFileSync('src/components/player/MainApp.tsx', mainCode);

// 2. Fix text wrapping in Sidebar.tsx
let sidebarCode = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

sidebarCode = sidebarCode.replace(
  'Para Fabrizzio y Johan</span>',
  'Para Fabrizzio y Johan</span>' // just to check where it is
);
sidebarCode = sidebarCode.replace(
  'font-medium tracking-wide text-sm transition-opacity',
  'font-medium tracking-wide text-[13px] whitespace-nowrap truncate transition-opacity'
);

fs.writeFileSync('src/components/player/Sidebar.tsx', sidebarCode);
console.log('Fixed autoplay and button text wrapping');
