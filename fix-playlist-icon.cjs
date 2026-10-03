const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldCssRegex = /@keyframes drawPlaylist \{[\s\S]*?\}\s*\.custom-icon-playlists path,\s*\.custom-icon-playlists line,\s*\.custom-icon-playlists polyline,\s*\.custom-icon-playlists circle \{\s*stroke-dasharray: 100;\s*stroke-dashoffset: 100;\s*animation: drawPlaylist 4s ease-in-out infinite;\s*\}/m;

const newCss = `@keyframes playlistScale {
          0%, 100% { transform: scale(1); }
          25%, 75% { transform: scale(1.15); }
        }
        @keyframes playlistDrawAndFill {
          0% { stroke-dashoffset: 100; fill: transparent; }
          25% { stroke-dashoffset: 0; fill: transparent; }
          35%, 65% { stroke-dashoffset: 0; fill: white; }
          75% { stroke-dashoffset: 0; fill: transparent; }
          100% { stroke-dashoffset: -100; fill: transparent; }
        }
        .custom-icon-playlists {
          animation: playlistScale 4s ease-in-out infinite;
          transform-origin: center;
          overflow: visible;
        }
        .custom-icon-playlists path,
        .custom-icon-playlists line,
        .custom-icon-playlists polyline,
        .custom-icon-playlists circle {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: playlistDrawAndFill 4s ease-in-out infinite;
        }`;

if (code.match(oldCssRegex)) {
  code = code.replace(oldCssRegex, newCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Fixed Playlist icon clipping and scale centering.");
} else {
  console.error("Could not find old playlist CSS to replace.");
}
