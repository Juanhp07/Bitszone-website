const fs = require('fs');

let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(nowPlayingAlbum.tracks[currentIndex - 1], nowPlayingAlbum);
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };`;

const replacementStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // If song has played for more than 3 seconds (or ~5%), restart the current song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      // Ensure it plays if it was paused
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }

    const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(nowPlayingAlbum.tracks[currentIndex - 1], nowPlayingAlbum);
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Successfully updated handlePrevTrack logic.');

