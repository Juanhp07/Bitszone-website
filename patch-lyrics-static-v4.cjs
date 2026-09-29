const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const parentWrapperOld = /className=\{\`absolute top-\[15vh\] left-0 right-0 h-\[45vh\] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-\[cubic-bezier\(0\.16,1,0\.3,1\)\] \$\{activeTab === 'letra' \? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'\}\`\}/;

const parentWrapperNew = "className={`absolute top-[150px] left-0 right-0 bottom-[300px] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}`}";

code = code.replace(parentWrapperOld, parentWrapperNew);

// Make the fade mask more aggressive so it vanishes deeply before the edges
const oldMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'";
const newMask = "maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";
const oldWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'";
const newWebkitMask = "WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'";

code = code.replace(oldMask, newMask).replace(oldWebkitMask, newWebkitMask);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched static lyrics to use fixed pixel bounds top-[150px] and bottom-[300px] to guarantee no overlap');
