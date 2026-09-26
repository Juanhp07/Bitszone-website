const fs = require('fs');
let content = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

content = content.replace(
  "const { downloadTrack, isDownloaded, toggleFavorite, isFavorite } = useDownloads();",
  "const { downloadTrack, isDownloaded, toggleFavorite, isFavorite, toggleFavoriteAlbum } = useDownloads();"
);

// We need a variable for isEntireAlbumFavorited
content = content.replace(
  "const isEntireAlbumDownloaded = album.tracks?.every(t => isDownloaded(t.id)) ?? false;",
  "const isEntireAlbumDownloaded = album.tracks?.every(t => isDownloaded(t.id)) ?? false;\n  const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every(t => isFavorite(t.id)) : false;"
);

// Replace the generic heart button in the hero
content = content.replace(
  /<button className="text-white\/50 hover:text-white transition-colors">\s*<Heart className="w-8 h-8" \/>\s*<\/button>/,
  `<button onClick={() => toggleFavoriteAlbum(album)} className={\`transition-colors \${isEntireAlbumFavorited ? 'text-[#a855f7]' : 'text-white/50 hover:text-white'}\`}>\n            <Heart className="w-8 h-8" fill={isEntireAlbumFavorited ? 'currentColor' : 'none'} />\n          </button>`
);

fs.writeFileSync('src/components/player/AlbumView.tsx', content);
