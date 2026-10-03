const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const gifUrl = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTFrMXZ5YWcxdTVqNDIyZ3lhdjBheGlzc3c0eHczNncwNDVhZzQzbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3dfEA0VTslup2/giphy.gif";

// 1. Replace album covers
code = code.replace(
  /albumCover: ".*?"/,
  `albumCover: "${gifUrl}"`
);
code = code.replace(
  /coverUrl: ".*?"/,
  `coverUrl: "${gifUrl}"`
);

// 2. Change duration to 46000
code = code.replace(
  'duration: 236846,',
  'duration: 46000,'
);

// 3. Fix timeupdate logic for progress
const timeUpdateTarget = `        setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);`;
const newTimeUpdate = `        let p = audioRef.current.currentTime / audioRef.current.duration || 0;
        if (nowPlayingTrack?.id === 9999991) {
           p = Math.max(0, Math.min(1, (audioRef.current.currentTime - 28) / 46));
        }
        setProgress(p);`;
code = code.replace(timeUpdateTarget, newTimeUpdate);

// 4. Fix onSeek logic (there are two)
const onSeekTarget1 = `                      let newTime = p * audioRef.current.duration;
                      if (nowPlayingTrack?.id === 9999991) {
                         if (newTime < 28) newTime = 28;
                         if (newTime > 74) newTime = 74;
                      }
                      audioRef.current.currentTime = newTime;
                      setProgress(newTime / audioRef.current.duration);`;
                      
const onSeekNew1 = `                      let newTime = p * audioRef.current.duration;
                      if (nowPlayingTrack?.id === 9999991) {
                         newTime = 28 + (p * 46);
                      }
                      audioRef.current.currentTime = newTime;
                      setProgress(p);`;

code = code.replace(onSeekTarget1, onSeekNew1); // ImmersivePlayer

const onSeekTarget2 = `            let newTime = p * audioRef.current.duration;
            if (nowPlayingTrack?.id === 9999991) {
               if (newTime < 28) newTime = 28;
               if (newTime > 74) newTime = 74;
            }
            audioRef.current.currentTime = newTime;
            setProgress(newTime / audioRef.current.duration);`;
            
const onSeekNew2 = `            let newTime = p * audioRef.current.duration;
            if (nowPlayingTrack?.id === 9999991) {
               newTime = 28 + (p * 46);
            }
            audioRef.current.currentTime = newTime;
            setProgress(p);`;

code = code.replace(onSeekTarget2, onSeekNew2); // MiniPlayer

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Fixed time scale and replaced image with GIF in MainApp');
