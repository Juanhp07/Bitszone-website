const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add massive padding to the top and bottom so the text starts *after* the fade zone
const oldInner = 'className="w-full h-full overflow-y-auto px-8 py-8 flex flex-col items-center gap-4"';
const newInner = 'className="w-full h-full overflow-y-auto px-8 py-[120px] flex flex-col items-center gap-4"';
code = code.replace(oldInner, newInner);

// 2. Reduce the mask fade percentage slightly from 35% to 25% so it's not so aggressive,
// and the 120px padding will easily push the text past this 25% fade zone.
const oldMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'";
const newMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";
const oldWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'";
const newWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";
code = code.replace(oldMask, newMask).replace(oldWebkitMask, newWebkitMask);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched lyrics with py-[120px] and 25% mask');
