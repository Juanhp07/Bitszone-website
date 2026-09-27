const fs = require('fs');
let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Change Sidebar wrapper to be absolute and overlay the content
file = file.replace(
  /<div className={`h-full shrink-0 relative z-10 transition-all duration-300 overflow-hidden \${isSidebarOpen \? 'w-64' : 'w-0'}`}>/g,
  '<div className={`absolute top-0 left-0 h-full z-40 transition-all duration-300 overflow-hidden ${isSidebarOpen ? \'w-64\' : \'w-0\'}`}>'
);

// We need to add left margin to the Main Content when Sidebar is open so it's not permanently covered? 
// Or maybe the user *wants* it covered.
// Wait, if it's absolute and overlays the content, the content on the left will be permanently covered if we don't add padding/margin.
// In many apps, the Sidebar pushes the content.
// If we want it to push AND blur, the content must be positioned behind it, meaning padding-left on the content container that animates.
