const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Adjust the maskImage fade so the text isn't dimmed for such a huge vertical area
code = code.split("maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)'").join("maskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)'");
code = code.split("WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)'").join("WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)'");

// 2. Brighten inactive track title
code = code.split("'text-white/20 hover:text-white/50'").join("'text-white/40 hover:text-white/80'");

// 3. Brighten active track title
code = code.split("'text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.4)] translate-x-4'").join("'text-[#c084fc] drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] translate-x-4'");

// 4. Brighten inactive track numbers
code = code.split("isActive ? 'text-[#a855f7]/60' : 'text-white/10'").join("isActive ? 'text-[#c084fc]/80' : 'text-white/30'");

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer tracklist brightness');
