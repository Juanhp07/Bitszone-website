const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

if (!code.includes("import { EmptyLibraryView }")) {
  code = code.replace("import { DownloadsView } from './DownloadsView';", "import { DownloadsView } from './DownloadsView';\nimport { EmptyLibraryView } from './EmptyLibraryView';");
}

code = code.replace(
  "{currentView === 'library' && <DownloadsView type=\"favorites\" albums={albums} title=\"Canciones favoritas\" icon={Heart} onPlayTrack={handlePlayTrack} onSelectAlbum={handleSelectAlbum} />}",
  "{currentView === 'library' && <DownloadsView type=\"favorites\" albums={albums} title=\"Canciones favoritas\" icon={Heart} onPlayTrack={handlePlayTrack} onSelectAlbum={handleSelectAlbum} />}\n                  {currentView === 'library_licenses' && <EmptyLibraryView type=\"licenses\" />}\n                  {currentView === 'library_playlists' && <EmptyLibraryView type=\"playlists\" />}"
);

code = code.replace(
  "['album', 'downloads', 'library', 'artist'].includes(currentView)",
  "['album', 'downloads', 'library', 'library_licenses', 'library_playlists', 'artist'].includes(currentView)"
);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log("Updated MainApp");
