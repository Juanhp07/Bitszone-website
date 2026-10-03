const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

const regex = /const removeAlbumFromFavorites = \(albumId: string\) => \{\s*setFavoriteTracks\(prev => \{\s*const updated = prev\.filter\(t => \(t\.albumId \? String\(t\.albumId\) : 'unknown'\) !== albumId\);\s*localStorage\.setItem\('bz_favorites', JSON\.stringify\(updated\)\);\s*return updated;\s*\}\);\s*\};/g;

const replacement = `const removeAlbumFromFavorites = (albumId: string) => {
    setFavoriteTracks(prev => {
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Álbum eliminado de tu Biblioteca' }));
      return updated;
    });
  };`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/player/DownloadsContext.tsx', code);
    console.log('Successfully added the toast back to removeAlbumFromFavorites');
} else {
    console.log('Could not find removeAlbumFromFavorites');
}
