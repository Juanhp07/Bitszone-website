const fs = require('fs');

let catalog = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

const targetCatalog = `<div className={\`\${expandedSection ? 'w-full aspect-square' : 'w-48 h-48'} rounded-xl overflow-hidden relative shadow-lg\`}>`;
const replacementCatalog = `<div className={\`\${expandedSection ? 'w-full aspect-square' : 'w-48 h-48'} rounded-xl overflow-hidden relative shadow-lg transition-all duration-500 \${album.tracks?.every(t => isDownloaded(t.id)) ? 'border-2 border-[#a855f7]/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border border-transparent'}\`}>`;

catalog = catalog.replace(targetCatalog, replacementCatalog);
fs.writeFileSync('src/components/player/CatalogView.tsx', catalog);

let artist = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

const targetArtist = `<div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg">`;
const replacementArtist = `<div className={\`w-full aspect-square rounded-xl overflow-hidden relative shadow-lg transition-all duration-500 \${album.tracks?.every(t => isDownloaded(t.id)) ? 'border-2 border-[#a855f7]/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border border-transparent'}\`}>`;

artist = artist.replace(targetArtist, replacementArtist);
fs.writeFileSync('src/components/player/ArtistView.tsx', artist);

console.log('Views updated');
