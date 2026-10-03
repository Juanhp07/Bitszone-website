const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const regex = /@keyframes arrowSwipeDown \{[\s\S]*?\}\s*\.custom-icon-downloads\s*\{[\s\S]*?\}\s*\.custom-icon-downloads \*:nth-child\(n\+2\) \{[\s\S]*?\}/m;

const newCss = `@keyframes arrowSwipeDown {
          0% { transform: translateY(-4px); opacity: 0; }
          20% { transform: translateY(0px); opacity: 1; }
          80% { transform: translateY(4px); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes cloudPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .custom-icon-downloads {
          fill: transparent !important;
          overflow: visible;
        }
        /* La nube siempre contiene arcos (A o a) en su path */
        .custom-icon-downloads path[d*="A"],
        .custom-icon-downloads path[d*="a"] {
          animation: cloudPulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        /* La flecha son lineas rectas, no contiene arcos */
        .custom-icon-downloads path:not([d*="A"]):not([d*="a"]),
        .custom-icon-downloads line,
        .custom-icon-downloads polyline {
          animation: arrowSwipeDown 1.8s ease-in-out infinite;
        }`;

if (code.match(regex)) {
  code = code.replace(regex, newCss);
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Successfully replaced generic nth-child targets with exact path targets for the cloud and arrow.");
} else {
  console.error("Could not find the previous arrowSwipeDown CSS block.");
}
