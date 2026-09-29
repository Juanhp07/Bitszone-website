const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Fix the parent container wrapper
const oldWrapper = "className={`absolute top-[150px] left-0 right-0 bottom-[300px] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";
const newWrapper = "className={`absolute top-[90px] left-0 right-0 bottom-[360px] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";
code = code.replace(oldWrapper, newWrapper);

// 2. Fix the inner container padding and gap
const oldInner = 'className="w-full h-full overflow-y-auto px-8 py-16 flex flex-col items-center gap-6"';
const newInner = 'className="w-full h-full overflow-y-auto px-8 py-8 flex flex-col items-center gap-4"';
code = code.replace(oldInner, newInner);

// 3. Make the mask slightly sharper at the edges to maximize visible space
const oldMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";
const newMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
const oldWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";
const newWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
code = code.replace(oldMask, newMask).replace(oldWebkitMask, newWebkitMask);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched layout: top-90px, bottom-360px, py-8');
