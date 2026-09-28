const fs = require('fs');

// 1. Update DownloadsView.tsx
let downloads = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Modernize headers
downloads = downloads.replace(
  '<div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-2">',
  '<div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">'
);
downloads = downloads.replace(
  '<div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">',
  '<div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">'
);

// Fix bottom padding (remove pb-10)
downloads = downloads.replace('<div className="flex flex-col gap-10 pb-10">', '<div className="flex flex-col gap-10">');
downloads = downloads.replace('<div className="flex flex-col gap-1 pb-10">', '<div className="flex flex-col gap-1">');

fs.writeFileSync('src/components/player/DownloadsView.tsx', downloads);


// 2. Update AlbumView.tsx
let album = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

// Modernize headers
album = album.replace(
  '<div className="grid grid-cols-[50px_1fr_100px_120px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">',
  '<div className="grid grid-cols-[50px_1fr_100px_120px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">'
);

fs.writeFileSync('src/components/player/AlbumView.tsx', album);

console.log('Headers and spacing updated.');
