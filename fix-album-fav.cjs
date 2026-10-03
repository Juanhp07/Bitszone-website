const fs = require('fs');
let code = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

if (!code.includes('HeartOff,')) {
  code = code.replace("Heart, ", "Heart, HeartOff, ");
}

// 1. Big header button
const bigRegex = /<button onClick=\{\(\) => toggleFavoriteAlbum\(album\)\} className=\{`transition-colors \$\{isEntireAlbumFavorited \? 'text-\[#a855f7\]' : 'text-white\/50 hover:text-white'\}`\}>\s*<Heart className="w-8 h-8" fill=\{isEntireAlbumFavorited \? 'currentColor' : 'none'\} \/>\s*<\/button>/g;

const newBigBtn = `<button onClick={() => toggleFavoriteAlbum(album)} className={\`group/favbtn transition-colors \${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}\`}>
            {isEntireAlbumFavorited ? (
              <>
                <Heart className="w-8 h-8 block group-hover/favbtn:hidden" fill="currentColor" />
                <HeartOff className="w-8 h-8 hidden group-hover/favbtn:block" />
              </>
            ) : (
              <Heart className="w-8 h-8" fill="none" />
            )}
          </button>`;

if (code.match(bigRegex)) {
  code = code.replace(bigRegex, newBigBtn);
  console.log("Replaced big fav in AlbumView.");
} else {
  console.log("Not found big fav in AlbumView.");
}

// 2. Tracklist item
const trackRegex = /<button \s*onClick=\{\(e\) => handleFavorite\(e, track\)\}\s*className=\{`transition-colors \$\{favorited \? 'text-\[#a855f7\]' : 'text-white\/40 hover:text-white'\}`\}\s*>\s*\{\(isHovered \|\| favorited\) && <Heart className="w-4 h-4" fill=\{favorited \? 'currentColor' : 'none'\} \/>\}\s*<\/button>/g;

const newTrackBtn = `<button 
                      onClick={(e) => handleFavorite(e, track)}
                      className={\`group/favbtn transition-colors \${favorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/40 hover:text-white'}\`}
                    >
                      {favorited ? (
                        <>
                          <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
                          <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
                        </>
                      ) : (
                        isHovered && <Heart className="w-4 h-4" fill="none" />
                      )}
                    </button>`;

if (code.match(trackRegex)) {
  code = code.replace(trackRegex, newTrackBtn);
  console.log("Replaced track fav in AlbumView.");
} else {
  console.log("Not found track fav in AlbumView.");
}

fs.writeFileSync('src/components/player/AlbumView.tsx', code);
