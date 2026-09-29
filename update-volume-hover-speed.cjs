const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Remove hover from max volume icon
player = player.replace(
  'onClick={() => setVolume && setVolume(100)} onMouseEnter={() => setVolume && setVolume(100)}',
  'onClick={() => setVolume && setVolume(100)}'
);

// 2. Remove hover from mute icon
player = player.replace(
  'onClick={() => setVolume && setVolume(0)} onMouseEnter={() => setVolume && setVolume(0)}',
  'onClick={() => setVolume && setVolume(0)}'
);

// 3. Make the transition faster for the volume lines
// The current code has: className={`w-6 h-1 rounded-full transition-all duration-300 ${isActive ? ...`}
player = player.replace(
  /w-6 h-1 rounded-full transition-all duration-300/g,
  'w-6 h-1 rounded-full transition-all duration-100'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully updated volume icons and line transition speed.');

