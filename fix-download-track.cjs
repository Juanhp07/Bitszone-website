const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

const replacement = `  const downloadTrack = async (track: Track, album?: Album) => {
    return new Promise<void>(async (resolve) => {
      let realSizeMb = track.sizeMb;
      try {
        const res = await fetch(track.previewUrl, { method: 'HEAD' });
        const len = res.headers.get('content-length');
        if (len) realSizeMb = parseInt(len, 10) / (1024 * 1024);
      } catch(e) {}

      setTimeout(() => {
        setDownloadedTracks(prev => {
          const trackWithRealSize = { ...track, sizeMb: realSizeMb || track.sizeMb };
          if (prev.find(t => t.id === trackWithRealSize.id)) return prev;`;

content = content.replace(
/  const downloadTrack = async \(track: Track, album\?: Album\) => \{\n\s*return new Promise<void>\(\(resolve\) => \{\n\s*setTimeout\(\(\) => \{\n\s*setDownloadedTracks\(prev => \{\n\s*if \(prev\.find\(t => t\.id === trackWithRealSize\.id\)\) return prev;/,
replacement
);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
