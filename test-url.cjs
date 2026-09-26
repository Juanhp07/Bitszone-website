const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 0 })).end();
  });
}

async function run() {
  const variations = [
    "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/25th%20Anniversary/El%20Barbero%20Loco.mp3",
    "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/El%20Gran%20Combo%20de%20Puerto%20Rico/El%20Barbero%20Loco.mp3",
    "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/El%20Gran%20Combo%20de%20Puerto%20Rico/25th%20Anniversary/El%20Barbero%20Loco.mp3",
    "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/25th%20Anniversary/Mima.mp3",
    "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/El%20Gran%20Combo%20de%20Puerto%20Rico/Mima.mp3"
  ];
  for (const url of variations) {
    console.log(await checkUrl(url));
  }
}
run();
