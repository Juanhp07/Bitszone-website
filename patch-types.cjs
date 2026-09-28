const fs = require('fs');

let content = fs.readFileSync('src/components/player/types.ts', 'utf8');

if (!content.includes('addedAt')) {
  content = content.replace(
    /albumCover\?: string;/,
    "albumCover?: string;\n  addedAt?: string;\n  sizeMb?: number;"
  );
  fs.writeFileSync('src/components/player/types.ts', content);
  console.log('types.ts patched');
}
