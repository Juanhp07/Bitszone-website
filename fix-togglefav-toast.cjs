const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

const badBlockRegex = /localStorage\.setItem\('bz_favorites', JSON\.stringify\(updated\)\);\s*window\.dispatchEvent\(new CustomEvent\('show-toast', \{ detail: 'Álbum eliminado de tu Biblioteca' \}\)\);\s*return updated;\s*\}\);/g;

const badBlockMatches = [...code.matchAll(badBlockRegex)];

if (badBlockMatches.length > 0) {
    // The first match is inside toggleFavorite, the second is inside removeAlbumFromFavorites
    // Or let's just specifically replace it in toggleFavorite by finding the surrounding code.
    const specificRegex = /const exists = prev\.find\(t => t\.id === track\.id\);\s*let updated;\s*if \(exists\) \{\s*updated = prev\.filter\(t => t\.id !== track\.id\);\s*\} else \{\s*const trackToSave = \{ \.\.\.track, albumId: album\?\.id \|\| track\.albumId, albumTitle: album\?\.title \|\| track\.albumTitle, albumCover: album\?\.coverUrl \|\| track\.albumCover, addedAt: track\.addedAt \|\| new Date\(\)\.toISOString\(\) \};\s*updated = \[\.\.\.prev, trackToSave\];\s*\}\s*localStorage\.setItem\('bz_favorites', JSON\.stringify\(updated\)\);\s*window\.dispatchEvent\(new CustomEvent\('show-toast', \{ detail: 'Álbum eliminado de tu Biblioteca' \}\)\);\s*return updated;/;

    const correctReplacement = `const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        const trackToSave = { ...track, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };
        updated = [...prev, trackToSave];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;`;

    code = code.replace(specificRegex, correctReplacement);
    fs.writeFileSync('src/components/player/DownloadsContext.tsx', code);
    console.log('Successfully removed duplicate album toast from toggleFavorite');
} else {
    console.log('Could not find the bad block.');
}

