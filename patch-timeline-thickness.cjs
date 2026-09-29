const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Thicken the time numbers
const oldTextSizes = "${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-xs'}";
const newTextSizes = "${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-sm md:text-base'}";
code = code.replace(oldTextSizes, newTextSizes);

// 2. Thicken the unplayed straight line
code = code.replace('className="absolute left-0 right-0 h-[4px] bg-white/30 rounded-full"', 'className="absolute left-0 right-0 h-[6px] bg-white/30 rounded-full"');

// 3. Make the thumb dot slightly bigger to match
code = code.replace('className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"', 'className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"');

// 4. Update the wave SVG to stroke-width 6 with a safer viewBox to prevent clipping
const oldSvg = "const waveSvg = \"data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E\";";
const newSvg = "const waveSvg = \"data:image/svg+xml,%3Csvg width='24' height='20' viewBox='0 0 24 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10C4 4 8 16 12 10C16 4 20 16 24 10' stroke='%23ffffff' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E\";";
code = code.replace(oldSvg, newSvg);

// 5. Update the background sizing for the wavy line since height changed
const oldBackgroundStyle = "backgroundSize: '24px 12px',";
const newBackgroundStyle = "backgroundSize: '24px 20px',";
code = code.replace(oldBackgroundStyle, newBackgroundStyle);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched timeline thickness and time numbers');
