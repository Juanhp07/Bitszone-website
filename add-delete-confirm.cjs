const fs = require('fs');

let code = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

// 1. Add Trash2 to imports
if (!code.includes('Trash2')) {
  code = code.replace(
    "} from 'lucide-react';",
    ", Trash2 } from 'lucide-react';"
  );
}

// 2. Add showDeleteConfirm state
if (!code.includes('showDeleteConfirm')) {
  code = code.replace(
    'const [showCancelConfirm, setShowCancelConfirm] = useState(false);',
    'const [showCancelConfirm, setShowCancelConfirm] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);'
  );
}

// 3. Update the dropdown button onClick
const oldClickRegex = /onClick=\{\(\) => \{ \s*if \(\!isEntireAlbumDownloaded\) \{\s*setShowDownloadConfirm\(true\);\s*\} else \{\s*if \(album\.tracks\) \{\s*album\.tracks\.forEach\(track => removeDownload\(track\.id, true\)\);\s*window\.dispatchEvent\(new CustomEvent\('show-toast', \{ detail: \`Álbum '\$\{album\.title\}' eliminado de Descargas\` \}\)\);\s*\}\s*\}\s*setShowMoreMenu\(false\); \s*\}\}/;

const newClick = `onClick={() => { 
                      if (!isEntireAlbumDownloaded) {
                        setShowDownloadConfirm(true);
                      } else {
                        setShowDeleteConfirm(true);
                      }
                      setShowMoreMenu(false); 
                    }}`;

if (code.match(oldClickRegex)) {
  code = code.replace(oldClickRegex, newClick);
  console.log("Updated button onClick logic");
} else {
  console.log("Could not match the button onClick logic!");
}

// 4. Append the modal to the component's return
const modalHtml = `
      {/* Delete Download Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Eliminar descargas?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas eliminar todas las canciones descargadas de <strong>{album.title}</strong>? Perderás el acceso sin conexión a este álbum.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Cancelar</button>
              <button 
                onClick={() => {
                  if (album.tracks) {
                    album.tracks.forEach(track => removeDownload(track.id, true));
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: \`Álbum '\${album.title}' eliminado de Descargas\` }));
                  }
                  setShowDeleteConfirm(false);
                }} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              >
                Sí, eliminar
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
console.log('Fixed AlbumView with delete confirm modal');
