const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const regex = /@keyframes fluidScale \{[\s\S]*?\}\s*@keyframes fluidLines \{[\s\S]*?\}\s*@keyframes fluidNote \{[\s\S]*?\}\s*\.custom-icon-playlists \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(n\+3\) \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(-n\+2\) \{[\s\S]*?\}/m;

const newCss = `@keyframes fluidScale {
          0%, 100% { transform: scale(1.0); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); }
        }
        @keyframes fluidLines {
          0%, 35% { stroke-dashoffset: 0; fill: white; }
          50% { stroke-dashoffset: 24; fill: transparent; }
          65%, 100% { stroke-dashoffset: 0; fill: white; }
        }
        @keyframes fluidNote {
          0%, 10% { stroke-dashoffset: 0; fill: white; }
          25% { stroke-dashoffset: 24; fill: transparent; }
          40%, 100% { stroke-dashoffset: 0; fill: white; }
        }
        .custom-icon-playlists {
          animation: fluidScale 3s ease-in-out infinite;
          transform-origin: center;
          overflow: visible;
        }
        .custom-icon-playlists *:nth-child(n+3) {
          stroke-dasharray: 24;
          animation: fluidLines 3s ease-in-out infinite;
        }
        .custom-icon-playlists *:nth-child(-n+2) {
          stroke-dasharray: 24;
          animation: fluidNote 3s ease-in-out infinite;
        }`;

if (code.match(regex)) {
  code = code.replace(regex, newCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Successfully replaced the playlist animation to include a full-state moment.");
} else {
  console.error("Could not find the fluidScale block.");
}
