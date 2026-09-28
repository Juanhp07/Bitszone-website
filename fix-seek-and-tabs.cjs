const fs = require('fs');

// 1. Fix MainApp to pass onSeek to ImmersivePlayer
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
const oldImmersiveEnd = `onToggleMute={toggleMute}\n      />`;
const newImmersiveEnd = `onToggleMute={toggleMute}\n        onSeek={(p) => {\n          if (audioRef.current && audioRef.current.duration) {\n            audioRef.current.currentTime = p * audioRef.current.duration;\n          }\n        }}\n      />`;
if (!mainApp.includes('onSeek={') || mainApp.indexOf('onSeek={') === mainApp.lastIndexOf('onSeek={')) {
  // If there's only one onSeek (which is in MiniPlayer), replace the ending of ImmersivePlayer to add the second onSeek
  mainApp = mainApp.replace(oldImmersiveEnd, newImmersiveEnd);
  fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
  console.log('MainApp updated with onSeek');
} else {
  // Try another approach to inject it
  mainApp = mainApp.replace(
    /onToggleMute=\{toggleMute\}\s*\/\>/,
    'onToggleMute={toggleMute}\n        onSeek={(p) => { if (audioRef.current && audioRef.current.duration) { audioRef.current.currentTime = p * audioRef.current.duration; } }}\n      />'
  );
  fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
  console.log('MainApp updated with onSeek (regex fallback)');
}


// 2. Fix ImmersivePlayer to center the tabs
let immersive = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Also, prevent clicking the buttons from seeking
// To do this, wrap the button calls in e.stopPropagation()
immersive = immersive.replace(
  'onClick={onPrev}',
  'onClick={(e) => { e.stopPropagation(); if(onPrev) onPrev(); }}'
);
immersive = immersive.replace(
  'onClick={togglePlay}',
  'onClick={(e) => { e.stopPropagation(); togglePlay(); }}'
);
immersive = immersive.replace(
  'onClick={onNext}',
  'onClick={(e) => { e.stopPropagation(); if(onNext) onNext(); }}'
);

// Center the Portada/Letra tabs horizontally
const oldTabs = 'className="absolute top-10 right-16 z-20 flex gap-8 text-xs font-bold tracking-[0.2em] uppercase"';
const newTabs = 'className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex gap-8 text-xs font-bold tracking-[0.2em] uppercase"';
immersive = immersive.replace(oldTabs, newTabs);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', immersive);
console.log('ImmersivePlayer updated');

