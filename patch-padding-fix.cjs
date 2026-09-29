const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');
code = code.replace('py-[120px]', 'py-[60px]');
fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Padding updated to 60px');
