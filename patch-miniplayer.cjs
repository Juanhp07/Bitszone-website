const fs = require('fs');

// Patch ImmersivePlayer opacity
let immersive = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');
immersive = immersive.replace(/'text-white\/80 hover:text-white'/g, "'text-white/60 hover:text-white/90'");
immersive = immersive.replace(/'text-white\/50'/g, "'text-white/40'");
fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', immersive);

// Patch MiniPlayer style for wave mask
let mini = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');
const miniStyleFind = `style={{
                   backgroundImage: \`url("\${waveSvg}")\`,
                   backgroundRepeat: 'repeat-x',
                   backgroundPosition: 'left center',
                   backgroundSize: '24px 12px'
                 }}`;
const miniStyleReplace = `style={{
                   backgroundImage: \`url("\${waveSvg}")\`,
                   backgroundRepeat: 'repeat-x',
                   backgroundPosition: 'left center',
                   backgroundSize: '24px 12px',
                   maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)',
                   WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)'
                 }}`;
if (mini.includes(miniStyleFind)) {
    mini = mini.replace(miniStyleFind, miniStyleReplace);
} else {
    console.error("Could not find the MiniPlayer style block! Trying regex fallback...");
    // Fallback: replace the block ignoring exact spaces
    mini = mini.replace(/backgroundSize:\s*'24px 12px'\s*}}/g, "backgroundSize: '24px 12px',\n                   maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)',\n                   WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)'\n                 }}");
}
fs.writeFileSync('src/components/player/MiniPlayer.tsx', mini);

console.log('Patched ImmersivePlayer text opacity and MiniPlayer wavy line mask');
