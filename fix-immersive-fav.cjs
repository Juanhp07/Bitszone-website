const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

if (!code.includes('HeartOff,')) {
  code = code.replace("Heart, ", "Heart, HeartOff, ");
}

const regex = /<button \s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleFavorite\(t, album\);\s*\}\}\s*className=\{`absolute left-0 transition-all duration-300 flex items-center justify-center \$\{isFavorite\(t\.id\) \? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'\}`\}\s*>\s*<Heart \s*className=\{`w-4 h-4 md:w-5 md:h-5 transition-colors \$\{isFavorite\(t\.id\) \? 'text-\[#a855f7\]' : 'text-white\/40 hover:text-white'\}`\} \s*fill=\{isFavorite\(t\.id\) \? "currentColor" : "none"\} \s*\/>\s*<\/button>/g;

const newBtn = `<button 
                         onClick={(e) => { e.stopPropagation(); toggleFavorite(t, album); }}
                         className={\`group/favbtn absolute left-0 transition-all duration-300 flex items-center justify-center \${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}\`}
                       >
                         {isFavorite(t.id) ? (
                           <>
                             <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7] block group-hover/favbtn:hidden" fill="currentColor" />
                             <HeartOff className="w-4 h-4 md:w-5 md:h-5 text-[#b066f8] hidden group-hover/favbtn:block" />
                           </>
                         ) : (
                           <Heart className="w-4 h-4 md:w-5 md:h-5 text-white/40 hover:text-white transition-colors" fill="none" />
                         )}
                       </button>`;

if (code.match(regex)) {
  code = code.replace(regex, newBtn);
  console.log("Replaced fav in ImmersivePlayer.");
} else {
  console.log("Not found in ImmersivePlayer.");
}

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
