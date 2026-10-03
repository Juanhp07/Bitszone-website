const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Add sortPos state
if (!code.includes('const [sortPos, setSortPos]')) {
  code = code.replace(
    'const [showSort, setShowSort] = useState(false);',
    'const [showSort, setShowSort] = useState(false);\n  const [sortPos, setSortPos] = useState({ top: 0, right: 0 });'
  );
}

// 2. Replace button and modal
const oldRenderRegex = /<button[\s\S]*?onClick=\{\(\) => setShowSort\(!showSort\)\}[\s\S]*?<\/button>[\s\S]*?\{showSort && \([\s\S]*?<\/div>\s*<\/>\s*\)\}/m;

const newRenderStr = `<button 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSortPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
              setShowSort(!showSort);
            }} 
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium group relative z-50"
          >
            <span className="text-white/30 mr-1">Ordenar:</span> {sortBy === 'default' ? 'Por defecto' : sortBy === 'recent' ? 'Añadidos recientemente' : sortBy === 'alpha' ? 'Alfabéticamente' : sortBy === 'size_desc' ? 'Más pesados' : 'Menos pesados'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-px"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showSort && typeof document !== 'undefined' && createPortal(
            <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowSort(false)} />
            <div 
              style={{ top: sortPos.top, right: sortPos.right }}
              className={\`fixed w-[280px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 \${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}\`}
            >
              {[
                { id: 'default', label: 'Por defecto' },
                { id: 'recent', label: 'Añadidos recientemente' },
                { id: 'alpha', label: 'Alfabéticamente' },
                { id: 'size_desc', label: 'Más pesados' },
                { id: 'size_asc', label: 'Menos pesados' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id as any); setShowSort(false); }}
                  className={\`w-full text-left px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap \${sortBy === opt.id ? 'bg-white/10 text-white font-medium' : \`text-white/60 hover:text-white \${type === 'licenses' ? 'hover:bg-yellow-500/10' : type === 'playlists' ? 'hover:bg-green-500/10' : 'hover:bg-[#a855f7]/10'}\`}\`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            </>,
            document.body
          )}`;

if (code.match(oldRenderRegex)) {
  code = code.replace(oldRenderRegex, newRenderStr);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Replaced sort modal with createPortal rendering.");
} else {
  console.log("Could not find the sort button regex");
}
