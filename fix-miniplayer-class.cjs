const fs = require('fs');
let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

code = code.replace(
  'opacity-50 saturate-150" style={{ backgroundImage: `url(${(track.albumCover || album.coverUrl)})`, backgroundSize: \'cover\', backgroundPosition: \'center\', filter: \'blur(60px)\', maskImage: \'linear-gradient(115deg, black 10%, transparent 60%)\', WebkitMaskImage: \'linear-gradient(115deg, black 10%, transparent 60%)\' }} className="animate-mask-wave"',
  'opacity-50 saturate-150 animate-mask-wave" style={{ backgroundImage: `url(${(track.albumCover || album.coverUrl)})`, backgroundSize: \'cover\', backgroundPosition: \'center\', filter: \'blur(60px)\', maskImage: \'linear-gradient(115deg, black 10%, transparent 60%)\', WebkitMaskImage: \'linear-gradient(115deg, black 10%, transparent 60%)\' }}'
);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('Fixed dual className');
