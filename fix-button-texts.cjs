const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Replace Hero clear all button
content = content.replace(
  /\{type === 'downloads' \? 'Vaciar Mis descargas' : 'Vaciar Biblioteca'\}/g,
  "'Eliminar todo'"
);

// 2. Replace album clear button
content = content.replace(
  /Vaciar solo esta lista/g,
  "Eliminar lista"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Button texts replaced!');
