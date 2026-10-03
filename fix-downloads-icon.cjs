const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldRegex = /@keyframes cloudBounce \{[\s\S]*?\}\s*\.custom-icon-downloads\s*\{[\s\S]*?\}/m;

const newCss = `@keyframes arrowSwipeDown {
          0% { transform: translateY(-4px); opacity: 0; }
          15% { transform: translateY(0px); opacity: 1; }
          75% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        .custom-icon-downloads {
          fill: transparent !important;
        }
        .custom-icon-downloads *:nth-child(n+2) {
          animation: arrowSwipeDown 2s ease-in-out infinite;
        }`;

if (code.match(oldRegex)) {
  code = code.replace(oldRegex, newCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Successfully replaced cloud bounce with downward arrow animation.");
} else {
  console.error("Could not find the old cloudBounce CSS block.");
}
