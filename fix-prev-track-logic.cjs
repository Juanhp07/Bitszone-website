const fs = require('fs');

let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // Si la canción ha avanzado más de 5 segundos, la reiniciamos
    if (audioRef.current && audioRef.current.currentTime > 5) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      // Ensure it plays if it was paused
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }`;

const replacementStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // El UI muestra un tiempo escalado basado en track.duration.
    // Necesitamos verificar si el tiempo visual ha pasado de 5 segundos (5000 ms).
    const visualTimeMs = progress * (nowPlayingTrack.duration || 0);
    
    // Si la canción ha avanzado más de 5 segundos (visuales), la reiniciamos
    if (audioRef.current && visualTimeMs > 5000) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      // Ensure it plays if it was paused
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Successfully updated prev track logic to use visualTimeMs.');

