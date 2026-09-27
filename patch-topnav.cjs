const fs = require('fs');
let file = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');

file = file.replace(
  /className="h-20 w-full bg-black flex items-center px-8 relative z-20 shrink-0 border-b border-transparent"/g,
  'className="h-20 w-full bg-black/40 backdrop-blur-xl flex items-center px-8 relative z-20 shrink-0 border-b border-white/5"'
);

fs.writeFileSync('src/components/player/TopNav.tsx', file);
