const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const targetStr = `<div className="w-full max-w-xl flex items-center gap-4 text-xs font-bold text-white/50 tracking-wider">
                 <span className="w-10 text-right">{formatTime(progress * track.duration)}</span>
                 <div 
                   className="flex-1 h-2.5 md:h-3 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"`;

const replacementStr = `<div className={\`w-full max-w-xl flex items-center gap-4 font-bold text-white/50 tracking-wider transition-all duration-[1200ms] \${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-xs'}\`}>
                 <span className={\`text-right transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(progress * track.duration)}</span>
                 <div 
                   className="flex-1 h-2.5 md:h-3 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"`;

player = player.replace(targetStr, replacementStr);

const targetStr2 = `</div>
                 <span className="w-10">{formatTime(track.duration)}</span>
              </div>`;

const replacementStr2 = `</div>
                 <span className={\`transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(track.duration)}</span>
              </div>`;

player = player.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully adjusted timeline text scale for Letra tab.');

