const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldFormat = `    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });`;
const newFormat = `    return d.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');`;

content = content.replace(oldFormat, newFormat);
fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Date fixed!');
