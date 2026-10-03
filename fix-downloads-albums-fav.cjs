const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const regex = /<button \s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleFavoriteAlbum && toggleFavoriteAlbum\(album as any\);\s*\}\}\s*className=\{`shrink-0 p-1 -mt-0\.5 -mr-1 rounded-full transition-colors hover:scale-110 \$\{isEntireAlbumFavorited \? 'text-\[#a855f7\]' : 'text-white\/30 hover:text-white'\}`\}\s*>\s*<Heart className="w-4 h-4" fill=\{isEntireAlbumFavorited \? 'currentColor' : 'none'\} \/>\s*<\/button>/g;

const newBtn = `<button 
                         onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum && toggleFavoriteAlbum(album as any); }}
                         className={\`group/favbtn shrink-0 p-1 -mt-0.5 -mr-1 rounded-full transition-colors hover:scale-110 \${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}\`}
                      >
                         {isEntireAlbumFavorited ? (
                           <>
                             <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
                             <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
                           </>
                         ) : (
                           <Heart className="w-4 h-4" fill="none" />
                         )}
                      </button>`;

if (code.match(regex)) {
  code = code.replace(regex, newBtn);
  console.log("Replaced album-level fav button in DownloadsView.");
} else {
  console.log("Not found.");
}
fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
