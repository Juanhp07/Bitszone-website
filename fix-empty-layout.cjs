const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Remove the early return
const earlyReturnRegex = /if \(tracks\.length === 0\) \{[\s\S]*?return \([\s\S]*?<div className="h-full flex flex-col items-center justify-center relative z-10 px-8 text-center pt-24">[\s\S]*?<div className="w-24 h-24 bg-white\/5 rounded-full flex items-center justify-center mb-6">[\s\S]*?<Icon className="w-10 h-10 text-white\/20" \/>[\s\S]*?<\/div>[\s\S]*?<h2 className="text-2xl font-bold text-white mb-3">Tu lista está vacía<\/h2>[\s\S]*?<p className="text-white\/50 max-w-md">[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}/m;

const emptyStateMatch = code.match(earlyReturnRegex);
if (!emptyStateMatch) {
  console.error("Could not find early return for empty state!");
  process.exit(1);
}
const emptyStateStr = emptyStateMatch[0];
// Extract the inner div
const innerDivMatch = emptyStateStr.match(/<div className="h-full flex flex-col items-center justify-center relative z-10 px-8 text-center pt-24">[\s\S]*<\/p>\s*<\/div>/m);
let innerDivStr = innerDivMatch[0];
innerDivStr = innerDivStr.replace('pt-24', ''); // Remove padding top

// Remove the early return
code = code.replace(earlyReturnRegex, '');

// 2. Inject into the content area
const contentAreaStart = '<div className="flex-1 overflow-hidden relative">';
const contentAreaReplacement = `${contentAreaStart}\n        {tracks.length === 0 ? (\n          ${innerDivStr}\n        ) : (\n`;

// Find the matching closing div for the content area
// In DownloadsView.tsx, the content area is right before the end of the return statement
// Let's just do a string replacement on the start
code = code.replace(contentAreaStart, contentAreaReplacement);

// We need to close the ternary operator at the end of the component
// The last few lines are:
//       </div>
//     </div>
//   );
// };
// We need to change it to:
//         )}
//       </div>
//     </div>
//   );
// };

// Find the end
code = code.replace(
  /      <\/div>\n    <\/div>\n  \);\n};/,
  "        )}\n      </div>\n    </div>\n  );\n};"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Empty state successfully moved into the main content area.");
