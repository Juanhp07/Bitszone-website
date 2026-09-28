const fs = require('fs');
let album = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

const targetAlbum = `<div className="w-52 h-52 shrink-0 rounded-2xl shadow-2xl overflow-hidden mt-12 relative group">`;
const replacementAlbum = `<div className={\`w-52 h-52 shrink-0 rounded-2xl shadow-2xl overflow-hidden mt-12 relative group transition-all duration-500 \${isEntireAlbumDownloaded ? 'border-2 border-[#a855f7]/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border border-transparent'}\`}>`;

album = album.replace(targetAlbum, replacementAlbum);
fs.writeFileSync('src/components/player/AlbumView.tsx', album);
console.log('AlbumView updated');
