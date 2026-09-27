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
  background-color: transparent !important;
}

::-webkit-scrollbar-track,
::-webkit-scrollbar-track-piece {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

::-webkit-scrollbar-thumb {
  background-color: #ffffff !important;
  border-radius: 10px !important;
  border: none !important;
}

::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  -webkit-appearance: none !important;
}

::-webkit-scrollbar-button:start:decrement,
::-webkit-scrollbar-button:end:increment,
::-webkit-scrollbar-button:vertical:start:increment,
::-webkit-scrollbar-button:vertical:end:decrement,
::-webkit-scrollbar-button:single-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none !important;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}

html {
  scrollbar-width: thin !important;
  scrollbar-color: #ffffff transparent !important;
}
`;

file += newScrollbarCSS;
fs.writeFileSync('src/styles/global.css', file);
