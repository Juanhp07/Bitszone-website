const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Fix Artist
code = code.replace(
  'artist: "Los Románticos",',
  'artist: "Papillon",'
);

code = code.replace(
  'artist: "Desconocido",',
  'artist: "Papillon",' // update album artist too
);

// Fix URL bucket from 'music' to 'songs'
code = code.replace(
  /public\/music\/Triste/g,
  'public/songs/Triste'
);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Fixed artist name and storage bucket in MainApp.tsx');
