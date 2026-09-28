const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

const oldCalc = `const calculateBytes = (tracks: Track[]) => {
    const bytes = tracks.length * 8 * 1024 * 1024;
    setTotalBytes(bytes);
  };`;

const newCalc = `const calculateBytes = (tracks: Track[]) => {
    // Calculamos los megabytes usando el campo sizeMb o el estimado por duracion
    const totalMb = tracks.reduce((sum, t) => sum + (t.sizeMb || (t.duration / 1000 * 0.0390625)), 0);
    // Lo guardamos en bytes para no romper el tipado anterior que usa bytes
    setTotalBytes(totalMb * 1024 * 1024);
  };`;

content = content.replace(oldCalc, newCalc);
fs.writeFileSync('src/components/player/DownloadsContext.tsx', content);
console.log('DownloadsContext calculateBytes patched');
