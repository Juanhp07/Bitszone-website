const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Change the parent container to shift it down and avoid the top controls
const oldWrapper = "className={`absolute top-0 left-0 right-0 h-[55vh] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";
const newWrapper = "className={`absolute top-[15vh] left-0 right-0 h-[45vh] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";

code = code.replace(oldWrapper, newWrapper);

// Also increase the fade area slightly on the mask so it fades completely before hitting the top boundary
const oldMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
const newMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'";
const oldWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'";
const newWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'";

code = code.replace(oldMask, newMask).replace(oldWebkitMask, newWebkitMask);

// Ensure the padding inside is good enough to scroll freely
code = code.replace('className="w-full h-full overflow-y-auto px-8 py-12 flex flex-col items-center gap-4"', 'className="w-full h-full overflow-y-auto px-8 py-16 flex flex-col items-center gap-6"');

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched static lyrics to lower them and fix top fade');
