const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

content = content.replace(
  "import type { Track } from './types';",
  "import type { Track, Album } from './types';"
);

content = content.replace(
  "toggleFavorite: (track: Track) => void;",
  "toggleFavorite: (track: Track) => void;\n  toggleFavoriteAlbum: (album: Album) => void;"
);

const logic = `
  const toggleFavoriteAlbum = (album: Album) => {
    if (!album.tracks) return;
    setFavoriteTracks(prev => {
      let updated = [...prev];
      const allFavorited = album.tracks!.every(t => prev.some(pt => pt.id === t.id));
      if (allFavorited) {
        updated = updated.filter(pt => !album.tracks!.some(t => t.id === pt.id));
      } else {
        const tracksToAdd = album.tracks!.filter(t => !prev.some(pt => pt.id === t.id));
        updated = [...updated, ...tracksToAdd];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };
`;

content = content.replace(
  "const isFavorite = (trackId: number) => {",
  logic + "\n  const isFavorite = (trackId: number) => {"
);

content = content.replace(
  "favoriteTracks, toggleFavorite, isFavorite,",
  "favoriteTracks, toggleFavorite, toggleFavoriteAlbum, isFavorite,"
);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
