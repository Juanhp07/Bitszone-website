const fs = require('fs');

let code = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

// 1. Check if downloadingAlbums and downloadAlbum are destructured
if (!code.includes('downloadingAlbums')) {
  code = code.replace(
    'const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum } = useDownloads();',
    'const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum, downloadingAlbums, downloadAlbum } = useDownloads();'
  );
}

// 2. Replace the badge logic
const badgeLogicRegex = /if \(isComplete \|\| isPartial\) \{\s*return \(\s*<div className="mt-2 w-max px-2\.5 py-1 rounded-full bg-\[#a855f7\]\/15 backdrop-blur-md border border-\[#a855f7\]\/20 flex items-center justify-center shadow-sm">\s*<span className="text-\[#c084fc\] text-\[9px\] font-bold tracking-wider uppercase">\s*\{isComplete \? 'Descarga Completa' : 'Descarga Parcial'\}\s*<\/span>\s*<\/div>\s*\);\s*\}/;

const newBadgeLogic = `const isDownloading = downloadingAlbums?.includes(String(album.id));
                  if (isDownloading) {
                    return (
                      <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm">
                        <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Descargando...
                        </span>
                      </div>
                    );
                  }
                  
                  if (isComplete || isPartial) {
                    return (
                      <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
                        <span className="text-[#c084fc] text-[9px] font-bold tracking-wider uppercase">
                          {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
                        </span>
                      </div>
                    );
                  }`;

if (code.match(badgeLogicRegex)) {
  code = code.replace(badgeLogicRegex, newBadgeLogic);
  console.log("Updated badge logic in ArtistView");
} else {
  console.log("Could not find badge logic in ArtistView");
}

// 3. Replace executeDownloadAlbum logic to use global context
const executeRegex = /const executeDownloadAlbum = async \(\) => \{[\s\S]*?setIsDownloadingAlbum\(null\);\s*\};/;
const newExecuteLogic = `const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    downloadAlbum(album);
  };`;

if (code.match(executeRegex)) {
  code = code.replace(executeRegex, newExecuteLogic);
  console.log("Updated executeDownloadAlbum in ArtistView");
} else {
  console.log("Could not find executeDownloadAlbum in ArtistView");
}

fs.writeFileSync('src/components/player/ArtistView.tsx', code);
