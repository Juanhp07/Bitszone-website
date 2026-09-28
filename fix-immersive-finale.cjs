const fs = require('fs');

let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

if (!mainApp.includes('onSeek={') && mainApp.includes('onToggleMute={toggleMute}')) {
  mainApp = mainApp.replace(
    'onToggleMute={toggleMute}',
    'onSeek={(p) => {\n          if (audioRef.current && audioRef.current.duration) {\n            audioRef.current.currentTime = p * audioRef.current.duration;\n          }\n        }}\n        onToggleMute={toggleMute}'
  );
  fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
  console.log('MainApp updated with onSeek for ImmersivePlayer');
}

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add onSeek prop type
player = player.replace(
  'onToggleMute?: () => void',
  'onToggleMute?: () => void,\n  onSeek?: (progress: number) => void'
);
player = player.replace(
  'onToggleMute\n}:',
  'onToggleMute,\n  onSeek\n}:'
);

// 2. Remove X Button
const xButtonRegex = /\{\/\* Close Button \*\/\}\s*<button[\s\S]*?<X className="w-6 h-6" \/>\s*<\/button>/;
player = player.replace(xButtonRegex, '');

// 3. Add ARTISTAS Title
player = player.replace(
  '{/* 1. LEFT: Tracklist */}',
  '{/* 1. LEFT: Tracklist */}\n        <div className="absolute top-12 left-12 xl:left-20 z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">Artistas</div>'
);

// 4. Add Track Numbers
const trackMapRegex = /<div\s+key=\{t\.id\}[\s\S]*?>\s*\{t\.title\}\s*<\/div>/g;
player = player.replace(trackMapRegex, (match) => {
  // It's easier to just do a direct string replace if possible, but let's carefully construct it
  return `<div 
                   key={t.id} 
                   onClick={() => onPlayTrack && onPlayTrack(t, album)}
                   className={\`text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 \${
                     isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.4)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'
                   }\`}
                 >
                   <div className="flex items-center gap-4 md:gap-6">
                     <span className={\`text-base md:text-lg xl:text-xl font-medium tracking-widest \${isActive ? 'text-[#a855f7]/60' : 'text-white/10'}\`}>
                       {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                     </span>
                     <span className="line-clamp-1">{t.title}</span>
                   </div>
                 </div>`;
});

// 5. Album Title above visualizer
player = player.replace(
  '{/* 2. CENTER: Visualizer & Controls */}',
  `{/* 2. CENTER: Visualizer & Controls */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[35%] flex flex-col items-center justify-center z-30 pointer-events-none">
           <h2 className="text-3xl md:text-4xl xl:text-5xl font-serif italic text-white drop-shadow-lg text-center line-clamp-1 px-4">{album.title}</h2>
           <p className="text-white/40 text-xs md:text-sm mt-3 tracking-[0.3em] uppercase text-center">{album.artist}</p>
        </div>`
);

// 6. Interactive Visualizer
const visualizerCode = `{/* Bars */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 opacity-90 pointer-events-none">`;

const interactiveLayer = `{/* Interactive Seek Layer */}
              <div 
                 className="absolute inset-0 z-0 cursor-pointer"
                 onClick={(e) => {
                    if (!onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    onSeek(percent);
                 }}
              />
              {/* Bars */}`;

player = player.replace('{/* Bars */}', interactiveLayer);

// 7. Cover Right Fade
player = player.replace(
  '<div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-[#05050A]/40 to-transparent z-10 pointer-events-none" />',
  '<div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-[#05050A]/40 to-transparent z-10 pointer-events-none" />\n           <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#05050A] to-transparent z-10 pointer-events-none" />'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('ImmersivePlayer updated with all requested details.');
