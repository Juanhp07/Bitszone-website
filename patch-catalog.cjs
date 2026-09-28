const fs = require('fs');
let content = fs.readFileSync('src/components/player/useCatalog.ts', 'utf8');

const oldTrackPush = `album.tracks!.push({
            id: t.id,
            title: t.title,
            artist: t.artist,
            duration: t.duration,
            previewUrl: t.audio_url,
            trackNumber: t.track_number,
          });`;

const newTrackPush = `album.tracks!.push({
            id: t.id,
            title: t.title,
            artist: t.artist,
            duration: t.duration,
            previewUrl: t.audio_url,
            trackNumber: t.track_number,
            addedAt: t.created_at,
            sizeMb: t.size_mb || t.size || (t.duration / 1000 * 0.0390625)
          });`;

content = content.replace(oldTrackPush, newTrackPush);
fs.writeFileSync('src/components/player/useCatalog.ts', content);
console.log('useCatalog.ts patched');
