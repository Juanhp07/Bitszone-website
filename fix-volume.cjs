const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const targetDiv = '<div className="w-[65%] h-full relative flex flex-col items-center justify-center">';

const replacement = `<div className="w-[65%] h-full relative flex flex-col items-center justify-center group">
           {/* Vertical Volume Control (Appears on Hover) */}
           <div className="absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
             <button onClick={() => setVolume && setVolume(100)} className="mb-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon">
               <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" />
             </button>
             <div className="flex flex-col gap-[6px]">
               {Array.from({ length: 10 }).map((_, i) => {
                 const level = (10 - i) * 10;
                 const isActive = (volume || 0) >= level;
                 return (
                   <button
                     key={level}
                     onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }}
                     className="p-1 flex items-center justify-center group/line"
                   >
                     <div className={\`w-6 h-1 rounded-full transition-all duration-300 \${isActive ? 'bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}\`} />
                   </button>
                 );
               })}
             </div>
             <button onClick={() => setVolume && setVolume(0)} className="mt-2 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group/icon">
               <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white" />
             </button>
           </div>`;

player = player.replace(targetDiv, replacement);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully added vertical volume control.');

