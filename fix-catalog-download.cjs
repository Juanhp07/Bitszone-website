const fs = require('fs');
let content = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// Add AlertCircle and state imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport { DownloadCloud } from 'lucide-react';" // Just in case
);

// We need to inject the state and logic for album download inside CatalogView component
const stateLogic = `
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);

  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation();
    setShowDownloadConfirm(album);
  };

  const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    
    setIsDownloadingAlbum(album.id);
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    
    for (const track of tracksToDownload) {
      setDownloadingIds(prev => [...prev, track.id]);
      await downloadTrack(track);
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
    
    setIsDownloadingAlbum(null);
  };
`;

content = content.replace(
  "const { downloadedTracks, downloadTrack, isDownloaded } = useDownloads();",
  "const { downloadedTracks, downloadTrack, isDownloaded } = useDownloads();" + stateLogic
);

// Replace the first album list overlay
content = content.replace(
  /<div className="absolute inset-0 bg-black\/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">[\s\S]*?<button \n\s*className="w-14 h-14 bg-\[#a855f7\] hover:bg-\[#b066f8\] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"/,
  `<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"`
);

// We need to add the download button in bottom right for the first list
content = content.replace(
  /                  <\/button>\n                <\/div>\n              <\/div>\n              <div className="flex flex-col">/g,
  `                  </button>
                </div>
                {album.tracks && album.tracks.length > 0 && (
                  <button 
                    onClick={(e) => handleDownloadAlbumClick(e, album)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 opacity-0 group-hover:opacity-100 z-10"
                    disabled={album.tracks.every(t => isDownloaded(t.id)) || isDownloadingAlbum === album.id}
                  >
                    {isDownloadingAlbum === album.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                    ) : album.tracks.every(t => isDownloaded(t.id)) ? (
                      <Check className="w-4 h-4 text-[#a855f7]" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex flex-col">`
);

// Now for the modal itself
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
              ¿Estás seguro que deseas descargar todas las canciones de <strong>{showDownloadConfirm.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDownloadConfirm(null)} className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={executeDownloadAlbum} className="px-4 py-2 rounded-lg font-medium bg-[#a855f7] hover:bg-[#b066f8] text-white transition-colors shadow-lg shadow-[#a855f7]/25">Descargar Todo</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /    <\/div>\n  \);\n};\n?$/,
  `      ${modalToInsert}\n    </div>\n  );\n};\n`
);

fs.writeFileSync('src/components/player/CatalogView.tsx', content);
