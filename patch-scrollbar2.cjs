const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

// Replace translucent white with almost solid white
file = file.replace(/rgba\(255, 255, 255, 0\.3\)/g, 'rgba(255, 255, 255, 0.8)');
file = file.replace(/rgba\(255, 255, 255, 0\.5\)/g, '#ffffff');

fs.writeFileSync('src/styles/global.css', file);
