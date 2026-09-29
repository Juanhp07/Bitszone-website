const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const regex = /<span className=\{\`text-base md:text-lg xl:text-xl font-medium tracking-widest \$\{isActive \? 'text-\[\#a855f7\]\/60' : 'text-white\/10'\}\`\}>\s*\{\(t\.trackNumber \|\| i \+ 1\)\.toString\(\)\.padStart\(2, '0'\)\}\s*<\/span>/;

const newBlock = `<div className="flex items-center gap-3">
                       {isFavorite(t.id) && <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7]" fill="currentColor" />}
                       <span className={\`text-base md:text-lg xl:text-xl font-medium tracking-widest \${isActive ? 'text-[#a855f7]/60' : 'text-white/10'}\`}>
                         {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                       </span>
                     </div>`;

if (player.match(regex)) {
  player = player.replace(regex, newBlock);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully injected Heart icon for favorites.');
} else {
  console.log('Regex failed to match track number span.');
}

