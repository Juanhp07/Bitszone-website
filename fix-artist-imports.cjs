const fs = require('fs');
let art = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

art = art.replace(
  "import { ArrowLeft, Play } from 'lucide-react';",
  "import { ArrowLeft, Play, Download, Check, Loader2 } from 'lucide-react';\nimport { useDownloads } from './DownloadsContext';"
);

fs.writeFileSync('src/components/player/ArtistView.tsx', art);
