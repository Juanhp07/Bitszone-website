const fs = require('fs');

let main = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// handleEnded
main = main.replace('const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);', 'const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;');
main = main.replace('if (currentIndex < nowPlayingAlbum.tracks.length - 1) {', 'if (currentIndex !== -1 && currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {');
main = main.replace('const nextTrack = nowPlayingAlbum.tracks[currentIndex + 1];', 'const nextTrack = nowPlayingAlbum.tracks![currentIndex + 1];');

// handleNextTrack
main = main.replace('const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);', 'const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;');
main = main.replace('if (currentIndex < nowPlayingAlbum.tracks.length - 1) {', 'if (currentIndex !== -1 && currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {');
main = main.replace('handlePlayTrack(nowPlayingAlbum.tracks[currentIndex + 1], nowPlayingAlbum);', 'handlePlayTrack(nowPlayingAlbum.tracks![currentIndex + 1], nowPlayingAlbum);');

// handlePrevTrack
main = main.replace('const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);', 'const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;');
main = main.replace('handlePlayTrack(nowPlayingAlbum.tracks[currentIndex - 1], nowPlayingAlbum);', 'handlePlayTrack(nowPlayingAlbum.tracks![currentIndex - 1], nowPlayingAlbum);');

// album cover
main = main.replace('backgroundImage: currentView === \'album\' && (selectedAlbumFull || selectedAlbum) ? `url(${(selectedAlbumFull || selectedAlbum).coverUrl})` : \'none\'', 'backgroundImage: currentView === \'album\' && (selectedAlbumFull || selectedAlbum) ? `url(${(selectedAlbumFull || selectedAlbum)?.coverUrl})` : \'none\'');

fs.writeFileSync('src/components/player/MainApp.tsx', main);
console.log('Fixed MainApp.tsx');
