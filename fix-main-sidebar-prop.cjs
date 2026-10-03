const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

code = code.replace(
  '<Sidebar currentView={currentView}',
  '<Sidebar isSadMode={isSadMode} currentView={currentView}'
);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Sidebar prop patched in MainApp');
