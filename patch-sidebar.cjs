const fs = require('fs');
let file = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

file = file.replace(
  /<aside className="h-full bg-black flex flex-col">/g,
  '<aside className="h-full bg-black flex flex-col pt-20">'
);

fs.writeFileSync('src/components/player/Sidebar.tsx', file);
