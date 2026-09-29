const fs = require('fs');

let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetStr = `  const handlePrevTrack = () => {
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

const replacementStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // Calcula el tiempo real basado directamente en la referencia de audio (sin depender del estado de React)
    let visualTimeMs = 0;
    let actualTimeSecs = 0;
    
    if (audioRef.current) {
      actualTimeSecs = audioRef.current.currentTime || 0;
      const durationSecs = audioRef.current.duration || 1;
      const currentRatio = actualTimeSecs / durationSecs;
      visualTimeMs = currentRatio * (nowPlayingTrack.duration || 0);
    }
    
    // Reiniciar si:
    // 1. El tiempo visual (simulado) supera los 4 segundos (4000 ms).
    // 2. O si el tiempo real del clip de audio superó 1 segundo (fallback súper seguro).
    if (audioRef.current && (visualTimeMs >= 4000 || actualTimeSecs >= 1)) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Successfully updated prev track logic to be ultra robust.');

