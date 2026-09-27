const fs = require('fs');
let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Add an orb to the root container behind everything so the blur on the Sidebar is visible
file = file.replace(
  /<div className="w-full h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative">/g,
  `<div className="w-full h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col relative">
      {/* Root background orb so the sidebar blur is visible */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#a855f7]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>`
);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
