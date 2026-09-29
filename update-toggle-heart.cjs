const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Hook extraction
player = player.replace(
  "const { isFavorite } = useDownloads();",
  "const { isFavorite, toggleFavorite } = useDownloads();"
);

// 2. "PISTAS" Text Position
player = player.replace(
  'className="absolute top-28 left-12 xl:left-[5rem]',
  'className="absolute top-36 left-12 xl:left-[5rem]'
);

// 3. Track item map update
const oldTrackItem = /<div \s*key=\{t\.id\} \s*onClick=\{\(\) => onPlayTrack && onPlayTrack\(t, album\)\}\s*className=\{\`text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 \$\{\s*isActive \s*\? 'text-\[\#a855f7\] drop-shadow-\[0_0_5px_rgba\(168,85,247,0\.4\)\] translate-x-4' \s*: 'text-white\/20 hover:text-white\/50'\s*\}\`\}\s*>\s*<div className="flex items-center gap-4 md:gap-6">\s*<div className="flex items-center gap-3">\s*\{isFavorite\(t\.id\) && <Heart className="w-4 h-4 md:w-5 md:h-5 text-\[\#a855f7\]" fill="currentColor" \/>\}\s*<span className=\{\`text-base md:text-lg xl:text-xl font-medium tracking-widest \$\{isActive \? 'text-\[\#a855f7\]\/60' : 'text-white\/10'\}\`\}>\s*\{\(t\.trackNumber \|\| i \+ 1\)\.toString\(\)\.padStart\(2, '0'\)\}\s*<\/span>\s*<\/div>/;

const newTrackItem = `<div 
                   key={t.id} 
                   onClick={() => onPlayTrack && onPlayTrack(t, album)}
                   className={\`group text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 \${
                     isActive 
                       ? 'text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.4)] translate-x-4' 
                       : 'text-white/20 hover:text-white/50'
                   }\`}
                 >
                   <div className="flex items-center gap-4 md:gap-6">
                     <div className="flex items-center relative min-w-[3.5rem] shrink-0">
                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleFavorite(t, album); }}
                         className={\`absolute left-0 transition-all duration-300 flex items-center justify-center \${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}\`}
                       >
                         <Heart 
                           className={\`w-4 h-4 md:w-5 md:h-5 transition-colors \${isFavorite(t.id) ? 'text-[#a855f7]' : 'text-white/40 hover:text-white'}\`} 
                           fill={isFavorite(t.id) ? "currentColor" : "none"} 
                         />
                       </button>
                       <span className={\`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 \${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} \${isActive ? 'text-[#a855f7]/60' : 'text-white/10'}\`}>
                         {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                       </span>
                     </div>`;

if (player.match(oldTrackItem)) {
  player = player.replace(oldTrackItem, newTrackItem);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully updated toggle heart UI and PISTAS position.');
} else {
  console.log('Regex failed to match track map block.');
}
