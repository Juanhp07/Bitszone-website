const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Change parent container to justify-end pb-12
code = code.replace(
  '<div className="w-[65%] h-full relative flex flex-col items-center justify-center group">',
  '<div className="w-[65%] h-full relative flex flex-col items-center justify-end pb-12 xl:pb-16 group">'
);

// Update floating content animation
code = code.replace(
  "activeTab === 'letra' ? 'translate-y-[28vh] scale-[0.65]' : 'translate-y-0 scale-100'",
  "activeTab === 'letra' ? 'translate-y-4 scale-[0.8] opacity-30' : 'translate-y-0 scale-100 opacity-100'"
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer layout to be bottom-aligned');
