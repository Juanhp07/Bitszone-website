const fs = require('fs');
let artist = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

const targetArtist = `<div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">`;
const replacementArtist = `<div className={\`relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg transition-all duration-500 \${album.tracks?.every(t => isDownloaded(t.id)) ? 'border-2 border-[#a855f7]/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border border-transparent'}\`}>`;

artist = artist.replace(targetArtist, replacementArtist);
fs.writeFileSync('src/components/player/ArtistView.tsx', artist);
console.log('Artist updated');
