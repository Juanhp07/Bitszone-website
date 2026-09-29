const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// The line currently has `opacity-30`
const targetLine = "className={`relative z-30 flex flex-col items-center justify-center w-full px-8 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'translate-y-4 scale-[0.8] opacity-30' : 'translate-y-0 scale-100 opacity-100'}`}";
const newLine = "className={`relative z-30 flex flex-col items-center justify-center w-full px-8 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'translate-y-4 scale-[0.9] opacity-100' : 'translate-y-0 scale-100 opacity-100'}`}";

code = code.replace(targetLine, newLine);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched floating content to be opacity-100 instead of opacity-30');
