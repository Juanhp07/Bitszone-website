const fs = require('fs');

const files = [
  'src/components/player/ArtistView.tsx',
  'src/components/player/CatalogView.tsx',
  'src/components/player/AlbumView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Add ArrowDownCircle to lucide-react import if not present
  if (code.includes('lucide-react') && !code.includes('ArrowDownCircle')) {
    code = code.replace(/} from 'lucide-react';/, ', ArrowDownCircle } from \'lucide-react\';');
  }

  // Replace <Check className="..." /> with <ArrowDownCircle className="..." />
  // We'll replace '<Check ' with '<ArrowDownCircle '
  code = code.replace(/<Check className=/g, '<ArrowDownCircle fill="currentColor" stroke="black" className=');
  code = code.replace(/<Check \/>/g, '<ArrowDownCircle fill="currentColor" stroke="black" />');

  fs.writeFileSync(file, code);
  console.log(`Updated ${file}`);
});
