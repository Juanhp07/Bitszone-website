const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Replace the tracklist area div to use mask-image instead of background gradients
const tracklistTarget = `<div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[140px] pb-0">
           {/* Deep fade masks for Top, Bottom, and Right edges to avoid harsh cuts */}
           <div className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b from-[#05050A] via-[#05050A]/90 to-transparent z-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent z-20 pointer-events-none" />
           <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />
           
           <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] transition-all duration-700 pb-20 pt-2" style={{ scrollbarWidth: 'none' }}>`;

const tracklistReplace = `<div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[140px] pb-0">
           <div 
             className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] transition-all duration-700 pb-20 pt-2" 
             style={{ 
               scrollbarWidth: 'none',
               maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to left, transparent 0%, black 10%, black 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to left, transparent 0%, black 10%, black 100%)',
               maskComposite: 'intersect',
               WebkitMaskComposite: 'source-in'
             }}>`;

// I'll just use simple top/bottom mask for now, it's safer and widely supported:
const safeTracklistReplace = `<div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[140px] pb-0">
           <div 
             className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] transition-all duration-700 pb-20 pt-2" 
             style={{ 
               scrollbarWidth: 'none',
               maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)'
             }}>`;

code = code.replace(tracklistTarget, safeTracklistReplace);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched tracklist masks');
