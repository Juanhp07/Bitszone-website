const fs = require('fs');
let file = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// Replace the line that shows track title with album title
file = file.replace(
  /{album\.tracks && album\.tracks\.length > 0 \? album\.tracks\[0\]\.title : album\.title}/g,
  '{album.title}'
);

// Sort "Álbumes destacados" alphabetically
file = file.replace(
  /renderList\(albums\.slice\(\)\.reverse\(\), expandedSection === 'destacados', \(album\) => renderAlbumCard\(album\)\)/g,
  "renderList([...albums].sort((a, b) => a.title.localeCompare(b.title)), expandedSection === 'destacados', (album) => renderAlbumCard(album))"
);

fs.writeFileSync('src/components/player/CatalogView.tsx', file);
