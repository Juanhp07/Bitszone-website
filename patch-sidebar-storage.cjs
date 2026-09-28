const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

// Add HardDrive import
sidebar = sidebar.replace(
  'import { Home, Library, DownloadCloud } from "lucide-react";',
  'import { Home, Library, DownloadCloud, HardDrive } from "lucide-react";'
);

const oldStorage = `<div className="p-6">
        <button
          onClick={() => onViewChange("downloads")}
          className="relative w-full flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-colors group"
        >
          {/* Progress fill */}
          <div
            className={\`absolute left-0 top-0 bottom-0 transition-all duration-500 \${
              availablePercent >= 50
                ? "bg-green-500/40"
                : availablePercent >= 15
                  ? "bg-yellow-500/40"
                  : "bg-red-500/40"
            }\`}
            style={{ width: \`\${usedPercent}%\` }}
          />
          <span className="relative z-10 text-white/70 text-xs font-medium tracking-wide group-hover:text-white transition-colors">
            {availableGB.toFixed(2)}GB / 5GB libres
          </span>
        </button>
      </div>`;

const newStorage = `<div className="p-6">
        <button
          onClick={() => onViewChange("downloads")}
          className="relative w-full flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 group overflow-hidden"
        >
          {/* Top row: Icon + Text */}
          <div className="flex items-center justify-between w-full relative z-10">
             <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
               <HardDrive className="w-3.5 h-3.5" />
               <span className="text-[10px] font-semibold uppercase tracking-widest">Almacenamiento</span>
             </div>
             <span className="text-white/80 text-[11px] font-medium tracking-wide font-mono">
               {availableGB.toFixed(2)}GB <span className="text-white/30">/ 5.0GB</span>
             </span>
          </div>
          
          {/* Modern Slim Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden relative z-10 shadow-inner">
             <div 
                className={\`h-full rounded-full transition-all duration-700 relative \${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                }\`}
                style={{ width: \`\${usedPercent}%\` }}
             >
                {/* Shine effect on the bar */}
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
             </div>
          </div>
          
          {/* Subtle background glow based on usage */}
          <div 
             className={\`absolute -bottom-6 -right-6 w-24 h-24 blur-3xl rounded-full opacity-10 transition-all duration-700 group-hover:opacity-30 \${
                availablePercent >= 50 ? "bg-green-500" : availablePercent >= 15 ? "bg-yellow-500" : "bg-red-500"
             }\`} 
          />
        </button>
      </div>`;

if (sidebar.includes(oldStorage)) {
  sidebar = sidebar.replace(oldStorage, newStorage);
  fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
  console.log('Sidebar updated successfully.');
} else {
  console.log('Could not find old storage block.');
  // Try regex in case of slight spacing differences
  const regex = /<div className="p-6">\s*<button[\s\S]*?availableGB\.toFixed\(2\)\}GB \/ 5GB libres[\s\S]*?<\/button>\s*<\/div>/;
  if (regex.test(sidebar)) {
      sidebar = sidebar.replace(regex, newStorage);
      fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
      console.log('Sidebar updated successfully using regex.');
  } else {
      console.log('Regex also failed.');
  }
}
