const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

player = player.replace(
  'className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"',
  'className="flex-1 h-2.5 md:h-3 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully increased timeline height.');

