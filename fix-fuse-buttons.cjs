const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Import FuseButton
if (!code.includes('FuseButton')) {
  code = code.replace(
    "import HoldButton from '../ui/HoldButton';",
    "import HoldButton from '../ui/HoldButton';\nimport FuseButton from '../ui/FuseButton';"
  );
}

// 2. Replace albumToRemove button 1
const albumBtn1 = /<button \s*onClick=\{\(\) => setAlbumToRemove\(groupedTracks\[selectedAlbumId\]\)\}\s*className="flex items-center gap-2 px-4 py-2 rounded-full border border-white\/20 hover:bg-white\/10 hover:border-white\/40 text-white transition-all font-medium text-sm"\s*>\s*<Trash2 className="w-4 h-4" \/>\s*Eliminar\s*<\/button>/g;

const newAlbumBtn1 = `<FuseButton
                      label="Eliminar"
                      undoLabel="Deshacer"
                      doneLabel="Eliminado"
                      background="transparent"
                      color="#ffffff"
                      fuseColor="#ef4444"
                      undoWindow={3000}
                      className="!h-10 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all font-medium text-sm"
                      onCommit={() => {
                        if (type === 'downloads') {
                          removeAlbumFromDownloads(groupedTracks[selectedAlbumId].id);
                        } else {
                          removeAlbumFromFavorites(groupedTracks[selectedAlbumId].id);
                        }
                      }}
                    />`;

if (code.match(albumBtn1)) {
  code = code.replace(albumBtn1, newAlbumBtn1);
  console.log("Replaced albumToRemove button 1");
}

// 3. Replace albumToRemove button 2 (icon only)
const albumBtn2 = /<button \s*onClick=\{\(\) => setAlbumToRemove\(group\)\}\s*className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white\/10 hover:text-red-400 text-white\/40 transition-colors"\s*title="Eliminar lista"\s*>\s*<Trash2 className="w-4 h-4" \/>\s*<\/button>/g;

const newAlbumBtn2 = `<FuseButton
                      label=""
                      undoLabel=""
                      doneLabel=""
                      background="transparent"
                      color="rgba(255,255,255,0.4)"
                      fuseColor="#ef4444"
                      undoWindow={3000}
                      className="!w-10 !h-10 !min-w-[40px] !px-0 rounded-full hover:bg-white/10 hover:text-red-400 transition-colors"
                      onCommit={() => {
                        if (type === 'downloads') {
                          removeAlbumFromDownloads(group.id);
                        } else {
                          removeAlbumFromFavorites(group.id);
                        }
                      }}
                    />`;

if (code.match(albumBtn2)) {
  code = code.replace(albumBtn2, newAlbumBtn2);
  console.log("Replaced albumToRemove button 2");
}

// 4. Replace trackToRemove button
const trackBtn = /<button \s*onClick=\{\(e\) => handleRemove\(e, track\)\}\s*className=\{`\$\{type === 'downloads' \? 'text-white\/30 hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-\[#a855f7\] hover:text-\[#b066f8\] opacity-100'\} transition-all p-2`\}\s*title=\{type === 'downloads' \? "Eliminar descarga" : "Quitar de favoritos"\}\s*>\s*\{type === 'downloads' \? <Trash2 className="w-4 h-4" \/> : <Heart className="w-4 h-4" fill="currentColor" \/>\}\s*<\/button>/g;

const newTrackBtn = `<FuseButton
            label=""
            undoLabel=""
            doneLabel=""
            background="transparent"
            color="rgba(255,255,255,0.3)"
            fuseColor="#ef4444"
            undoWindow={3000}
            className={\`\${type === 'downloads' ? 'hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-[#a855f7] hover:text-[#b066f8] opacity-100'} transition-all !w-8 !h-8 !min-w-[32px] !px-0 rounded-full\`}
            icon={type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <Heart className="w-4 h-4" fill="currentColor" />}
            onCommit={() => {
              if (type === 'downloads') {
                removeDownload(track.id);
              } else {
                toggleFavorite(track);
              }
            }}
          />`;

if (code.match(trackBtn)) {
  code = code.replace(trackBtn, newTrackBtn);
  console.log("Replaced trackToRemove button");
}

// 5. Remove modals
code = code.replace(/\{albumToRemove && createPortal\([\s\S]*?document\.body\s*\)\}/, '');
code = code.replace(/\{trackToRemove && createPortal\([\s\S]*?document\.body\s*\)\}/, '');

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Finished replacing FuseButtons");
