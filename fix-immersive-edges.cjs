const fs = require('fs');

let playerCode = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Replace the old combined fade mask with top, bottom, and right distinct fades
const oldFade = `{/* Fade mask for top and bottom */}
           <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #05050A 0%, transparent 15%, transparent 85%, #05050A 100%)' }} />`;

const newFades = `{/* Deep fade masks for Top, Bottom, and Right edges to avoid harsh cuts */}
           <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />`;

playerCode = playerCode.replace(oldFade, newFades);

// 2. Reduce the glow on the active track
const oldActiveTrack = `isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'`;

const newActiveTrack = `isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.4)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'`;

playerCode = playerCode.replace(oldActiveTrack, newActiveTrack);

// Let's also make sure line-clamp isn't causing hard cuts without ellipsis, though line-clamp-1 does add ... 
// But just in case, the right fade fixes any visual hard edge anyway.

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', playerCode);
console.log('ImmersivePlayer updated with deep edge fades and reduced text glow.');
