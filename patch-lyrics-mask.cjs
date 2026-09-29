const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Update the mask to have a much wider, smoother fade to prevent sharp cuts
const oldMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
const newMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'";
const oldWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
const newWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'";

code = code.replace(oldMask, newMask).replace(oldWebkitMask, newWebkitMask);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched lyrics mask for smoother fade at top and bottom');
