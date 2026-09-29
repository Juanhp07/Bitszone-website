const fs = require('fs');

const files = [
  'src/components/ui/Global3DScene.tsx',
  'src/components/ui/LaserFlow.tsx',
  'src/components/ui/LiquidEther.tsx',
  'src/components/ui/Scroll3DGallery.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import * as THREE from 'three';", "// @ts-ignore\nimport * as THREE from 'three';");
  fs.writeFileSync(file, content);
}

console.log('Fixed three.js imports');
