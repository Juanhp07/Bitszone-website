const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// The regex matches the block we added in the previous step
const fluidRegex = /@keyframes playlistFluid \{[\s\S]*?\}\s*\.custom-icon-playlists \{[\s\S]*?\}/m;

const wovenCss = `@keyframes playlistScale {
          0%, 100% { transform: scale(1); }
          15%, 85% { transform: scale(1.15); }
        }
        @keyframes playlistLines {
          0%, 45% { stroke-dashoffset: 0; fill: white; }
          55% { stroke-dashoffset: -100; fill: transparent; }
          56% { stroke-dashoffset: 100; fill: transparent; }
          75%, 100% { stroke-dashoffset: 0; fill: white; }
        }
        @keyframes playlistNote {
          0%, 75% { stroke-dashoffset: 0; fill: white; }
          85% { stroke-dashoffset: -100; fill: transparent; }
          86% { stroke-dashoffset: 100; fill: transparent; }
          100% { stroke-dashoffset: 0; fill: white; }
        }
        .custom-icon-playlists {
          animation: playlistScale 4s ease-in-out infinite;
          transform-origin: center;
          overflow: visible;
        }
        .custom-icon-playlists *:nth-child(n+3) {
          stroke-dasharray: 100;
          animation: playlistLines 4s ease-in-out infinite;
        }
        .custom-icon-playlists *:nth-child(-n+2) {
          stroke-dasharray: 100;
          animation: playlistNote 4s ease-in-out infinite;
        }`;

if (code.match(fluidRegex)) {
  code = code.replace(fluidRegex, wovenCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Successfully injected woven playlist drawing animation.");
} else {
  console.error("Could not find the playlistFluid CSS block.");
}
