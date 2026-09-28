const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Add state
content = content.replace(
  'const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);',
  'const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);\n  const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);'
);

// Update handleRemove
const oldHandleRemove = `  const handleRemove = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (type === 'downloads') {
      removeDownload(track.id);
    } else {
      toggleFavorite(track);
    }
  };`;

const newHandleRemove = `  const handleRemove = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    setTrackToRemove(track);
  };`;

content = content.replace(oldHandleRemove, newHandleRemove);

// Update button render
const oldButton = `        <div className="flex items-center justify-center">
          {isHovered && (
            <button 
              onClick={(e) => handleRemove(e, track)}
              className="text-white/40 hover:text-red-400 transition-colors p-2"
              title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
            >
              {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>`;

const newButton = `        <div className="flex items-center justify-center">
          <button 
            onClick={(e) => handleRemove(e, track)}
            className={\`\${type === 'downloads' ? 'text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-[#a855f7] hover:text-[#b066f8] opacity-100'} transition-all p-2\`}
            title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
          >
            {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <Heart className="w-4 h-4" fill="currentColor" />}
          </button>
        </div>`;

content = content.replace(oldButton, newButton);

// Add confirmation modal at the end
const confirmModal = `      {trackToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                {type === 'downloads' ? <Trash2 className="w-6 h-6 text-red-500" /> : <X className="w-6 h-6 text-red-500" />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {type === 'downloads' ? '¿Eliminar descarga?' : '¿Quitar de favoritos?'}
              </h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              ¿Estás seguro que deseas {type === 'downloads' ? 'eliminar' : 'quitar'} <strong>{trackToRemove.title}</strong> de tu lista?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setTrackToRemove(null)} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (type === 'downloads') {
                    removeDownload(trackToRemove.id);
                  } else {
                    toggleFavorite(trackToRemove);
                  }
                  setTrackToRemove(null);
                }} 
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              >
                {type === 'downloads' ? 'Eliminar' : 'Quitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>`;

// Replace the very last `</div>` of the file (or the return of the component)
// We know it ends with `</div>\n    </div>\n  );\n};\n` or similar. Let's do a reliable replace.
content = content.replace(/    <\/div>\n  \);\n};\n?$/, confirmModal + '\n  );\n};\n');

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);

console.log('DownloadsView patched successfully.');
