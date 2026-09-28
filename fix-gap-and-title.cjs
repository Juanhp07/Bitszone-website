const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Fix header string and layout
const oldHeader = `<div className="grid grid-cols-[50px_1fr_150px_100px_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
                <div className="text-center">#</div>
                <div>Título</div>
                <div>Añadido el</div>
                <div>{type === 'downloads' ? 'Tamaño' : ''}</div>
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;

const newHeader = `<div className={\`grid \${type === 'downloads' ? 'grid-cols-[50px_1fr_150px_100px_100px_40px]' : 'grid-cols-[50px_1fr_150px_100px_40px]'} gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3\`}>
                <div className="text-center">#</div>
                <div>Título</div>
                <div>Se añadió</div>
                {type === 'downloads' && <div>Tamaño</div>}
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                <div></div>
              </div>`;

content = content.replace(oldHeader, newHeader);


// 2. Fix row string and layout
const oldRowHead = `className="grid grid-cols-[50px_1fr_150px_100px_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"`;
const newRowHead = `className={\`grid \${type === 'downloads' ? 'grid-cols-[50px_1fr_150px_100px_100px_40px]' : 'grid-cols-[50px_1fr_150px_100px_40px]'} gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5\`}`;

content = content.replace(oldRowHead, newRowHead);

const oldRowCol = `<div className="text-white/50 text-xs font-medium">
          {type === 'downloads' ? formatSize(track.sizeMb, track.duration) : ''}
        </div>`;
const newRowCol = `{type === 'downloads' && (
          <div className="text-white/50 text-xs font-medium">
            {formatSize(track.sizeMb, track.duration)}
          </div>
        )}`;

content = content.replace(oldRowCol, newRowCol);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Fixed gaps and titles!');
