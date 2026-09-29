const fs = require('fs');

// ImmersivePlayer.tsx
let imp = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');
imp = imp.replace('onPrev();', 'onPrev?.();');
imp = imp.replace('onNext();', 'onNext?.();');
fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', imp);

// MainApp.tsx
let main = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
main = main.replace(/nowPlayingAlbum\.tracks\.findIndex/g, 'nowPlayingAlbum.tracks?.findIndex');
main = main.replace(/nowPlayingAlbum\.tracks\.length/g, '(nowPlayingAlbum.tracks?.length || 0)');
main = main.replace(/nowPlayingAlbum\.tracks\[/g, 'nowPlayingAlbum.tracks?.[');
main = main.replace(/\(selectedAlbumFull \|\| selectedAlbum\)\.coverUrl/g, '(selectedAlbumFull || selectedAlbum)?.coverUrl');
fs.writeFileSync('src/components/player/MainApp.tsx', main);

console.log('Fixed TS errors in ImmersivePlayer and MainApp');

