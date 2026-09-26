const fs = require('fs');
let file = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

// Update signature
file = file.replace('downloadTrack: (track: Track) => Promise<void>;', 'downloadTrack: (track: Track, album?: Album) => Promise<void>;');
file = file.replace('const downloadTrack = async (track: Track) => {', 'const downloadTrack = async (track: Track, album?: Album) => {');

// Update logic inside setTimeout
const oldLogic = `          if (prev.find(t => t.id === track.id)) return prev;
          const updated = [...prev, track];`;
const newLogic = `          if (prev.find(t => t.id === track.id)) return prev;
          const trackToSave = album ? { ...track, albumId: album.id, albumTitle: album.title, albumCover: album.coverUrl } : track;
          const updated = [...prev, trackToSave];`;

file = file.replace(oldLogic, newLogic);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', file);
