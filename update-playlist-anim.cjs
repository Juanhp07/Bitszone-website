const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldCssRegex = /@keyframes playlistDrawAndFill \{[\s\S]*?\}\s*\.custom-icon-playlists path,\s*\.custom-icon-playlists line,\s*\.custom-icon-playlists polyline,\s*\.custom-icon-playlists circle \{\s*stroke-dasharray: 100;\s*stroke-dashoffset: 100;\s*animation: playlistDrawAndFill 4s ease-in-out infinite;\s*\}/m;

const newCss = `@keyframes playlistLinesDraw {
          0% { stroke-dashoffset: 100; fill: transparent; }
          20% { stroke-dashoffset: 0; fill: transparent; }
          30%, 50% { stroke-dashoffset: 0; fill: white; }
          65%, 100% { stroke-dashoffset: -100; fill: transparent; }
        }
        @keyframes playlistNoteDraw {
          0% { stroke-dashoffset: 100; fill: transparent; }
          20% { stroke-dashoffset: 0; fill: transparent; }
          30%, 80% { stroke-dashoffset: 0; fill: white; }
          95%, 100% { stroke-dashoffset: -100; fill: transparent; }
        }
        .custom-icon-playlists *:nth-child(n+3) {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: playlistLinesDraw 4s ease-in-out infinite;
        }
        .custom-icon-playlists *:nth-child(-n+2) {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: playlistNoteDraw 4s ease-in-out infinite;
        }`;

if (code.match(oldCssRegex)) {
  code = code.replace(oldCssRegex, newCss);
  
  // also adjust the playlistScale to stay scaled longer to match the note
  const scaleRegex = /@keyframes playlistScale \{\s*0%, 100% \{ transform: scale\(1\); \}\s*25%, 75% \{ transform: scale\(1\.15\); \}\s*\}/m;
  const newScale = `@keyframes playlistScale {
          0%, 100% { transform: scale(1); }
          25%, 85% { transform: scale(1.15); }
        }`;
  code = code.replace(scaleRegex, newScale);

  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Updated playlist animation to stagger the lines and musical note.");
} else {
  console.error("Could not find the old CSS pattern.");
}
