const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Fix Sync Offset
// Previous: progress * (track.duration / 1000) + 2.5;
code = code.replace(
    /const currentSecs = progress \* \(track\.duration \/ 1000\) \+ 2\.5;/,
    "const currentSecs = progress * (track.duration / 1000) - 26; // Offset to 40.5s start"
);

// 2. Fix container bounds
const parentContainerRegex = /className=\{\`absolute top-0 left-0 right-0 bottom-\[220px\] xl:bottom-\[280px\] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-\[cubic-bezier\(0\.16,1,0\.3,1\)\] \$\{activeTab === 'letra' \? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'\}\`\}/;
const newParentContainer = "className={`absolute top-0 left-0 right-0 h-[60vh] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";
code = code.replace(parentContainerRegex, newParentContainer);

// 3. Fix inner container classes
const innerContainerRegex = /className="w-full h-full max-h-\[60vh\] overflow-y-auto px-8 py-\[30vh\] flex flex-col items-center gap-6"/;
const newInnerContainer = 'className="w-full h-full overflow-y-auto px-8 py-[25vh] flex flex-col items-center gap-4"';
code = code.replace(innerContainerRegex, newInnerContainer);

// 4. Smaller Text Sizes
// Active text
code = code.replace(
    /'text-3xl md:text-5xl text-white drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.6\)\] scale-110'/g,
    "'text-2xl md:text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'"
);
// Inactive passed text
code = code.replace(
    /'text-xl md:text-3xl text-white\/40 hover:text-white\/70'/g,
    "'text-lg md:text-2xl text-white/40 hover:text-white/70'"
);
// Inactive upcoming text
code = code.replace(
    /'text-xl md:text-3xl text-white\/20 hover:text-white\/50'/g,
    "'text-lg md:text-2xl text-white/20 hover:text-white/50'"
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer lyrics (v3)');
