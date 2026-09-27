const fs = require('fs');
let file = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// First restore it to a function that takes a flag
file = file.replace(
  /const renderAlbumCard = \(album: Album\) => \(/g,
  "const renderAlbumCard = (album: Album, showTrackTitle: boolean = false) => ("
);

// Use the flag to decide what to show
file = file.replace(
  /<h3 className="text-white font-semibold text-sm line-clamp-1">{album\.title}<\/h3>/g,
  '<h3 className="text-white font-semibold text-sm line-clamp-1">{showTrackTitle && album.tracks && album.tracks.length > 0 ? album.tracks[0].title : album.title}</h3>'
);

// Update Canciones del momento to pass true
file = file.replace(
  /renderList\(albums, expandedSection === 'canciones', \(album\) => renderAlbumCard\(album\)\)/g,
  "renderList(albums, expandedSection === 'canciones', (album) => renderAlbumCard(album, true))"
);

// Update Álbumes destacados to pass false (which is the default, but we can be explicit or just leave it)
// It is already calling `renderAlbumCard(album)` so it will be false by default.

fs.writeFileSync('src/components/player/CatalogView.tsx', file);
