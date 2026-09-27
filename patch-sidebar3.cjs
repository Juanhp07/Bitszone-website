const fs = require('fs');
let file = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

file = file.replace(
  /<aside className="w-full h-full flex flex-col bg-black">/g,
  '<aside className="w-full h-full flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/5 pt-20">'
);

fs.writeFileSync('src/components/player/Sidebar.tsx', file);
