const fs = require('fs');
let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Revert previous pt-20
file = file.replace(
  /<div className="w-full h-full pt-20 flex overflow-hidden relative z-10">/g,
  '<div className="w-full h-full flex overflow-hidden relative z-10">'
);

// We need to add pt-20 to the internal main scroll container so the content starts below the TopNav
// Actually, let's add it to the `<main>` or its inner `<div>`
file = file.replace(
  /<div className="pb-12 h-full">/g,
  '<div className="pt-24 pb-12 min-h-full">' // pt-24 (6rem = 96px) ensures it clears the 80px TopNav + some padding
);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
