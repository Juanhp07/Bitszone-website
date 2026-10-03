const fs = require('fs');

let code = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// 1. Add downloadingAlbums and downloadAlbum to the destructuring
code = code.replace(
  'const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum } = useDownloads();',
  'const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum, downloadingAlbums, downloadAlbum } = useDownloads();'
);

// 2. Remove local isDownloadingAlbum state (it might be used elsewhere, let's just replace its usage)
// Or just let the unused state sit there, but we need to change renderAlbumCard logic.
const badgeLogicRegex = /\{\(isComplete \|\| isPartial\) && \(\s*<div className="mt-2 w-max px-2\.5 py-1 rounded-full bg-\[#a855f7\]\/15 backdrop-blur-md border border-\[#a855f7\]\/20 flex items-center justify-center shadow-sm">\s*<span className="text-\[#c084fc\] text-\[9px\] font-bold tracking-wider uppercase">\s*\{isComplete \? 'Descarga Completa' : 'Descarga Parcial'\}\s*<\/span>\s*<\/div>\s*\)\}/;

const newBadgeLogic = `{(() => {
          const isDownloading = downloadingAlbums?.includes(String(album.id));
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
          }
          return null;
        })()}`;

if (code.match(badgeLogicRegex)) {
  code = code.replace(badgeLogicRegex, newBadgeLogic);
  console.log("Updated badge logic in CatalogView");
} else {
  console.log("Could not find badge logic in CatalogView");
}

// 3. Replace executeDownloadAlbum logic to use global context so downloadingAlbums is populated
const executeRegex = /const executeDownloadAlbum = async \(\) => \{[\s\S]*?setIsDownloadingAlbum\(null\);\s*\};/;
const newExecuteLogic = `const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    downloadAlbum(album);
  };`;

if (code.match(executeRegex)) {
  code = code.replace(executeRegex, newExecuteLogic);
  console.log("Updated executeDownloadAlbum in CatalogView");
} else {
  console.log("Could not find executeDownloadAlbum in CatalogView");
}

fs.writeFileSync('src/components/player/CatalogView.tsx', code);
