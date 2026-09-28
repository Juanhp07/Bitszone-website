const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

// Update Interface
content = content.replace('clearDownloads: () => void;', 'removeAlbumFromDownloads: (albumId: string) => void;\n  removeAlbumFromFavorites: (albumId: string) => void;\n  clearDownloads: () => void;');

// Add implementation
const clearDownloadsImpl = 'const clearDownloads = () => {';
const removeAlbumImpl = `const removeAlbumFromDownloads = (albumId: string) => {
    setDownloadedTracks(prev => {
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_downloads', JSON.stringify(updated));
      calculateBytes(updated);
      return updated;
    });
  };

  const removeAlbumFromFavorites = (albumId: string) => {
    setFavoriteTracks(prev => {
      const updated = prev.filter(t => (t.albumId ? String(t.albumId) : 'unknown') !== albumId);
      localStorage.setItem('bz_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const clearDownloads = () => {`;
content = content.replace(clearDownloadsImpl, removeAlbumImpl);

// Export
const exportImpl = `newDownloadsCount, clearNewDownloads, clearDownloads, clearFavorites`;
const newExportImpl = `newDownloadsCount, clearNewDownloads, removeAlbumFromDownloads, removeAlbumFromFavorites, clearDownloads, clearFavorites`;
content = content.replace(exportImpl, newExportImpl);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
console.log('DownloadsContext patched');
