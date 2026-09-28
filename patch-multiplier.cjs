const fs = require('fs');

let cat = fs.readFileSync('src/components/player/useCatalog.ts', 'utf8');
cat = cat.replace(
  /sizeMb: t\.size_mb \|\| t\.size \|\| \(t\.duration \/ 1000 \* 0\.0390625\)/g,
  'sizeMb: t.size_mb || t.size || (t.duration / 1000 * 0.023)'
);
fs.writeFileSync('src/components/player/useCatalog.ts', cat);

let ctx = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');
ctx = ctx.replace(
  /sum \+ \(t\.sizeMb \|\| \(t\.duration \/ 1000 \* 0\.0390625\)\)/g,
  'sum + (t.sizeMb || (t.duration / 1000 * 0.023))'
);
fs.writeFileSync('src/components/player/DownloadsContext.tsx', ctx);

console.log('Multipliers patched');
