const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

file = file.replace(
  '"https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/df/e8/3b/dfe83bb9-9d58-94df-73bb-eb1ec826317b/886445388062.jpg/500x500bb.jpg"',
  '"https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ac/f9/f2/acf9f236-eae7-023a-120d-6c071797512d/cover.jpg/500x500bb.jpg"'
);

file = file.replace(
  '"https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c7/28/68/c72868da-dbab-e95b-dddc-6379f64bfda9/653341334629.jpg/500x500bb.jpg"',
  '"https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/61/13/a461132e-73b6-10f9-5267-a64e53a01004/195079913662.jpg/500x500bb.jpg"'
);

fs.writeFileSync('src/components/FeatureSection.tsx', file);
