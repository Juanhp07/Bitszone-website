const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Revert Title in MainApp.tsx
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
mainApp = mainApp.replace(/title="Mi Biblioteca"/g, 'title="Canciones favoritas"');
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);


// 2. Fix focus ring on Tabs
// Let's replace the whole class for Canciones and Albumes buttons

const regexCanciones = /<button \s*onClick=\{\(\) => \{ setViewMode\('canciones'\); setSelectedAlbumId\(null\); \}\}\s*className=\{`px-6 py-1\.5 rounded-full text-sm font-semibold transition-all \$\{viewMode === 'canciones' \? 'bg-\[#a855f7\]\/20 text-\[#c084fc\] shadow-md border border-\[#a855f7\]\/30 focus:outline-none' : 'border border-transparent focus:outline-none text-white\/50 hover:text-white'\}`\}\s*>\s*Canciones\s*<\/button>/g;

const newCanciones = `<button 
            onClick={() => { setViewMode('canciones'); setSelectedAlbumId(null); }} 
            className={\`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all \${viewMode === 'canciones' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}\`}
          >
            Canciones
          </button>`;

const regexAlbumes = /<button \s*onClick=\{\(\) => \{ setViewMode\('albumes'\); setSelectedAlbumId\(null\); \}\}\s*className=\{`px-6 py-1\.5 rounded-full text-sm font-semibold transition-all \$\{viewMode === 'albumes' \? 'bg-\[#a855f7\]\/20 text-\[#c084fc\] shadow-md border border-\[#a855f7\]\/30 focus:outline-none' : 'border border-transparent focus:outline-none text-white\/50 hover:text-white'\}`\}\s*>\s*Álbumes\s*<\/button>/g;

const newAlbumes = `<button 
            onClick={() => { setViewMode('albumes'); setSelectedAlbumId(null); }} 
            className={\`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all \${viewMode === 'albumes' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}\`}
          >
            Álbumes
          </button>`;

if (code.match(regexCanciones)) {
  code = code.replace(regexCanciones, newCanciones);
} else {
  console.log("Canciones tab not found");
}

if (code.match(regexAlbumes)) {
  code = code.replace(regexAlbumes, newAlbumes);
} else {
  console.log("Albumes tab not found");
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated Tabs and Reverted Title");
