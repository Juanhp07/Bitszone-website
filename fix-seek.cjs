const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetSeek = `onSeek={(p) => {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = p * audioRef.current.duration;
            setProgress(p);
          }
        }}`;

const newSeek = `onSeek={(p) => {
          if (audioRef.current && audioRef.current.duration) {
            let newTime = p * audioRef.current.duration;
            if (nowPlayingTrack?.id === 9999991) {
               if (newTime < 28) newTime = 28;
               if (newTime > 74) newTime = 74;
            }
            audioRef.current.currentTime = newTime;
            setProgress(newTime / audioRef.current.duration);
          }
        }}`;

code = code.replace(targetSeek, newSeek); // This replaces the one in MiniPlayer

// Let's also replace the one in ImmersivePlayer (which is the first match)
const targetSeek2 = `onSeek={(p) => {
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = p * audioRef.current.duration;
                      setProgress(p);
                    }
                  }}`;

const newSeek2 = `onSeek={(p) => {
                    if (audioRef.current && audioRef.current.duration) {
                      let newTime = p * audioRef.current.duration;
                      if (nowPlayingTrack?.id === 9999991) {
                         if (newTime < 28) newTime = 28;
                         if (newTime > 74) newTime = 74;
                      }
                      audioRef.current.currentTime = newTime;
                      setProgress(newTime / audioRef.current.duration);
                    }
                  }}`;

code = code.replace(targetSeek2, newSeek2);

// And update the failsafe in timeupdate to not check > 0
code = code.replace(
  '} else if (audioRef.current.currentTime < 27.5 && audioRef.current.currentTime > 0) {',
  '} else if (audioRef.current.currentTime < 27.5) {'
);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Fixed onSeek boundaries');
