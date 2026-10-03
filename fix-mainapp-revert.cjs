const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Revert currentView array
code = code.replace(
  "['album', 'downloads', 'library', 'library_licenses', 'library_playlists', 'artist'].includes(currentView)",
  "['album', 'downloads', 'library', 'artist'].includes(currentView)"
);

// Remove the new renders
code = code.replace(
  "{currentView === 'library' && <DownloadsView type=\"favorites\" albums={albums} title=\"Canciones favoritas\" icon={Heart} onPlayTrack={handlePlayTrack} onSelectAlbum={handleSelectAlbum} />}\n                  {currentView === 'library_licenses' && <EmptyLibraryView type=\"licenses\" />}\n                  {currentView === 'library_playlists' && <EmptyLibraryView type=\"playlists\" />}",
  "{currentView === 'library' && <LibraryView albums={albums} handlePlayTrack={handlePlayTrack} handleSelectAlbum={handleSelectAlbum} />}"
);

// Add import
if (!code.includes("import { LibraryView }")) {
  code = code.replace("import { EmptyLibraryView } from './EmptyLibraryView';", "import { LibraryView } from './LibraryView';");
}

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log("Reverted MainApp and added LibraryView");
