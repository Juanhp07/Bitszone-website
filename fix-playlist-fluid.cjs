const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// The regex needs to carefully match the playlist animations we added last time
const oldPlaylistCssRegex = /@keyframes playlistScale \{[\s\S]*?\}\s*@keyframes playlistDrawAndFill \{[\s\S]*?\}\s*\.custom-icon-playlists \{[\s\S]*?\}\s*\.custom-icon-playlists path,[\s\S]*?animation: playlistDrawAndFill 4s ease-in-out infinite;\s*\}/m;

// If the regex above doesn't match because we updated it to playlistLinesDraw and playlistNoteDraw:
const alternativeRegex = /@keyframes playlistLinesDraw \{[\s\S]*?\}\s*@keyframes playlistNoteDraw \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(n\+3\) \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(-n\+2\) \{[\s\S]*?\}/m;

const scaleRegex = /@keyframes playlistScale \{[\s\S]*?\}/m;

const newCss = `@keyframes playlistFluid {
          0%, 100% { transform: scale(1); fill: transparent; filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
          50% { transform: scale(1.15); fill: white; filter: drop-shadow(0 0 15px rgba(255,255,255,0.5)); }
        }
        .custom-icon-playlists {
          animation: playlistFluid 3.5s ease-in-out infinite;
          transform-origin: center;
          overflow: visible;
        }`;

let replaced = false;

if (code.match(alternativeRegex)) {
  code = code.replace(alternativeRegex, newCss);
  // Also remove playlistScale if it's separate
  code = code.replace(scaleRegex, '');
  replaced = true;
} else if (code.match(oldPlaylistCssRegex)) {
  code = code.replace(oldPlaylistCssRegex, newCss);
  replaced = true;
}

if (replaced) {
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Replaced with perfectly fluid playlist animation.");
} else {
  console.error("Could not find the old CSS pattern to replace.");
}
