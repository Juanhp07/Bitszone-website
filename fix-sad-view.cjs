const fs = require('fs');
let code = fs.readFileSync('src/components/player/SadView.tsx', 'utf8');

code = code.replace(
  'w-64 h-64',
  'w-80 h-80'
);

// We should also replace the placeholder with the GIF in SadView.tsx if track is null?
// It uses `track?.albumCover || "https://images..."` so it will pick up the new GIF automatically!

fs.writeFileSync('src/components/player/SadView.tsx', code);
console.log('Enlarged image in SadView');
