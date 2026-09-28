const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

// 1. Remove the background gradient on the button and use bg-white/5
sidebar = sidebar.replace('bg-gradient-to-b from-white/[0.04] to-transparent', 'bg-white/5');

// 2. Remove font-mono from the numbers and increase text size to text-xs
sidebar = sidebar.replace('text-white/80 text-[11px] font-medium tracking-wide font-mono pl-[22px]', 'text-white/80 text-xs font-medium tracking-wide pl-[22px]');

// 3. Increase title text size to text-xs
sidebar = sidebar.replace('text-[11px] font-semibold capitalize tracking-wide">Almacenamiento', 'text-xs font-semibold capitalize tracking-wide">Almacenamiento');

// 4. Remove the background glow div
const glowRegex = /\{\/\* Subtle background glow based on usage \*\/\}[\s\S]*?<\/button>/;
sidebar = sidebar.replace(glowRegex, '</button>');

fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
console.log('Sidebar adjustments applied successfully.');
