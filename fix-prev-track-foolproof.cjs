const fs = require('fs');

let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetStr = `  const handlePrevTrack = () => {
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

const replacementStr = `  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // Solución extrema a prueba de fallos:
    // Solo leemos el currentTime nativo del elemento de audio.
    // Dado que el audio real es un preview de 30 segundos y el UI escala esto a la duración total,
    // 5 segundos visuales equivalen aproximadamente a 0.5 a 0.8 segundos de tiempo de reproducción real.
    // Usaremos un umbral estricto de 0.5 segundos reales.
    if (audioRef.current && audioRef.current.currentTime >= 0.5) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Successfully updated prev track logic to foolproof version.');

