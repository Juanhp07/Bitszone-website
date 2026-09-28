const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

const oldTopRow = `{/* Top row: Icon + Text */}
          <div className="flex items-center justify-between w-full relative z-10">
             <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
               <HardDrive className="w-3.5 h-3.5" />
               <span className="text-[10px] font-semibold uppercase tracking-widest">Almacenamiento</span>
             </div>
             <span className="text-white/80 text-[11px] font-medium tracking-wide font-mono">
               {availableGB.toFixed(2)}GB <span className="text-white/30">/ 5.0GB</span>
             </span>
          </div>`;

const newTopRow = `{/* Top row: Icon + Text */}
          <div className="flex flex-col items-start w-full relative z-10 gap-1">
             <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
               <HardDrive className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold capitalize tracking-wide">Almacenamiento</span>
             </div>
             <span className="text-white/80 text-[11px] font-medium tracking-wide font-mono pl-[22px]">
               {availableGB.toFixed(2)}GB <span className="text-white/40">de 5.0GB</span>
             </span>
          </div>`;

if (sidebar.includes(oldTopRow)) {
  sidebar = sidebar.replace(oldTopRow, newTopRow);
  fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
  console.log('Top row updated successfully.');
} else {
  console.log('Could not find exact top row string. Trying regex...');
  const regex = /\{\/\* Top row: Icon \+ Text \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
  if (regex.test(sidebar)) {
      sidebar = sidebar.replace(regex, newTopRow);
      fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
      console.log('Top row updated successfully using regex.');
  } else {
      console.log('Regex also failed.');
  }
}
