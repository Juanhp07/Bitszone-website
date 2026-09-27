const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

// We will replace the entire /* Modern Scrollbar globally */ block
const regex = /\/\* Modern Scrollbar globally \*\/[\s\S]*?(?=\n\n|\Z)/;

const newScrollbarCSS = `/* Modern Scrollbar globally */
::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}
::-webkit-scrollbar-track {
  background: transparent !important;
}
::-webkit-scrollbar-thumb {
  background: #ffffff !important;
  border-radius: 10px !important;
  border: 2px solid transparent !important;
  background-clip: padding-box !important;
}
::-webkit-scrollbar-thumb:hover {
  background: #ffffff !important;
}
::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
::-webkit-scrollbar-corner {
  background: transparent !important;
}

/* Firefox support */
* {
  scrollbar-width: thin !important;
  scrollbar-color: #ffffff transparent !important;
}`;

// Replace the old block (including Firefox block)
file = file.replace(/\/\* Modern Scrollbar globally \*\/[\s\S]*?\* \{\n  scrollbar-width: thin;\n  scrollbar-color: rgba\(255, 255, 255, 0\.8\) transparent;\n\}/g, newScrollbarCSS);

// Fallback in case regex missed (e.g. if the Firefox block was already matched differently)
// Actually, let's just do it simpler: search for "Modern Scrollbar globally" to the end of the file, since I appended it at the end.
