const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Search placeholder
code = code.replace(/Buscar en descargas\.\.\./g, 'Buscar en descargas');
code = code.replace(/Buscar en tu Biblioteca\.\.\./g, 'Buscar en tu Biblioteca');

// Tab buttons
code = code.replace(
  /className=\{`px-6 py-1\.5 rounded-full text-sm font-semibold transition-all \$\{viewMode === 'canciones' \? 'bg-\[#a855f7\]\/20 text-\[#c084fc\] shadow-md border border-\[#a855f7\]\/30' : 'text-white\/50 hover:text-white'\}`\}/g,
  "className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'canciones' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}`}"
);

code = code.replace(
  /className=\{`px-6 py-1\.5 rounded-full text-sm font-semibold transition-all \$\{viewMode === 'albumes' \? 'bg-\[#a855f7\]\/20 text-\[#c084fc\] shadow-md border border-\[#a855f7\]\/30' : 'text-white\/50 hover:text-white'\}`\}/g,
  "className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'albumes' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}`}"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated UI fixes");
