const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

content = content.replace(
  'toggleFavorite: (track: Track) => void;',
  'toggleFavorite: (track: Track, album?: Album) => void;'
);

const oldToggleFavorite = `  const toggleFavorite = (track: Track) => {
    setFavoriteTracks(prev => {
      const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        updated = [...prev, track];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };`;

const newToggleFavorite = `  const toggleFavorite = (track: Track, album?: Album) => {
    setFavoriteTracks(prev => {
      const exists = prev.find(t => t.id === track.id);
      let updated;
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;
        updated = [...prev, trackToSave];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };`;

content = content.replace(oldToggleFavorite, newToggleFavorite);

const oldToggleFavoriteAlbum = `  const toggleFavoriteAlbum = (album: Album) => {
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
  };`;

const newToggleFavoriteAlbum = `  const toggleFavoriteAlbum = (album: Album) => {
    if (!album.tracks) return;
    setFavoriteTracks(prev => {
      let updated = [...prev];
      const allFavorited = album.tracks!.every(t => prev.some(pt => pt.id === t.id));
      if (allFavorited) {
        updated = updated.filter(pt => !album.tracks!.some(t => t.id === pt.id));
      } else {
        const tracksToAdd = album.tracks!
          .filter(t => !prev.some(pt => pt.id === t.id))
          .map(track => ({ ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl }));
        updated = [...updated, ...tracksToAdd];
      }
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };`;

content = content.replace(oldToggleFavoriteAlbum, newToggleFavoriteAlbum);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
console.log('DownloadsContext favoriting patched.');
