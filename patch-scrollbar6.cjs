const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

const marker = "/* Modern Scrollbar globally */";
const index = file.indexOf(marker);
if (index !== -1) {
  file = file.substring(0, index);
}

const newScrollbarCSS = `/* Modern Scrollbar globally */
::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
  background: transparent !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
}

::-webkit-scrollbar-track-piece {
  background: transparent !important;
}

::-webkit-scrollbar-thumb {
  background: #ffffff !important;
  border-radius: 10px !important;
  border: none !important;
}

::-webkit-scrollbar-button {
  display: none !important;
  width: 0px !important;
  height: 0px !important;
  background: transparent !important;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}

/* Firefox support */
* {
  scrollbar-width: thin !important;
  scrollbar-color: #ffffff transparent !important;
}
`;

file += newScrollbarCSS;
fs.writeFileSync('src/styles/global.css', file);
