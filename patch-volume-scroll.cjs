const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// The original volume container mapping code:
const oldVolumeContainer = `<div className="flex flex-col gap-[6px]">
               {Array.from({ length: 10 }).map((_, i) => {
                 const level = (10 - i) * 10;
                 const isActive = (volume || 0) >= level;
                 return (
                   <button
                     key={level}
                     onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }} onMouseEnter={() => setVolume && setVolume(level)}
                     className="p-1 flex items-center justify-center group/line"
                   >
                     <div className={\`w-6 h-1 rounded-full transition-all duration-100 \${isActive ? 'bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}\`} />
                   </button>
                 );
               })}
             </div>`;

const newVolumeContainer = `<div 
               className="flex flex-col gap-[6px]"
               onWheel={(e) => {
                 e.stopPropagation();
                 if (!setVolume) return;
                 const delta = e.deltaY;
                 const currentVol = volume || 0;
                 let newVol = currentVol;
                 if (delta > 0) newVol = Math.max(0, currentVol - 10);
                 if (delta < 0) newVol = Math.min(100, currentVol + 10);
                 if (newVol !== currentVol) {
                   setVolume(newVol);
                 }
               }}
             >
               {Array.from({ length: 10 }).map((_, i) => {
                 const level = (10 - i) * 10;
                 const isActive = (volume || 0) >= level;
                 return (
                   <button
                     key={level}
                     onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }}
                     className="p-1 flex items-center justify-center group/line"
                   >
                     <div className={\`w-6 h-1 rounded-full transition-all duration-100 \${isActive ? 'bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}\`} />
                   </button>
                 );
               })}
             </div>`;

if (code.includes('onMouseEnter={() => setVolume && setVolume(level)}')) {
    code = code.replace(oldVolumeContainer, newVolumeContainer);
    fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
    console.log('Patched volume control to use scroll instead of hover');
} else {
    console.log('Could not find the exact volume container string to replace.');
}
