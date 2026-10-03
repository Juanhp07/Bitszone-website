const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

const dlRegex = /const removeAlbumFromDownloads = \(albumId: string\) => \{\s*setDownloadedTracks\(prev => \{\s*const updated = prev\.filter\(t => \(t\.albumId \? String\(t\.albumId\) : 'unknown'\) !== albumId\);\s*localStorage\.setItem\('bz_downloads', JSON\.stringify\(updated\)\);\s*calculateBytes\(updated\);\s*window\.dispatchEvent\(new CustomEvent\('show-toast', \{ detail: 'Álbum eliminado de Descargas' \}\)\);\s*return updated;\s*\}\);\s*\};/g;

const newDl = `const removeAlbumFromDownloads = (albumId: string) => {
    setDownloadedTracks(prev => {
      const albumTitle = prev.find(t => (t.albumId ? String(t.albumId) : 'unknown') === albumId)?.albumTitle || 'Álbum';
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: \`Álbum '\${albumTitle}' eliminado de Descargas\` }));
      return updated;
    });
  };`;

if (code.match(dlRegex)) {
  code = code.replace(dlRegex, newDl);
  console.log("Replaced removeAlbumFromDownloads");
} else {
  console.log("Could not find removeAlbumFromDownloads");
}

const favRegex = /const removeAlbumFromFavorites = \(albumId: string\) => \{\s*setFavoriteTracks\(prev => \{\s*const updated = prev\.filter\(t => \(t\.albumId \? String\(t\.albumId\) : 'unknown'\) !== albumId\);\s*localStorage\.setItem\('bz_favorites', JSON\.stringify\(updated\)\);\s*window\.dispatchEvent\(new CustomEvent\('show-toast', \{ detail: 'Álbum eliminado de tu Biblioteca' \}\)\);\s*return updated;\s*\}\);\s*\};/g;

const newFav = `const removeAlbumFromFavorites = (albumId: string) => {
    setFavoriteTracks(prev => {
      const albumTitle = prev.find(t => (t.albumId ? String(t.albumId) : 'unknown') === albumId)?.albumTitle || 'Álbum';
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: \`Álbum '\${albumTitle}' eliminado de tu Biblioteca\` }));
      return updated;
    });
  };`;

if (code.match(favRegex)) {
  code = code.replace(favRegex, newFav);
  console.log("Replaced removeAlbumFromFavorites");
} else {
  console.log("Could not find removeAlbumFromFavorites");
}

fs.writeFileSync('src/components/player/DownloadsContext.tsx', code);
