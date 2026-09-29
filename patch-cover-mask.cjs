const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const targetImg = `<img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className={\`absolute inset-0 w-full h-full object-cover z-0 grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
           />`;

const replacement = `<img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className={\`absolute inset-0 w-full h-full object-cover z-0 grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
             style={{ 
               maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
               WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)'
             }}
           />`;

let newCode = code.replace(targetImg, replacement);
fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', newCode);
console.log('Patched ImmersivePlayer right section cover mask');
