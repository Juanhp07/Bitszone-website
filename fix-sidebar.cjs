const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(
  'currentView === "catalog"\n              ? "text-white bg-white/10 shadow-sm"',
  "['catalog', 'album', 'artist'].includes(currentView)\n              ? \"text-white bg-white/10 shadow-sm\""
);

const oldBadge = 'className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white text-[10px] font-bold animate-sparkle"';
const newBadge = 'className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-[#a855f7] border border-white/20 text-white text-[10px] font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-in zoom-in duration-300"';
sidebar = sidebar.replace(oldBadge, newBadge);

fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
console.log('Sidebar fixed');
