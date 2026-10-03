const fs = require('fs');
let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

if (!code.includes('HeartOff,')) {
  code = code.replace("Heart, ", "Heart, HeartOff, ");
}

const regex = /<button \s*className="ml-4 text-white\/50 hover:text-white transition-colors"\s*onClick=\{\(\) => toggleFavorite\(track, album\)\}\s*>\s*<Heart \s*className="w-5 h-5" \s*fill=\{isFavorite\(track\.id\) \? "#a855f7" : "none"\} \s*color=\{isFavorite\(track\.id\) \? "#a855f7" : "currentColor"\} \s*\/>\s*<\/button>/g;

const newBtn = `<button 
          className={\`group/favbtn ml-4 transition-colors \${isFavorite(track.id) ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}\`}
          onClick={() => toggleFavorite(track, album)}
        >
          {isFavorite(track.id) ? (
            <>
              <Heart className="w-5 h-5 block group-hover/favbtn:hidden" fill="currentColor" />
              <HeartOff className="w-5 h-5 hidden group-hover/favbtn:block" />
            </>
          ) : (
            <Heart className="w-5 h-5" fill="none" />
          )}
        </button>`;

if (code.match(regex)) {
  code = code.replace(regex, newBtn);
  console.log("Replaced fav in MiniPlayer.");
} else {
  console.log("Not found in MiniPlayer.");
}

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
