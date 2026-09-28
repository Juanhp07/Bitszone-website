const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Update formatSize multiplier
content = content.replace(
  /const mb = sizeMb \|\| \(\(duration \|\| 0\) \/ 1000 \* 0\.0390625\);/,
  'const mb = sizeMb || ((duration || 0) / 1000 * 0.023);'
);

// We need a variable for gridColsClass inside the component
// The component is `export const DownloadsView = ({ type = 'downloads', ...`
// We can just inline the ternary operator into the className strings.

const oldHeader = `<div className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
                <div className="text-center">#</div>
                <div>Título</div>
                <div>Añadido el</div>
                <div>Tamaño</div>
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;

const newHeader = `<div className={\`grid \${type === 'downloads' ? 'grid-cols-[50px_1fr_120px_100px_100px_40px]' : 'grid-cols-[50px_1fr_120px_100px_40px]'} gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3\`}>
                <div className="text-center">#</div>
                <div>Título</div>
                <div>Añadido el</div>
                {type === 'downloads' && <div>Tamaño</div>}
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;

content = content.replace(oldHeader, newHeader);

const oldRow = `<div className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5">`;
const newRow = `<div className={\`grid \${type === 'downloads' ? 'grid-cols-[50px_1fr_120px_100px_100px_40px]' : 'grid-cols-[50px_1fr_120px_100px_40px]'} gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5\`}>`;

content = content.replace(oldRow, newRow);

const oldCols = `<div className="text-white/50 text-xs font-medium truncate">
          {formatDate(track.addedAt)}
        </div>
        
        <div className="text-white/50 text-xs font-medium">
          {formatSize(track.sizeMb, track.duration)}
        </div>`;
const newCols = `<div className="text-white/50 text-xs font-medium truncate">
          {formatDate(track.addedAt)}
        </div>
        
        {type === 'downloads' && (
          <div className="text-white/50 text-xs font-medium">
            {formatSize(track.sizeMb, track.duration)}
          </div>
        )}`;

content = content.replace(oldCols, newCols);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('DownloadsView patched with dynamic columns based on type');
