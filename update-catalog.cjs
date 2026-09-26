const fs = require('fs');
let file = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// Import useDraggableScroll
file = file.replace(
  "import { useDownloads } from './DownloadsContext';",
  "import { useDownloads } from './DownloadsContext';\nimport { useDraggableScroll } from './useDraggableScroll';"
);

// Add refs inside CatalogView
file = file.replace(
  "  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);",
  "  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);\n\n  const artistsScrollRef = useDraggableScroll();\n  const albumsScrollRef = useDraggableScroll();"
);

// Build dynamic artists
const dynamicArtistsLogic = `
  const knownArtistImages: Record<string, string> = {
    'Michael Jackson': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg/500px-Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg',
    'Linkin Park': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg',
    'Post Malone': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Post_Malone_July_2021_%28cropped%29.jpg/500px-Post_Malone_July_2021_%28cropped%29.jpg',
    'Ismael Rivera': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1f/14/af/1f14af69-7164-3ea6-65dc-ccd79ee5c340/18CRGIM08038.rgb.jpg/500x500bb.jpg',
    'El Gran Combo de Puerto Rico': 'https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/25/87/e5/2587e5b0-b22b-f971-cb23-13381790d852/dj.nwovtbjq.jpg/500x500bb.jpg'
  };

  const artistsMap = new Map();
  albums.forEach(album => {
    if (!artistsMap.has(album.artist)) {
      artistsMap.set(album.artist, {
        name: album.artist,
        img: knownArtistImages[album.artist] || album.coverUrl,
        type: album.artist.includes('Combo') || album.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista'
      });
    }
  });
  const dynamicArtists = Array.from(artistsMap.values());
`;

file = file.replace(
  "  const executeDownloadAlbum = async () => {",
  dynamicArtistsLogic + "\n  const executeDownloadAlbum = async () => {"
);

// Replace popular artists rendering
file = file.replace(
  /<div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style=\{\{ scrollbarWidth: 'none' \}\}>\n\s+\{\[\n\s+\{ name: 'Michael Jackson'[\s\S]*?\]\.map\(\(artist, i\) => \(/,
  `<div ref={artistsScrollRef as any} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {dynamicArtists.map((artist, i) => (`
);

// Add scroll ref to Albums section
// Search for `<div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"` which should be the second one (for albums)
// Actually I'll use regex to replace all `<div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>`
// There might be a second one for "Nuevos lanzamientos" or "Álbumes".
// Since I already replaced the first one with `ref={artistsScrollRef as any}`, the next one(s) will be the ones missing refs. Let's just find the Albums one.
file = file.replace(
  /<div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style=\{\{ scrollbarWidth: 'none' \}\}>/g,
  `<div ref={albumsScrollRef as any} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>`
);

fs.writeFileSync('src/components/player/CatalogView.tsx', file);
