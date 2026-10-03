const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Update the Search Placeholder
const searchInputRegex = /placeholder={type === 'downloads' \? "Buscar en descargas\.\.\." : "Buscar en favoritos\.\.\."}/;
const newSearchPlaceholder = `placeholder={type === 'downloads' ? 'Buscar en descargas' : type === 'licenses' ? 'Buscar en licencias' : type === 'playlists' ? 'Buscar en listas' : 'Buscar en favoritos'}`;

code = code.replace(searchInputRegex, newSearchPlaceholder);
// Also remove ellipsis from any other place if it exists
code = code.replace(/"Buscar en descargas\.\.\."/g, '"Buscar en descargas"');
code = code.replace(/"Buscar en favoritos\.\.\."/g, '"Buscar en favoritos"');

// 2. Update the HoldButton onComplete for clearing items
const oldHoldButton = `onComplete={() => {
            if (type === 'downloads') {
              clearDownloads();
            } else {
              clearFavorites();
            }
          }}`;

const newHoldButton = `onComplete={() => {
            if (type === 'downloads') {
              clearDownloads();
            } else if (type === 'favorites') {
              clearFavorites();
            } else if (type === 'licenses') {
              // clearLicenses();
            } else if (type === 'playlists') {
              // clearPlaylists();
            }
          }}`;

if (code.includes(oldHoldButton)) {
  code = code.replace(oldHoldButton, newHoldButton);
} else {
  // If formatting differs, let's just do a more robust regex replacement
  const holdBtnRegex = /onComplete={\(\) => {\s*if \(type === 'downloads'\) {\s*clearDownloads\(\);\s*} else {\s*clearFavorites\(\);\s*}\s*}}/m;
  code = code.replace(holdBtnRegex, newHoldButton);
}

// 3. Make the title thicker with a text stroke
const oldTitle = `<div className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</div>`;
const newTitle = `<div className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)', WebkitTextStroke: '1px currentColor' }}>{title}</div>`;
code = code.replace(oldTitle, newTitle);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated DownloadsView with new placeholder, clear logic, and thicker title.");
