const fs = require('fs');

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// Replace opacity-30 and opacity-20 with opacity-50 and opacity-40, and normalize saturation to 150
code = code.replace(
  'className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-30 saturate-100"',
  'className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-150"'
);

code = code.replace(
  'className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-20 saturate-150"',
  'className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-40 saturate-150"'
);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('Successfully bumped intensity slightly');
