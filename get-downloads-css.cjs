const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');
const match = code.match(/@keyframes cloudBounce[\s\S]*?\}\s*\.custom-icon-downloads\s*\{[\s\S]*?\}/m);
if (match) {
  console.log(match[0]);
} else {
  console.log("Not found");
}
