const fs = require('fs');
let content = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// The second occurrence still has the old download button inside the overlay
content = content.replace(
  /<div className="absolute inset-0 bg-black\/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">[\s\S]*?<button \n\s*className="w-14 h-14 bg-\[#a855f7\] hover:bg-\[#b066f8\] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"/,
  `<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"`
);

fs.writeFileSync('src/components/player/CatalogView.tsx', content);
