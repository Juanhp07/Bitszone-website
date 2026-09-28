const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

// 1. Add to interface
content = content.replace(
  'clearNewDownloads: () => void;\n}',
  'clearNewDownloads: () => void;\n  clearDownloads: () => void;\n  clearFavorites: () => void;\n}'
);

// 2. Add implementation
const implStr = `  const clearNewDownloads = () => setNewDownloadsCount(0);

  const clearDownloads = () => {
    setDownloadedTracks([]);
    localStorage.setItem('bz_downloads', JSON.stringify([]));
    calculateBytes([]);
  };

  const clearFavorites = () => {
    setFavoriteTracks([]);
    localStorage.setItem('bz_favorites', JSON.stringify([]));
  };`;

content = content.replace('  const clearNewDownloads = () => setNewDownloadsCount(0);', implStr);

// 3. Add to provider value
content = content.replace(
  'newDownloadsCount, clearNewDownloads',
  'newDownloadsCount, clearNewDownloads, clearDownloads, clearFavorites'
);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
console.log('DownloadsContext patched.');
