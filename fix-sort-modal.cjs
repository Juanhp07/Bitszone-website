const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldModalRegex = /<div className="absolute top-full left-1\/2 -translate-x-1\/2 mt-4 w-52 bg-\[#18181b\] border border-white\/10 rounded-2xl overflow-hidden shadow-\[0_16px_48px_rgba\(0,0,0,0\.8\)\] z-50">[\s\S]*?<\/div>/;

const newModalStr = `<div className={\`absolute top-full right-0 mt-4 w-[240px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 \${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}\`}>
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
            </div>`;

code = code.replace(oldModalRegex, newModalStr);

// Add useEffect for Esc key
if (!code.includes('useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === \'Escape\') setShowSort(false); };')) {
  code = code.replace(
    'const [showSort, setShowSort] = useState(false);',
    'const [showSort, setShowSort] = useState(false);\n  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === \'Escape\') setShowSort(false); }; if (showSort) { document.addEventListener(\'keydown\', handleKeyDown); } return () => document.removeEventListener(\'keydown\', handleKeyDown); }, [showSort]);'
  );
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated Sort modal UI and Esc key logic.");
