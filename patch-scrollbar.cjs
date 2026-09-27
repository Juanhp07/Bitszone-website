const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

// Replace dark purple rgba with lighter translucent white
file = file.replace('background: rgba(192, 163, 229, 0.3);', 'background: rgba(255, 255, 255, 0.3);');
file = file.replace('background: rgba(192, 163, 229, 0.6);', 'background: rgba(255, 255, 255, 0.5);');
file = file.replace('scrollbar-color: rgba(192, 163, 229, 0.4) transparent;', 'scrollbar-color: rgba(255, 255, 255, 0.3) transparent;');

fs.writeFileSync('src/styles/global.css', file);
