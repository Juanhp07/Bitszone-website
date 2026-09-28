const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Add context imports
content = content.replace(
  /const \{ downloadedTracks, favoriteTracks,[^}]+\} = useDownloads\(\);/,
  `const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite, clearNewDownloads, totalBytes, clearDownloads, clearFavorites, removeAlbumFromDownloads, removeAlbumFromFavorites } = useDownloads();`
);

// Add albumToRemove state
if (!content.includes('albumToRemove')) {
  content = content.replace(
    /const \[showClearConfirm, setShowClearConfirm\] = useState\(false\);/,
    `const [showClearConfirm, setShowClearConfirm] = useState(false);\n  const [albumToRemove, setAlbumToRemove] = useState<{ id: string, title: string } | null>(null);`
  );
}

// Update Hero Button & Alignment
const oldHero = `{/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-10 border-b border-white/5">
        <div className="flex items-end gap-6">
          <div className={\`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center \${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}\`}>
            <Icon className="w-16 h-16 text-white" />
          </div>
          
          <div className="flex flex-col gap-2 pb-2">
            <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Playlist</span>
            <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/80 font-medium text-sm">
              <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
              <span className="text-white/30">•</span>
              <span>{Object.keys(groupedTracks).length} {Object.keys(groupedTracks).length === 1 ? 'álbum' : 'álbumes'}</span>
              {type === 'downloads' && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/60">
                    {availableGB.toFixed(2)}GB libres de 5.00GB
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {tracks.length > 0 && (
          <div className="pb-2">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all uppercase tracking-widest font-bold text-[10px]"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar lista
            </button>
          </div>
        )}
      </div>`;

const newHero = `{/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between relative z-10 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className={\`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center \${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}\`}>
            <Icon className="w-16 h-16 text-white" />
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-white/70 text-sm font-semibold tracking-widest uppercase mt-2">Playlist</span>
            <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/80 font-medium text-sm">
              <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
              <span className="text-white/30">•</span>
              <span>{Object.keys(groupedTracks).length} {Object.keys(groupedTracks).length === 1 ? 'álbum' : 'álbumes'}</span>
              {type === 'downloads' && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/60">
                    {availableGB.toFixed(2)}GB libres de 5.00GB
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {tracks.length > 0 && (
          <div>
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all font-semibold text-xs"
            >
              <Trash2 className="w-4 h-4" />
              {type === 'downloads' ? 'Vaciar Descargas' : 'Vaciar Biblioteca'}
            </button>
          </div>
        )}
      </div>`;
content = content.replace(oldHero, newHero);


// Replace album header to include "Vaciar solo esta lista"
const oldAlbumHeader = `<div className="flex items-center gap-4 mb-4 px-4">
                <img src={group.coverUrl} alt={group.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                <h3 className="text-xl font-bold text-white">{group.title}</h3>
              </div>`;
const newAlbumHeader = `<div className="flex items-center justify-between gap-4 mb-4 px-4">
                <div className="flex items-center gap-4">
                  <img src={group.coverUrl} alt={group.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                  <h3 className="text-xl font-bold text-white">{group.title}</h3>
                </div>
                <button 
                  onClick={() => setAlbumToRemove(group)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white transition-colors text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar solo esta lista
                </button>
              </div>`;
content = content.replace(oldAlbumHeader, newAlbumHeader);

// Add modal for single album
const albumModal = `
      {albumToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Vaciar lista?</h3>
            </div>
            <p className="text-white/70 mb-6">
              ¿Estás seguro de que deseas eliminar todas las canciones de <strong>{albumToRemove.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setAlbumToRemove(null)} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (type === 'downloads') {
                    removeAlbumFromDownloads(albumToRemove.id);
                  } else {
                    removeAlbumFromFavorites(albumToRemove.id);
                  }
                  setAlbumToRemove(null);
                }} 
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Vaciar
              </button>
            </div>
          </div>
        </div>
      )}`;

// Insert album modal before final closing tag or trackToRemove
content = content.replace('{trackToRemove && (', albumModal + '\n      {trackToRemove && (');

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('DownloadsView patched successfully.');
