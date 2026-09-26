const fs = require('fs');
let content = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

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
  /    <\/div>\n  \);\n};\n?$/,
  `      ${modalToInsert}\n    </div>\n  );\n};\n`
);

fs.writeFileSync('src/components/player/AlbumView.tsx', content);
