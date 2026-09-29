const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

player = player.replace(
  'onClick={() => setVolume && setVolume(100)}',
  'onClick={() => setVolume && setVolume(100)} onMouseEnter={() => setVolume && setVolume(100)}'
);

player = player.replace(
  'onClick={() => setVolume && setVolume(0)}',
  'onClick={() => setVolume && setVolume(0)} onMouseEnter={() => setVolume && setVolume(0)}'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully added onMouseEnter to volume icons.');

