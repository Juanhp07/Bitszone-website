const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Remove single quotes from the button text
content = content.replace(
  />\s*'Eliminar todo'\s*<\/button>/g,
  ">\n              Eliminar todo\n            </button>"
);

// 2. Change modal header
content = content.replace(
  /\{type === 'downloads' \? '¿Eliminar todas las descargas\?' : '¿Vaciar favoritos\?'\}/g,
  "{type === 'downloads' ? '¿Vaciar todas las descargas?' : '¿Vaciar todos los favoritos?'}"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Fixed quotes and modal header!');
