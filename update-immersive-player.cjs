const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add imports
if (!player.includes('useDownloads')) {
  player = player.replace(
    'import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown } from \'lucide-react\';',
    'import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, Heart } from \'lucide-react\';\nimport { useDownloads } from \'./DownloadsContext\';'
  );
}

// 2. Add useDownloads hook
if (!player.includes('const { isFavorite } = useDownloads();')) {
  player = player.replace(
    "const [activeTab, setActiveTab] = React.useState<'portada' | 'letra'>('portada');",
    "const [activeTab, setActiveTab] = React.useState<'portada' | 'letra'>('portada');\n  const { isFavorite } = useDownloads();"
  );
}

// 3. Add formatting helper
if (!player.includes('const formatTime')) {
  player = player.replace(
    'const wave = ',
    `const formatTime = (ms?: number) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return \`\${m}:\${s.toString().padStart(2, '0')}\`;
  };

  const wave = `
  );
}

// 4. Update the track list mapping to include Heart icon for favorites
const trackNumberRegex = /<span className="text-\[10px\] md:text-xs tracking-\[0\.2em\] font-bold \$\{isActive \? 'text-\[\#a855f7\]' : 'text-white\/20'\}">\s*\{\(i \+ 1\)\.toString\(\)\.padStart\(2, '0'\)\}\s*<\/span>/;
if (player.match(trackNumberRegex)) {
  player = player.replace(
    trackNumberRegex,
    `<div className="flex items-center gap-2">
                  {isFavorite(t.id) && <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#a855f7]" fill="currentColor" />}
                  <span className={\`text-[10px] md:text-xs tracking-[0.2em] font-bold \${isActive ? 'text-[#a855f7]' : 'text-white/20'}\`}>
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                </div>`
  );
} else {
  // If we can't find the exact match, let's find the span and replace it more loosely
  const looseRegex = /<span className="text-\[10px\] md:text-xs tracking-\[0\.2em\] font-bold[\s\S]*?<\/span>/;
  if (player.match(looseRegex)) {
    const match = player.match(looseRegex)[0];
    player = player.replace(
      match,
      `<div className="flex items-center gap-2 w-10">
                  {isFavorite(t.id) && <Heart className="w-3 h-3 text-[#a855f7]" fill="currentColor" />}
                  ${match}
                </div>`
    );
  }
}

// 5. Update the "Letra" view transition and add the progress bar
// Specifically, replacing the floating content and controls.
const floatingContentRegex = /\{\/\*\s*Floating Content: Info & Controls\s*\*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<\/>,\s*document\.body)/;

const newFloatingContent = `{/* Floating Content: Info & Controls */}
           <div className={\`relative z-30 flex flex-col items-center justify-center w-full px-8 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'translate-y-[28vh] scale-[0.65]' : 'translate-y-0 scale-100'}\`}>
              <h2 className={\`text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white drop-shadow-lg text-center leading-tight [text-shadow:_0_4px_30px_rgba(0,0,0,0.8),_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-[1200ms] \${activeTab === 'letra' ? 'mb-2' : 'mb-4'}\`}>
                {album.title}
              </h2>
              <p className={\`text-white/70 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)] transition-all duration-[1200ms] \${activeTab === 'letra' ? 'mb-8' : 'mb-12'}\`}>
                {album.artist}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-8 md:gap-12 mb-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipBack className="w-5 h-5 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform" fill="currentColor" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] group"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-95 transition-transform" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-2 group-hover:scale-105 transition-transform" fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipForward className="w-5 h-5 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" fill="currentColor" />
                </button>
              </div>

              {/* Simple Timeline Progress Bar */}
              <div className="w-full max-w-xl flex items-center gap-4 text-xs font-bold text-white/50 tracking-wider">
                 <span className="w-10 text-right">{formatTime(progress * track.duration)}</span>
                 <div 
                   className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
                   onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const p = (e.clientX - rect.left) / rect.width;
                      onSeek?.(p);
                   }}
                 >
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#a855f7] rounded-full pointer-events-none group-hover:brightness-125 transition-all duration-100" 
                      style={{ width: \`\${progress * 100}%\` }} 
                    />
                 </div>
                 <span className="w-10">{formatTime(track.duration)}</span>
              </div>
           </div>`;

if (player.match(floatingContentRegex)) {
  player = player.replace(floatingContentRegex, newFloatingContent);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully applied all changes: Favorites Heart, Timeline, Compact Letra View.');
} else {
  console.log('Failed to match floating content regex.');
}

