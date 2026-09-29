const fs = require('fs');

// Patch ImmersivePlayer
let immersive = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Text opacity
immersive = immersive.replace(/'text-white\/40 hover:text-white\/80'/g, "'text-white/80 hover:text-white'");
immersive = immersive.replace(/'text-white\/30'/g, "'text-white/50'");

// 2. Wave thicker
const oldWaveSvg = "const waveSvg = \"data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E\";";
const newWaveSvg = "const waveSvg = \"data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E\";";
immersive = immersive.replace(oldWaveSvg, newWaveSvg);

// 3. Unplayed line thicker
immersive = immersive.replace(/h-\[2px\] bg-white\/20/g, "h-[4px] bg-white/30");

// 4. Dot slightly bigger
immersive = immersive.replace(/w-3\.5 h-3\.5 bg-white/g, "w-4 h-4 bg-white");

// 5. Add mask to the wavy line so its start is natural
const oldWavyStyle = `style={{
                           backgroundImage: \`url("\${waveSvg}")\`,
                           backgroundRepeat: 'repeat-x',
                           backgroundPosition: 'left center',
                           backgroundSize: '24px 12px'
                         }}`;
const newWavyStyle = `style={{
                           backgroundImage: \`url("\${waveSvg}")\`,
                           backgroundRepeat: 'repeat-x',
                           backgroundPosition: 'left center',
                           backgroundSize: '24px 12px',
                           maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)',
                           WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)'
                         }}`;
immersive = immersive.replace(oldWavyStyle, newWavyStyle);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', immersive);

// Patch MiniPlayer
let mini = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

mini = mini.replace(oldWaveSvg, newWaveSvg);
mini = mini.replace(/h-\[2px\] bg-white\/20/g, "h-[4px] bg-white/30");
mini = mini.replace(/w-3\.5 h-3\.5 bg-white/g, "w-4 h-4 bg-white");
mini = mini.replace(oldWavyStyle, newWavyStyle);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', mini);

console.log('Patched ImmersivePlayer and MiniPlayer timelines and opacities');
