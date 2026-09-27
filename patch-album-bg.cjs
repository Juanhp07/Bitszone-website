const fs = require('fs');

// 1. Remove background from AlbumView.tsx
let albumFile = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

const bgToRemove = `{/* Background Blurred Cover Glow from Top-Right */}
      <div className="absolute top-0 right-0 w-[70vw] h-[700px] z-0 pointer-events-none opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}>
        <div className="absolute inset-0 bg-cover bg-center blur-[100px]" style={{ backgroundImage: \`url(\${album.coverUrl})\` }}></div>
      </div>`;

albumFile = albumFile.replace(bgToRemove, '');
fs.writeFileSync('src/components/player/AlbumView.tsx', albumFile);

// 2. Add background to MainApp.tsx
let mainFile = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldGlobalBg = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>`;

const newGlobalBg = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0 transition-opacity duration-700 \${currentView === 'album' ? 'opacity-0' : 'opacity-100'}\"></div>
      
      {/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-40' : 'opacity-0'}\`}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[120px] scale-110" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>

      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>`;

mainFile = mainFile.replace(oldGlobalBg, newGlobalBg);
fs.writeFileSync('src/components/player/MainApp.tsx', mainFile);

