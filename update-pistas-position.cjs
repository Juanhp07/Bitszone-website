const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Update PISTAS text position
player = player.replace(
  'className="absolute top-36 left-12 xl:left-[5rem] z-30',
  'className="absolute top-[180px] left-12 xl:left-[5rem] z-30'
);

// Update Container Padding
player = player.replace(
  'className="w-[35%] h-full relative overflow-hidden flex flex-col pt-36 pb-0"',
  'className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[260px] pb-0"'
);

// Update Top fade mask height
player = player.replace(
  'className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b',
  'className="absolute top-0 left-0 right-0 h-[240px] bg-gradient-to-b'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully updated PISTAS position and spacing.');

