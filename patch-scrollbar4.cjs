const fs = require('fs');
let file = fs.readFileSync('src/styles/global.css', 'utf8');

const regex = /::-webkit-scrollbar-button \{[\s\S]*?\}/g;

const improvedButtons = `::-webkit-scrollbar-button,
::-webkit-scrollbar-button:start:decrement,
::-webkit-scrollbar-button:end:increment,
::-webkit-scrollbar-button:vertical:start:increment,
::-webkit-scrollbar-button:vertical:end:decrement,
::-webkit-scrollbar-button:horizontal:start:increment,
::-webkit-scrollbar-button:horizontal:end:decrement {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  -webkit-appearance: none !important;
}`;

file = file.replace(regex, improvedButtons);

fs.writeFileSync('src/styles/global.css', file);
