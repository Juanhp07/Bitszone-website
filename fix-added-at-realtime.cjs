const fs = require('fs');

// 1. Fix useCatalog.ts
let catalog = fs.readFileSync('src/components/player/useCatalog.ts', 'utf8');
catalog = catalog.replace(/addedAt: t\.created_at,\n/g, '');
fs.writeFileSync('src/components/player/useCatalog.ts', catalog);

// 2. Fix toggleFavoriteAlbum in DownloadsContext.tsx
let ctx = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');
ctx = ctx.replace(
  /\.map\(track => \(\{ \.\.\.track, albumId: album\.id, albumTitle: album\.title, albumCover: album\.coverUrl \}\)\);/g,
  '.map(track => ({ ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl, addedAt: track.addedAt || new Date().toISOString() }));'
);
fs.writeFileSync('src/components/player/DownloadsContext.tsx', ctx);

console.log('Real-time addedAt fixed!');
