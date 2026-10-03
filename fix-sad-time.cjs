const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Update duration from "0:00" to 236846
code = code.replace(
  'duration: "0:00",',
  'duration: 236846,'
);

// 2. Add currentTime = 28 in play sequence
const targetPlay = `          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = trackData.url;
            audioRef.current.load();
            audioRef.current.play().catch(e => {
              console.error("Sad play failed:", e);
              // Fallback to unescaped URL
              audioRef.current!.src = trackData.url.replace('%20', ' ');
              audioRef.current!.play().catch(console.error);
            });
          }`;

const newPlay = `          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = trackData.url;
            audioRef.current.load();
            
            // Wait for metadata to be loaded before setting currentTime
            const onLoadedMetadata = () => {
               audioRef.current!.currentTime = 28;
               audioRef.current!.removeEventListener('loadedmetadata', onLoadedMetadata);
            };
            audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
            
            audioRef.current.play().catch(e => {
              console.error("Sad play failed:", e);
              audioRef.current!.src = trackData.url.replace('%20', ' ');
              audioRef.current!.addEventListener('loadedmetadata', onLoadedMetadata);
              audioRef.current!.play().catch(console.error);
            });
          }`;
code = code.replace(targetPlay, newPlay);

// 3. Update handleTimeUpdate to crop the track
const targetTimeUpdate = `    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
      }
    };`;

const newTimeUpdate = `    const handleTimeUpdate = () => {
      if (audioRef.current) {
        if (nowPlayingTrack?.id === 9999991) {
          if (audioRef.current.currentTime >= 74) {
            audioRef.current.pause();
            audioRef.current.currentTime = 28;
            setIsPlaying(false);
          } else if (audioRef.current.currentTime < 27.5 && audioRef.current.currentTime > 0) {
            // Failsafe in case loadedmetadata didn't trigger fast enough or user scrubbed back
            audioRef.current.currentTime = 28;
          }
        }
        setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
      }
    };`;
code = code.replace(targetTimeUpdate, newTimeUpdate);

// 4. Also limit scrubbing in handleSeek?
// If we check handleTimeUpdate, it might be enough, but let's check if handleSeek exists in the file.
fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Fixed time and track cropping');
