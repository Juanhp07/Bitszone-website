const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Replace dynamic gradient w-[60%] with w-full, remove the maskImage from it because it shouldn't cut.
// We want it to span the whole screen and just smoothly fade.
const oldGradient = `<div className="absolute top-0 left-0 bottom-0 w-[60%] z-0 pointer-events-none overflow-hidden" style={{ maskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)' }}>
           <img 
             src={album.coverUrl} 
             className="w-full h-full object-cover blur-[100px] saturate-[2.5] opacity-60 scale-150 transform origin-left" 
             alt=""
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A]/20 via-[#05050A]/60 to-[#05050A]" />
        </div>`;

const newGradient = `<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-0 left-0 bottom-0 w-[150%]">
             <img 
               src={album.coverUrl} 
               className="w-full h-full object-cover blur-[120px] saturate-[2.0] opacity-50 transform origin-left" 
               alt=""
             />
           </div>
           {/* Fade heavily to black towards the right side so the cover image can shine */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#05050A]/80 to-[#05050A]" />
        </div>`;

if (code.includes(oldGradient)) {
    code = code.replace(oldGradient, newGradient);
} else {
    console.log("Could not find exact oldGradient block. Using regex...");
    const regex = /\{\/\*\s*Dynamic Gradient[\s\S]*?<div className="absolute inset-0 bg-gradient-to-r from-\[#05050A\]\/20 via-\[#05050A\]\/60 to-\[#05050A\]" \/>\s*<\/div>/;
    code = code.replace(regex, `{/* Dynamic Gradient from Album Colors (Focused on Tracklist) */}
        ${newGradient}`);
}

// Right section cover fades
// Make it so the right section cover image is definitely fading smoothly
const oldCover = `<div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)' }}>
             <img 
               src={album.coverUrl} 
               alt="Artist/Album Cover" 
               className={\`absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80" />
           </div>`;

const newCover = `<div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 40%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 40%, black 100%)' }}>
             <img 
               src={album.coverUrl} 
               alt="Artist/Album Cover" 
               className={\`absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/80 via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80" />
           </div>`;

code = code.replace(oldCover, newCover);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer dynamic background and cover masks');
