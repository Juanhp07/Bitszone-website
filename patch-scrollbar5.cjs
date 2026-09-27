const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

const marker = "/* Modern Scrollbar globally */";
const index = file.indexOf(marker);
if (index !== -1) {
  file = file.substring(0, index);
}

const newScrollbarCSS = `/* Modern Scrollbar globally */
html, body, * {
  scrollbar-width: none !important;
}

::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
  background-color: transparent !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
  background-color: transparent !important;
}

::-webkit-scrollbar-thumb {
  background: #ffffff !important;
  background-color: #ffffff !important;
  border-radius: 10px !important;
  opacity: 1 !important;
}

::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}
`;

file += newScrollbarCSS;
fs.writeFileSync('src/styles/global.css', file);
