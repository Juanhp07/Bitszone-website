const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Replace "Vaciar Todo" with "Eliminar todo"
content = content.replace(
  /Vaciar Todo/g,
  "Eliminar todo"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Modal text replaced!');
