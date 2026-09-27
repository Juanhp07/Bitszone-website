const fs = require('fs');

// 1. Remove background from DownloadsView.tsx
let dlFile = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const dlBgToRemove = `{/* Background Blurred Glow from Top-Right */}
      <div className="absolute top-0 right-0 w-[70vw] h-[700px] z-0 pointer-events-none opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}>
        <div className={\`absolute inset-0 blur-[100px] bg-gradient-to-br \${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}\`}></div>
      </div>`;

dlFile = dlFile.replace(dlBgToRemove, '');
fs.writeFileSync('src/components/player/DownloadsView.tsx', dlFile);

// 2. Add backgrounds to MainApp.tsx
let mainFile = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const mainTargetStr = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0 transition-opacity duration-700 \${currentView === 'album' ? 'opacity-0' : 'opacity-100'}\"></div>
      
      {/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>`;

const mainReplaceStr = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className={\`absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0 transition-opacity duration-700 \${['album', 'downloads', 'library'].includes(currentView) ? 'opacity-0' : 'opacity-100'}\`}></div>
      
      {/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>
      
      {/* Downloads View Background Glow */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'downloads' ? 'opacity-30' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-[#a855f7] to-[#3b82f6]"></div>
      </div>

      {/* Library (Favorites) View Background Glow */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'library' ? 'opacity-30' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-pink-500 to-purple-600"></div>
      </div>`;

mainFile = mainFile.replace(mainTargetStr, mainReplaceStr);
fs.writeFileSync('src/components/player/MainApp.tsx', mainFile);

