const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Replace 2s ease-in-out with 1.3s ease-in-out for all fluid animations
code = code.replace(/animation: fluidScale 2s ease-in-out infinite alternate;/g, 'animation: fluidScale 1.3s ease-in-out infinite alternate;');
code = code.replace(/animation: fluidLines 2s ease-in-out infinite alternate;/g, 'animation: fluidLines 1.3s ease-in-out infinite alternate;');
code = code.replace(/animation: fluidNote 2s ease-in-out infinite alternate;/g, 'animation: fluidNote 1.3s ease-in-out infinite alternate;');

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Successfully sped up the continuous playlist animation.");
