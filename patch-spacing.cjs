const fs = require('fs');

// 1. Update MainApp.tsx
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
mainApp = mainApp.replace('<div className="pt-24 pb-12 min-h-full">', '<div className="pt-20 pb-0 min-h-full flex flex-col">');
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

// 2. Update CatalogView.tsx
let catalog = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');
catalog = catalog.replace(/pb-20/g, 'pb-8');
fs.writeFileSync('src/components/player/CatalogView.tsx', catalog);

// 3. Update DownloadsView.tsx
let downloads = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');
downloads = downloads.replace('pt-16', 'pt-8');
downloads = downloads.replace('pb-32', 'pb-8');
fs.writeFileSync('src/components/player/DownloadsView.tsx', downloads);

// 4. Update AlbumView.tsx
let album = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');
album = album.replace('pb-10', 'pb-8');
fs.writeFileSync('src/components/player/AlbumView.tsx', album);

console.log('Spacing adjustments applied.');
