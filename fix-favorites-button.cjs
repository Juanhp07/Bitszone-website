const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const regex = /<div className="flex items-center justify-center">\s*<FuseButton\s*label=""\s*undoLabel=""\s*doneLabel=""\s*background="transparent"\s*color=\{type === 'downloads' \? 'rgba\(255,255,255,0\.3\)' : '#a855f7'\}\s*fuseColor="#ef4444"\s*undoWindow=\{3000\}\s*commitOn="fuseEnd"\s*className=\{`\$\{type === 'downloads' \? 'hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-\[#a855f7\] hover:text-\[#b066f8\] opacity-100'\} transition-all !w-8 !h-8 !min-w-\[32px\] !px-0 rounded-full`\}\s*icon=\{type === 'downloads' \? <Trash2 className="w-4 h-4" \/> : <Heart className="w-4 h-4" fill="currentColor" \/>\}\s*onCommit=\{\(\) => \{\s*if \(type === 'downloads'\) \{\s*removeDownload\(track\.id\);\s*\} else \{\s*toggleFavorite\(track\);\s*\}\s*\}\}\s*\/>\s*<\/div>/g;

const newBlock = `<div className="flex items-center justify-center">
          {type === 'downloads' ? (
            <FuseButton
              label=""
              undoLabel=""
              doneLabel=""
              background="transparent"
              color="rgba(255,255,255,0.3)"
              fuseColor="#ef4444"
              undoWindow={3000}
              commitOn="fuseEnd"
              className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all !w-8 !h-8 !min-w-[32px] !px-0 rounded-full"
              icon={<Trash2 className="w-4 h-4" />}
              onCommit={() => removeDownload(track.id)}
            />
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
              className="text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4" fill="currentColor" />
            </button>
          )}
        </div>`;

if (code.match(regex)) {
  code = code.replace(regex, newBlock);
  console.log("Successfully reverted favorites to standard button.");
} else {
  console.log("Could not find the block to replace.");
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
