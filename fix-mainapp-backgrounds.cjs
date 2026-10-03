const fs = require('fs');

let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Update the background glows for Library
const oldLibraryGlow = `{/* Library (Favorites) View Background Glow */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView.startsWith('library') ? 'opacity-40' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-pink-500 to-purple-600"></div>
      </div>`;

const newLibraryGlows = `{/* Library Views Background Glows */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'library' || currentView === 'library-favorites' ? 'opacity-40' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-pink-500 to-purple-600"></div>
      </div>
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'library-playlists' ? 'opacity-40' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-green-400 to-emerald-500"></div>
      </div>
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'library-licenses' ? 'opacity-40' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-yellow-400 to-amber-500"></div>
      </div>`;

if (code.includes('Library (Favorites) View Background Glow')) {
  code = code.replace(oldLibraryGlow, newLibraryGlows);
}

// 2. Update rendering of LibraryView
code = code.replace(
  "{currentView === 'library' && <LibraryView albums={albums} handlePlayTrack={handlePlayTrack} handleSelectAlbum={handleSelectAlbum} />}",
  "{currentView.startsWith('library') && <LibraryView albums={albums} handlePlayTrack={handlePlayTrack} handleSelectAlbum={handleSelectAlbum} currentView={currentView} setCurrentView={setCurrentView} />}"
);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log("Updated MainApp.tsx with dynamic Library background glows.");
