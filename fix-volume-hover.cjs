const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const targetStr = 'onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }}';
const replacementStr = 'onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }} onMouseEnter={() => setVolume && setVolume(level)}';

player = player.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully added onMouseEnter to volume lines.');

