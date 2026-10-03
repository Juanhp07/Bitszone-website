const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Regex to catch the previous woven animation
const wovenRegex = /@keyframes playlistScale \{[\s\S]*?\}\s*@keyframes playlistLines \{[\s\S]*?\}\s*@keyframes playlistNote \{[\s\S]*?\}\s*\.custom-icon-playlists \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(n\+3\) \{[\s\S]*?\}\s*\.custom-icon-playlists \*:nth-child\(-n\+2\) \{[\s\S]*?\}/m;

const fluidNoPausesCss = `@keyframes fluidScale {
          0% { transform: scale(1.0); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); }
        }
        @keyframes fluidLines {
          0% { stroke-dashoffset: 24; fill: transparent; }
          100% { stroke-dashoffset: 0; fill: white; }
        }
        @keyframes fluidNote {
          0% { stroke-dashoffset: 0; fill: white; }
          100% { stroke-dashoffset: 24; fill: transparent; }
        }
        .custom-icon-playlists {
          animation: fluidScale 2s ease-in-out infinite alternate;
          transform-origin: center;
          overflow: visible;
        }
        .custom-icon-playlists *:nth-child(n+3) {
          stroke-dasharray: 24;
          animation: fluidLines 2s ease-in-out infinite alternate;
        }
        .custom-icon-playlists *:nth-child(-n+2) {
          stroke-dasharray: 24;
          animation: fluidNote 2s ease-in-out infinite alternate;
        }`;

if (code.match(wovenRegex)) {
  code = code.replace(wovenRegex, fluidNoPausesCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Successfully injected continuous, no-pauses playlist animation.");
} else {
  console.error("Could not find the previous woven playlist CSS to replace.");
}
