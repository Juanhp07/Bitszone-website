const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

const newAlbums = `  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/df/e8/3b/dfe83bb9-9d58-94df-73bb-eb1ec826317b/886445388062.jpg/500x500bb.jpg",
    alt: "Adolescent's Orquesta - Ahora Mas Que Nunca",
    title: "Ahora Mas Que Nunca",
    artist: "Adolescent's Orquesta",
    color: "#eab308" // Yellow/Gold
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c7/28/68/c72868da-dbab-e95b-dddc-6379f64bfda9/653341334629.jpg/500x500bb.jpg",
    alt: "Zaperoko - Coverizando",
    title: "Coverizando",
    artist: "Zaperoko",
    color: "#22c55e" // Green
  }
];`;

file = file.replace(/];/, ",\n" + newAlbums);

fs.writeFileSync('src/components/FeatureSection.tsx', file);
