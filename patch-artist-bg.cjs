const fs = require('fs');

// 1. Remove background from ArtistView.tsx
let artistFile = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

const artistBgToRemove = `{/* Background Blurred Glow from Top-Right */}
      <div className="absolute top-0 right-0 w-[70vw] h-[700px] z-0 pointer-events-none opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}>
        <div className="absolute inset-0 bg-cover bg-center blur-[100px]" style={{ backgroundImage: \`url(\${artist.img})\` }}></div>
      </div>`;

artistFile = artistFile.replace(artistBgToRemove, '');
fs.writeFileSync('src/components/player/ArtistView.tsx', artistFile);

// 2. Add background to MainApp.tsx
let mainFile = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Also update the global default background's opacity rule to hide when on 'artist' view
mainFile = mainFile.replace(
  /\[\'album\', \'downloads\', \'library\'\]\.includes\(currentView\)/g,
  "['album', 'downloads', 'library', 'artist'].includes(currentView)"
);

// Add the Artist Background Glow right after the Album Background Glow
const albumBgTarget = `{/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>`;

const albumBgReplace = `{/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? \`url(\${(selectedAlbumFull || selectedAlbum).coverUrl})\` : 'none' }}></div>
      </div>

      {/* Dynamic Artist Background Glow */}
      <div 
        className={\`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 \${currentView === 'artist' && selectedArtist ? 'opacity-50' : 'opacity-0'}\`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'artist' && selectedArtist ? \`url(\${selectedArtist.img})\` : 'none' }}></div>
      </div>`;

mainFile = mainFile.replace(albumBgTarget, albumBgReplace);
fs.writeFileSync('src/components/player/MainApp.tsx', mainFile);

