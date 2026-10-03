const fs = require('fs');

const files = [
  'src/components/player/ArtistView.tsx',
  'src/components/player/CatalogView.tsx',
  'src/components/player/AlbumView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Replace import
  code = code.replace(/ArrowDownCircle/g, 'CheckCircle2');

  // Replace usage
  code = code.replace(/<CheckCircle2 fill="currentColor" stroke="black" /g, '<CheckCircle2 strokeWidth={3} ');

  fs.writeFileSync(file, code);
  console.log(`Updated ${file}`);
});
