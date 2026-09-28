const track = { id: 1, title: 'Test' };
const album = { id: 'Hollywood', title: 'Hollywood', coverUrl: 'url', tracks: [track] };
const prev = [];

const allFavorited = album.tracks.every(t => prev.some(pt => pt.id === t.id));
let updated = [...prev];
if (allFavorited) {
  updated = updated.filter(pt => !album.tracks.some(t => t.id === pt.id));
} else {
  const tracksToAdd = album.tracks
    .filter(t => !prev.some(pt => pt.id === t.id))
    .map(t => ({ ...t, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl }));
  updated = [...updated, ...tracksToAdd];
}
console.log(updated);
