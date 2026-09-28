const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Update Hero Button
content = content.replace(
  /{type === 'downloads' \? 'Vaciar Descargas' : 'Vaciar Biblioteca'}/g,
  "{type === 'downloads' ? 'Vaciar Mis descargas' : 'Vaciar Biblioteca'}"
);

// Format date helper function (we can just inline it in renderTrack or add it near formatDuration)
const formatDurationFunc = `const formatDuration = (millis: number) => {`;
const newHelpers = `
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatSize = (sizeMb?: number, duration?: number) => {
    const mb = sizeMb || ((duration || 0) / 1000 * 0.0390625);
    return mb.toFixed(1) + ' MB';
  };

  const formatDuration = (millis: number) => {`;
if (!content.includes('const formatDate =')) {
  content = content.replace(formatDurationFunc, newHelpers);
}

// Update Header
const oldHeader = `<div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
                <div className="text-center">#</div>
                <div>Título</div>
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;
const newHeader = `<div className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
                <div className="text-center">#</div>
                <div>Título</div>
                <div>Añadido el</div>
                <div>Tamaño</div>
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;
content = content.replace(oldHeader, newHeader);

// Update Row
const oldRowHead = `className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"`;
const newRowHead = `className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"`;
content = content.replace(oldRowHead, newRowHead);

// Update Row Columns
const oldCols = `        <div className="flex items-center justify-end gap-4">
          <div className="w-10 text-right text-white/50 text-sm">
            {formatDuration(track.duration)}
          </div>
        </div>`;

const newCols = `        <div className="text-white/50 text-xs font-medium truncate">
          {formatDate(track.addedAt)}
        </div>
        
        <div className="text-white/50 text-xs font-medium">
          {formatSize(track.sizeMb, track.duration)}
        </div>
        
        <div className="flex items-center justify-end gap-4">
          <div className="w-10 text-right text-white/50 text-sm">
            {formatDuration(track.duration)}
          </div>
        </div>`;
content = content.replace(oldCols, newCols);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('DownloadsView grid patched');
