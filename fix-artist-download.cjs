const fs = require('fs');
let content = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

// Add icons and downloads hook
content = content.replace(
  "import { Play, ArrowLeft } from 'lucide-react';",
  "import { Play, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';\nimport { useDownloads } from './DownloadsContext';"
);

// Add the hook inside the component
content = content.replace(
  "const ArtistView = ({ artist, albums, onBack, onSelectAlbum }: { artist: any, albums: Album[], onBack: () => void, onSelectAlbum: (a: Album) => void }) => {",
  "const ArtistView = ({ artist, albums, onBack, onSelectAlbum }: { artist: any, albums: Album[], onBack: () => void, onSelectAlbum: (a: Album) => void }) => {\n  const { downloadTrack, isDownloaded } = useDownloads();\n  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);\n  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);\n  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);\n\n  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {\n    e.stopPropagation();\n    setShowDownloadConfirm(album);\n  };\n\n  const executeDownloadAlbum = async () => {\n    const album = showDownloadConfirm;\n    setShowDownloadConfirm(null);\n    if (!album || !album.tracks) return;\n    setIsDownloadingAlbum(album.id);\n    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));\n    for (const track of tracksToDownload) {\n      setDownloadingIds(prev => [...prev, track.id]);\n      await downloadTrack(track);\n      setDownloadingIds(prev => prev.filter(id => id !== track.id));\n    }\n    setIsDownloadingAlbum(null);\n  };\n"
);

// We need useState! Let's check if it's imported.
content = content.replace(
  "import React from 'react';",
  "import React, { useState } from 'react';"
);

// Now the button
content = content.replace(
  /                  <\/div>\n                <\/div>\n                <h3 className="font-bold text-white mb-1 truncate">/g,
  `                  </div>
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
                <h3 className="font-bold text-white mb-1 truncate">`
);

// The Modal
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

fs.writeFileSync('src/components/player/ArtistView.tsx', content);
