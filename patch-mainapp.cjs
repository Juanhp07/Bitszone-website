const fs = require('fs');
let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Change TopNav wrapper
file = file.replace(
  /<div className="relative z-20 shrink-0">/g,
  '<div className="absolute top-0 left-0 right-0 z-50">'
);

// We need the main container to take the full screen and add padding top so content starts below TopNav
file = file.replace(
  /<!-- Main Container - Sidebar Flush, Body Floating -->/,
  '{/* Main Container - Sidebar Flush, Body Floating */}'
);

// We change the flex-1 container to take the whole screen but add pt-20
file = file.replace(
  /<div className="flex-1 flex overflow-hidden relative z-10">/g,
  '<div className="w-full h-full pt-20 flex overflow-hidden relative z-10">'
);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
