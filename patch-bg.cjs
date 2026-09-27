const fs = require('fs');

// --- MainApp.tsx ---
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Replace the old global background block
const oldGlobalBg = `{/* Global Background Orbs and Noise */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#a855f7]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0"></div>`;

const newGlobalBg = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>`;

mainApp = mainApp.replace(oldGlobalBg, newGlobalBg);

// Remove the local top gradient from main content
const oldLocalGradient = `{/* Top gradient inside main content */}
              <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none z-0"></div>`;

mainApp = mainApp.replace(oldLocalGradient, '');

fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

// --- Sidebar.tsx ---
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  /bg-black\/40 backdrop-blur-xl border-r border-white\/5/g,
  'bg-black/30 backdrop-blur-xl border-r border-white/10'
);
fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);

// --- TopNav.tsx ---
let topnav = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');
topnav = topnav.replace(
  /bg-black\/40 backdrop-blur-xl flex items-center px-8 relative z-20 shrink-0 border-b border-white\/5/g,
  'bg-black/30 backdrop-blur-xl flex items-center px-8 relative z-20 shrink-0 border-b border-white/10'
);
fs.writeFileSync('src/components/player/TopNav.tsx', topnav);

