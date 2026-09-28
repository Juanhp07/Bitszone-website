const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Move Pistas down and match padding
player = player.replace(
  '<div className="absolute top-12 left-12 xl:left-20 z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">Pistas</div>',
  '<div className="absolute top-28 left-12 xl:left-[5rem] z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">PISTAS</div>'
);

// 2. Reduce the bottom fade mask so the text can reach lower
player = player.replace(
  '<div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent z-20 pointer-events-none" />',
  '<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent z-20 pointer-events-none" />'
);

// 3. Reduce the padding-bottom of the scrollable list so it occupies the remaining space
player = player.replace(
  `pb-40 pt-4" style={{ scrollbarWidth: 'none' }}>`,
  `pb-20 pt-4" style={{ scrollbarWidth: 'none' }}>`
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Fixed PISTAS text position and reduced bottom empty space.');

