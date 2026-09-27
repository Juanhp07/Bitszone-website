const fs = require('fs');

// --- Sidebar.tsx ---
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  /bg-black\/30 backdrop-blur-xl border-r border-white\/10/g,
  'bg-transparent'
);
fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);

// --- TopNav.tsx ---
let topnav = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');
topnav = topnav.replace(
  /bg-black\/30 backdrop-blur-xl flex items-center px-8 relative z-20 shrink-0 border-b border-white\/10/g,
  'bg-transparent flex items-center px-8 relative z-20 shrink-0'
);
fs.writeFileSync('src/components/player/TopNav.tsx', topnav);

