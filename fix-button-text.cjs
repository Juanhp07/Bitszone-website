const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const regex = /Eliminar todo\s*<\/HoldButton>/;

if (code.match(regex)) {
  code = code.replace(regex, 'Mantener para eliminar\n            </HoldButton>');
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log('Successfully updated HoldButton text');
} else {
  console.log('Could not find the target text');
}
