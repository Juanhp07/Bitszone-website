const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldGrid = `className="grid grid-cols-[50px_1fr_120px_100px_100px_40px]`;
const newGrid = `className="grid grid-cols-[50px_1fr_150px_100px_100px_40px]`;

content = content.replace(new RegExp(oldGrid.replace(/[.*+?^$\{value}()|[\]\\]/g, '\\$&'), 'g'), newGrid);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Grid width fixed!');
