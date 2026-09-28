const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

content = content.replace(
  "if (confirmText === 'CONFIRMAR')",
  "if (confirmText.toUpperCase() === 'CONFIRMAR')"
);

content = content.replace(
  "disabled={confirmText !== 'CONFIRMAR'}",
  "disabled={confirmText.toUpperCase() !== 'CONFIRMAR'}"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
