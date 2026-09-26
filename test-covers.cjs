const covers = {
  "Thriller": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/500x500bb.jpg",
  "Ahora Más Que Nunca": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/df/e8/3b/dfe83bb9-9d58-94df-73bb-eb1ec826317b/886445388062.jpg/500x500bb.jpg",
  "Esto Fue Lo Que Trajo El Barco": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1f/14/af/1f14af69-7164-3ea6-65dc-ccd79ee5c340/18CRGIM08038.rgb.jpg/500x500bb.jpg",
  "Meteoro": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg",
  "Coverizando": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c7/28/68/c72868da-dbab-e95b-dddc-6379f64bfda9/653341334629.jpg/500x500bb.jpg",
  "Hollywood's Bleeding": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/13/27/6c13279a-399b-2631-3cb2-6233a91d7a53/19UMGIM78325.rgb.jpg/500x500bb.jpg",
  "CALM": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/04/31/61/0431617b-8479-58fe-3cc3-9fbfef175a71/20UMGIM06593.rgb.jpg/500x500bb.jpg",
  "25th Anniversary": "https://is1-ssl.mzstatic.com/image/thumb/Features/ab/71/ff/dj.klgvouou.jpg/500x500bb.jpg"
};

const http = require('https');

for (const [album, url] of Object.entries(covers)) {
  http.get(url, (res) => {
    console.log(`Album: ${album} -> Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.log(`Album: ${album} -> Error: ${e.message}`);
  });
}
