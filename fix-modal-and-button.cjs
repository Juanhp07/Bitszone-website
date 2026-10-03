const fs = require('fs');

// 1. Fix Modal in LibraryView.tsx
let libraryCode = fs.readFileSync('src/components/player/LibraryView.tsx', 'utf8');

// Increase modal width from w-[240px] to w-[280px]
libraryCode = libraryCode.replace(/w-\[240px\]/, 'w-[280px]');

// Add whitespace-nowrap to DropdownItem to guarantee a single line
libraryCode = libraryCode.replace(
  /<span className="text-\[15px\] font-normal tracking-wide text-left" style=\{\{ WebkitTextStroke: '0' \}\}>/g,
  '<span className="text-[15px] font-normal tracking-wide text-left whitespace-nowrap" style={{ WebkitTextStroke: \'0\' }}>'
);

fs.writeFileSync('src/components/player/LibraryView.tsx', libraryCode);

// 2. Fix HoldButton in DownloadsView.tsx
let downloadsCode = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldBtnClass = /className="flex items-center gap-2 px-4 py-2 rounded-full bg-white\/5 hover:bg-white\/10 text-white\/70 hover:text-white transition-colors border border-white\/10 text-sm font-medium"/;
const newBtnClass = 'className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-white/30 transition-all border border-transparent hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/10 text-sm font-medium"';

if (downloadsCode.match(oldBtnClass)) {
  downloadsCode = downloadsCode.replace(oldBtnClass, newBtnClass);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', downloadsCode);
  console.log("Successfully updated modal width and HoldButton styles.");
} else {
  console.log("Could not find HoldButton class to replace in DownloadsView.");
}
