const fs = require('fs');
let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Revert flex container to relative without z-index (removes it from stacking context trapping)
file = file.replace(
  /{\/\* Main Container - Sidebar Flush, Body Floating \*\/}\n\s*<div className="w-full h-full flex overflow-hidden relative z-20">/,
  `{/* Main Container - Sidebar Flush, Body Floating */}
      <div className="w-full h-full flex overflow-hidden relative">`
);

// 2. Set Glass Layer to z-20
file = file.replace(
  /<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">/,
  '<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">'
);

// 3. Set Sidebar Wrapper to z-30
file = file.replace(
  /<div className={\`h-full shrink-0 relative z-10 transition-all duration-300 overflow-hidden \${isSidebarOpen \? 'w-64' : 'w-0'}\`}>/,
  `<div className={\`h-full shrink-0 relative z-30 transition-all duration-300 overflow-hidden \${isSidebarOpen ? 'w-64' : 'w-0'}\`}>`
);

// 4. Set Main Content to z-10
file = file.replace(
  /{\/\* Full-bleed Main Content container \*\/}\n\s*<div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">/,
  `{/* Full-bleed Main Content container */}
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">`
);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
