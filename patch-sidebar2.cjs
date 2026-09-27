const fs = require('fs');
let file = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

file = file.replace(
  /<aside className="h-full bg-black flex flex-col pt-20">/g,
  '<aside className="h-full bg-black/40 backdrop-blur-xl flex flex-col pt-20 border-r border-white/5">'
);

fs.writeFileSync('src/components/player/Sidebar.tsx', file);
