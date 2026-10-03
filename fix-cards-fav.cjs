const fs = require('fs');
['src/components/player/CatalogView.tsx', 'src/components/player/ArtistView.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Add HeartOff to import
  if (!code.includes('HeartOff,')) {
    code = code.replace("Heart, ", "Heart, HeartOff, ");
  }

  const regex = /<button \s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleFavoriteAlbum\(album\);\s*\}\}\s*className=\{`shrink-0 p-1 -mt-0\.5 -mr-1 rounded-full transition-colors hover:scale-110 \$\{isEntireAlbumFavorited \? 'text-\[#a855f7\]' : 'text-white\/30 hover:text-white'\}`\}\s*>\s*<Heart className="w-4 h-4" fill=\{isEntireAlbumFavorited \? 'currentColor' : 'none'\} \/>\s*<\/button>/g;

  const newBtn = `<button 
                 onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum(album); }}
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
    console.log("Replaced in " + file);
  } else {
    console.log("Not found in " + file);
  }

  fs.writeFileSync(file, code);
});
