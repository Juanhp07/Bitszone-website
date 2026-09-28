const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Fix the Row definition
const rowMatch = /className="grid grid-cols-\[50px_1fr_120px_100px_100px_40px\] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white\/5"/g;
content = content.replace(rowMatch, 'className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"');

// Fix the Header class
const headerClassMatch = /className=\{`grid \$\{type === 'downloads' \? 'grid-cols-\[50px_1fr_120px_100px_100px_40px\]' : 'grid-cols-\[50px_1fr_120px_100px_40px\]'\} gap-4 px-4 py-3 text-white\/40 text-\[10px\] font-bold tracking-widest uppercase border-b border-white\/5 mb-3`\}/g;
content = content.replace(headerClassMatch, 'className="grid grid-cols-[50px_1fr_120px_100px_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3"');

// Fix the Header items
const badHeaderItems = `                <div>Añadido el</div>
                {type === 'downloads' && <div>Tamaño</div>}
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>`;
const goodHeaderItems = `                <div>Añadido el</div>
                <div>{type === 'downloads' ? 'Tamaño' : ''}</div>
                <div className="flex justify-end"><Clock className="w-4 h-4" /></div>`;
content = content.replace(badHeaderItems, goodHeaderItems);

// Fix the Row items
const badRowItems = `        {type === 'downloads' && (
          <div className="text-white/50 text-xs font-medium">
            {formatSize(track.sizeMb, track.duration)}
          </div>
        )}`;
const goodRowItems = `        <div className="text-white/50 text-xs font-medium">
          {type === 'downloads' ? formatSize(track.sizeMb, track.duration) : ''}
        </div>`;
content = content.replace(badRowItems, goodRowItems);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Alignment fixed!');
