const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

// 1. Add background HEAD fetcher for downloaded tracks
// We'll hook into useEffect where it loads from localStorage
const oldLoad = `    const savedDownloads = localStorage.getItem('bz_downloads');
    if (savedDownloads) {
      try {
        const parsed = JSON.parse(savedDownloads);
        setDownloadedTracks(parsed);
        calculateBytes(parsed);
      } catch (e) {}
    }`;

const newLoad = `    const savedDownloads = localStorage.getItem('bz_downloads');
    if (savedDownloads) {
      try {
        const parsed = JSON.parse(savedDownloads);
        setDownloadedTracks(parsed);
        calculateBytes(parsed);
        
        // Background fetch real sizes if missing
        let changed = false;
        Promise.all(parsed.map(async (t: Track) => {
          if (!t.sizeMb || t.sizeMb === (t.duration / 1000 * 0.023) || t.sizeMb === (t.duration / 1000 * 0.0390625)) {
            try {
              const res = await fetch(t.previewUrl, { method: 'HEAD' });
              const len = res.headers.get('content-length');
              if (len) {
                t.sizeMb = parseInt(len, 10) / (1024 * 1024);
                changed = true;
              }
            } catch(e) {}
          }
          return t;
        })).then(updated => {
          if (changed) {
            setDownloadedTracks([...updated]);
            localStorage.setItem('bz_downloads', JSON.stringify(updated));
            calculateBytes(updated);
          }
        });
      } catch (e) {}
    }`;

content = content.replace(oldLoad, newLoad);

// 2. Add real time addedAt to downloadTrack
const oldSaveDownload = `const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;`;
const newSaveDownload = `const trackToSave = { ...track, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };`;

content = content.replace(oldSaveDownload, newSaveDownload);

// 3. Add real time addedAt to toggleFavorite (for both single and album)
const oldToggleFav = `const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;`;
const newToggleFav = `const trackToSave = { ...track, albumId: album?.id || track.albumId, albumTitle: album?.title || track.albumTitle, albumCover: album?.coverUrl || track.albumCover, addedAt: track.addedAt || new Date().toISOString() };`;
content = content.replace(oldToggleFav, newToggleFav);

// 4. Same for toggleFavoriteAlbum
const oldFavAlbum = `const trackToSave = { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl };`;
const newFavAlbum = `const trackToSave = { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl, addedAt: track.addedAt || new Date().toISOString() };`;
content = content.replace(oldFavAlbum, newFavAlbum);

// Wait! downloadTrack also needs to fetch HEAD dynamically if possible, or it will be caught on the next reload. 
// Let's just fetch it in downloadTrack as well.
const oldDownloadTrack = `const downloadTrack = async (track: Track, album?: Album) => {
    // Simulamos un retraso para mostrar un loader si se quiere
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDownloadedTracks(prev => {`;
const newDownloadTrack = `const downloadTrack = async (track: Track, album?: Album) => {
    // Simulamos un retraso para mostrar un loader si se quiere
    return new Promise<void>(async (resolve) => {
      let realSizeMb = track.sizeMb;
      try {
        const res = await fetch(track.previewUrl, { method: 'HEAD' });
        const len = res.headers.get('content-length');
        if (len) realSizeMb = parseInt(len, 10) / (1024 * 1024);
      } catch(e) {}

      setTimeout(() => {
        setDownloadedTracks(prev => {
          const trackWithRealSize = { ...track, sizeMb: realSizeMb || track.sizeMb };`;

content = content.replace(oldDownloadTrack, newDownloadTrack);

// We need to replace the reference to track inside the setState callback
content = content.replace(
  /if \(prev\.find\(t => t\.id === track\.id\)\) return prev;/,
  `if (prev.find(t => t.id === trackWithRealSize.id)) return prev;`
);

content = content.replace(
  /const trackToSave = \{ \.\.\.track, albumId:/,
  `const trackToSave = { ...trackWithRealSize, albumId:`
);


fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
console.log('DownloadsContext patched for exact sizes and real time dates');
