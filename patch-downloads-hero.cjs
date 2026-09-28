const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldHero = `{/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-end gap-6 relative z-10 border-b border-white/5">
        <div className={\`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center \${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}\`}>
          <Icon className="w-16 h-16 text-white" />
        </div>
        
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Playlist</span>
          <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{tracks.length} canciones</span>
            {type === 'downloads' && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/60">
                  {availableGB.toFixed(2)}GB libres de 5.00GB
                </span>
              </>
            )}
            {tracks.length > 0 && (
              <>
                <span className="text-white/30">•</span>
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors uppercase tracking-widest font-bold"
                >
                  Vaciar lista
                </button>
              </>
            )}
          </div>
        </div>
      </div>`;

const newHero = `{/* Hero Section */}
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
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest font-bold text-[11px] shadow-lg shadow-red-500/5 hover:shadow-red-500/20 hover:border-red-500/0 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar lista
            </button>
          </div>
        )}
      </div>`;

content = content.replace(oldHero, newHero);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Hero section patched.');
