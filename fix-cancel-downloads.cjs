const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

if (!code.includes('AlertCircle')) {
  code = code.replace(
    "import { Play, Pause, Trash2, Heart, Search } from 'lucide-react';",
    "import { Play, Pause, Trash2, Heart, Search, Loader2, AlertCircle } from 'lucide-react';"
  );
}

if (!code.includes('showCancelConfirm')) {
  code = code.replace(
    'const [albumToRemove, setAlbumToRemove] = useState<string | null>(null);',
    'const [albumToRemove, setAlbumToRemove] = useState<string | null>(null);\n  const [showCancelConfirm, setShowCancelConfirm] = useState<any | null>(null);'
  );
}

const badgeRegex = /<div className="mt-2 w-max px-2\.5 py-1 rounded-full bg-blue-500\/15 backdrop-blur-md border border-blue-500\/20 flex items-center justify-center shadow-sm">\s*<span className="text-blue-400 text-\[9px\] font-bold tracking-wider uppercase flex items-center gap-1\.5">\s*Descargando\.\.\.\s*<\/span>\s*<\/div>/;

const newBadge = `<button 
                            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                            className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer"
                          >
                            <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Descargando...
                            </span>
                          </button>`;

if (code.match(badgeRegex)) {
  code = code.replace(badgeRegex, newBadge);
} else {
  // It might already have a loader
  const badgeRegex2 = /<div className="mt-2 w-max px-2\.5 py-1 rounded-full bg-blue-500\/15 backdrop-blur-md border border-blue-500\/20 flex items-center justify-center shadow-sm">\s*<span className="text-blue-400 text-\[9px\] font-bold tracking-wider uppercase flex items-center gap-1\.5">\s*<Loader2 className="w-3 h-3 animate-spin" \/>\s*Descargando\.\.\.\s*<\/span>\s*<\/div>/;
  if (code.match(badgeRegex2)) {
    code = code.replace(badgeRegex2, newBadge);
  }
}

const modalHtml = `
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(null); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm">
              ¿Estás seguro que deseas cancelar la descarga de <strong>{showCancelConfirm.title}</strong>? Las canciones que ya se han descargado se mantendrán.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Continuar descarga</button>
              <button 
                onClick={() => {
                  cancelAlbumDownload(String(showCancelConfirm.id));
                  setShowCancelConfirm(null);
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

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log('Fixed DownloadsView');
