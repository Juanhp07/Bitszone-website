const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

const newAlbum = `  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/04/31/61/0431617b-8479-58fe-3cc3-9fbfef175a71/20UMGIM06593.rgb.jpg/500x500bb.jpg",
    alt: "5 Seconds of Summer - CALM",
    title: "CALM",
    artist: "5 Seconds of Summer",
    color: "#f43f5e" // Rose/Pink
  }
];`;

file = file.replace(/];/, ",\n" + newAlbum);

fs.writeFileSync('src/components/FeatureSection.tsx', file);
