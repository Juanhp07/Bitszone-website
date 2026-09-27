const fs = require('fs');
let mainFile = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetStr = `{/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-40' : 'opacity-0'}\`}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[120px] scale-110" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>`;

const replaceStr = `{/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>`;

mainFile = mainFile.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/player/MainApp.tsx', mainFile);

