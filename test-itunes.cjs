const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const data = await fetchJson('https://itunes.apple.com/search?term=El+Gran+Combo+25th+Anniversary&entity=album&limit=5');
  console.log(data.results.map(a => ({ id: a.collectionId, name: a.collectionName, img: a.artworkUrl100 })));
}
run();
