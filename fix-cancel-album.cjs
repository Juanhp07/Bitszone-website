const fs = require('fs');

let code = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

// 1. Add AlertCircle (already imported)

// 2. Add cancelAlbumDownload to destructuring
if (!code.includes('cancelAlbumDownload')) {
  code = code.replace(
    'const { downloadTrack, isDownloaded, toggleFavorite, isFavorite, toggleFavoriteAlbum, removeDownload, downloadingAlbums, downloadAlbum } = useDownloads();',
    'const { downloadTrack, isDownloaded, toggleFavorite, isFavorite, toggleFavoriteAlbum, removeDownload, downloadingAlbums, downloadAlbum, cancelAlbumDownload } = useDownloads();'
  );
}

// 3. Add showCancelConfirm state
if (!code.includes('showCancelConfirm')) {
  code = code.replace(
    'const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);',
    'const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);\n  const [showCancelConfirm, setShowCancelConfirm] = useState(false);'
  );
}

// 4. Update Badge
const badgeRegex = /<div className="mt-3 w-max px-3 py-1\.5 rounded-full bg-blue-500\/15 backdrop-blur-md border border-blue-500\/20 flex items-center justify-center shadow-sm">\s*<Loader2 className="w-3\.5 h-3\.5 animate-spin text-blue-400 mr-1\.5" \/>\s*<span className="text-blue-400 text-xs font-bold tracking-wider uppercase">\s*Descargando\.\.\.\s*<\/span>\s*<\/div>/;

const newBadge = `<button 
                    onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
                    className="mt-3 w-max px-3 py-1.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 mr-1.5" />
                    <span className="text-blue-400 text-xs font-bold tracking-wider uppercase">
                      Descargando...
                    </span>
                  </button>`;

if (code.match(badgeRegex)) {
  code = code.replace(badgeRegex, newBadge);
}

// 5. Update main download button
const mainBtnRegex = /<button \s*className="text-white\/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\s*onClick=\{\(\) => !isEntireAlbumDownloaded && setShowDownloadConfirm\(true\)\}\s*disabled=\{isEntireAlbumDownloaded \|\| isDownloadingAlbum\}\s*>\s*\{isDownloadingAlbum \?\s*\(\s*<Loader2 className="w-8 h-8 animate-spin text-\[#a855f7\]" \/>\s*\)\s*:/;

const newMainBtn = `<button 
            className="text-white/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (isDownloadingAlbum) {
                setShowCancelConfirm(true);
              } else if (!isEntireAlbumDownloaded) {
                setShowDownloadConfirm(true);
              }
            }}
            disabled={isEntireAlbumDownloaded && !isDownloadingAlbum}
          >
            {isDownloadingAlbum ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
            ) :`;

if (code.match(mainBtnRegex)) {
  code = code.replace(mainBtnRegex, newMainBtn);
}

// 6. Add Modal
const modalHtml = `
      {/* Cancel Download Confirmation Modal */}
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(false); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas cancelar la descarga de <strong>{album.title}</strong>? Las canciones que ya se han descargado se mantendrán.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Continuar descarga</button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(album.id));
                  setShowCancelConfirm(false);
                }} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};`;

code = code.replace(/<\/div>\s*\);\s*\};\s*$/g, modalHtml);

fs.writeFileSync('src/components/player/AlbumView.tsx', code);
console.log('Fixed AlbumView');
