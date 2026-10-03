const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. HoldButton: change border-transparent to border-white/10
code = code.replace(
  'className="border border-transparent font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"',
  'className="border border-white/10 font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"'
);

// 2. Table Headers (there are two blocks for this in DownloadsView.tsx)
code = code.replace(
  /<div className="flex justify-end pr-6"><Clock className="w-4 h-4" \/><\/div>\s*<div><\/div>/g,
  '<div className="flex justify-end pr-6">TIEMPO</div>\n              <div className="text-center">{type === \'downloads\' ? \'\' : \'FAV\'}</div>'
);

code = code.replace(
  /<div className="flex justify-end pr-4"><Clock className="w-4 h-4" \/><\/div>\s*<div><\/div>/g,
  '<div className="flex justify-end pr-4">TIEMPO</div>\n                  <div className="text-center">{type === \'downloads\' ? \'\' : \'FAV\'}</div>'
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated Button and Headers in DownloadsView.");
