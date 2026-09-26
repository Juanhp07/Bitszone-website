const fs = require('fs');

let content = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

// Add AlertCircle icon
content = content.replace("Check, Loader2 }", "Check, Loader2, AlertCircle }");

// Add State
content = content.replace(
  "const [downloadingIds, setDownloadingIds] = useState<number[]>([]);",
  "const [downloadingIds, setDownloadingIds] = useState<number[]>([]);\n  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);\n  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);"
);

// Add Logic
const logicToInsert = `
  const handleDownloadAlbum = async () => {
    setShowDownloadConfirm(false);
    if (!album.tracks) return;
    
    setIsDownloadingAlbum(true);
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    
    for (const track of tracksToDownload) {
      setDownloadingIds(prev => [...prev, track.id]);
      await downloadTrack(track);
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
    
    setIsDownloadingAlbum(false);
  };

  const isEntireAlbumDownloaded = album.tracks?.every(t => isDownloaded(t.id)) ?? false;
`;
content = content.replace(
  "return (",
  logicToInsert + "\n  return ("
);

// Add Download button in Hero
const btnToInsert = `
          <button 
            className="text-white/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => !isEntireAlbumDownloaded && setShowDownloadConfirm(true)}
            disabled={isEntireAlbumDownloaded || isDownloadingAlbum}
          >
            {isDownloadingAlbum ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
            ) : isEntireAlbumDownloaded ? (
              <Check className="w-8 h-8 text-[#a855f7]" />
            ) : (
              <Download className="w-8 h-8" />
            )}
          </button>
`;
content = content.replace(
  /<MoreHorizontal className="w-8 h-8" \/>\s*<\/button>/,
  `</button>\n${btnToInsert}\n          <button className="text-white/50 hover:text-white transition-colors">\n            <MoreHorizontal className="w-8 h-8" />\n          </button>`
);

// Add Modal at the end
const modalToInsert = `
      {/* Download Confirmation Modal */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Descargar Álbum?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              ¿Estás seguro que deseas descargar todas las canciones de <strong>{album.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDownloadConfirm(false)} className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleDownloadAlbum} className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25">Descargar Todo</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /<\/div>\s*<\/div>\s*<div className="flex items-center justify-end gap-6">/,
  `</div>\n        </div>\n        <div className="flex items-center justify-end gap-6">`
);

content = content.replace(
  /    <\/div>\s*<\/div>\s*\);\s*}\s*$/m,
  `    </div>\n${modalToInsert}\n    </div>\n  );\n};\n`
);

fs.writeFileSync('src/components/player/AlbumView.tsx', content);
