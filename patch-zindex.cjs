const fs = require('fs');

let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Change Glass Layer to z-10
file = file.replace(
  /<div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">/g,
  '<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">'
);

// Change Main Container to z-20
file = file.replace(
  /{\/\* Main Container - Sidebar Flush, Body Floating \*\/}\n\s*<div className="w-full h-full flex overflow-hidden relative z-10">/g,
  `{/* Main Container - Sidebar Flush, Body Floating */}
      <div className="w-full h-full flex overflow-hidden relative z-20">`
);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
