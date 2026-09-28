const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Destructure clear methods
content = content.replace(
  'const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite, clearNewDownloads, totalBytes } = useDownloads();',
  'const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite, clearNewDownloads, totalBytes, clearDownloads, clearFavorites } = useDownloads();'
);

// 2. Add state
content = content.replace(
  'const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);',
  'const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);\n  const [showClearConfirm, setShowClearConfirm] = useState(false);\n  const [confirmText, setConfirmText] = useState("");'
);

// 3. Add button in hero section
const oldHeroStats = `<div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{tracks.length} canciones</span>
            {type === 'downloads' && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/60">
                  {availableGB.toFixed(2)}GB libres de 5.00GB
                </span>
              </>
            )}
          </div>`;

const newHeroStats = `<div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{tracks.length} canciones</span>
            {type === 'downloads' && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/60">
                  {availableGB.toFixed(2)}GB libres de 5.00GB
                </span>
              </>
            )}
            {tracks.length > 0 && (
              <>
                <span className="text-white/30">•</span>
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors uppercase tracking-widest font-bold"
                >
                  Vaciar lista
                </button>
              </>
            )}
          </div>`;

content = content.replace(oldHeroStats, newHeroStats);

// 4. Add modal at the end (before the last </div>)
const clearModal = `      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {type === 'downloads' ? '¿Eliminar todas las descargas?' : '¿Vaciar favoritos?'}
              </h3>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">
              Esta acción no se puede deshacer. Se eliminarán las <strong>{tracks.length}</strong> canciones de tu lista.
              Para confirmar, escribe <strong className="text-red-400">CONFIRMAR</strong> a continuación:
            </p>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 mb-6 font-mono text-center tracking-widest uppercase"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowClearConfirm(false);
                  setConfirmText("");
                }} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmText === 'CONFIRMAR') {
                    if (type === 'downloads') {
                      clearDownloads();
                    } else {
                      clearFavorites();
                    }
                    setShowClearConfirm(false);
                    setConfirmText("");
                  }
                }}
                disabled={confirmText !== 'CONFIRMAR'}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
              >
                Vaciar Todo
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(/    <\/div>\n  \);\n};\n?$/, clearModal + '\n    </div>\n  );\n};\n');

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('DownloadsView patched with clear list functionality.');
