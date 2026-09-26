const fs = require('fs');
let file = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

file = file.replace(
  "const albumsScrollRef = useDraggableScroll();",
  "const albumsScrollRef = useDraggableScroll();\n  const albumsScrollRef2 = useDraggableScroll();"
);

// We have 3 occurrences of `albumsScrollRef`. We should replace the second one with albumsScrollRef2.
let count = 0;
file = file.replace(/ref=\{albumsScrollRef as any\}/g, (match) => {
  count++;
  if (count === 2) return "ref={albumsScrollRef2 as any}";
  return match;
});

fs.writeFileSync('src/components/player/CatalogView.tsx', file);
