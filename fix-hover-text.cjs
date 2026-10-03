const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Fix the text 'Eliminar todo' -> 'Mantener para eliminar'
code = code.replace(/Eliminar todo/g, 'Mantener para eliminar');

// 2. Fix the hover color for the heart icon in DownloadsView
// text-[#a855f7] hover:text-[#ef4444]
code = code.replace(/text-\[#a855f7\] hover:text-\[#ef4444\]/g, 'text-[#a855f7] hover:text-[#b066f8]');

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Fixed text and hover color");
