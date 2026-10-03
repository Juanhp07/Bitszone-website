const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

code = code.replace(
  'NodeJS.Timeout',
  'ReturnType<typeof setTimeout>'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
