const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 0 })).end();
  });
}

async function run() {
  const { data: tracks, error } = await supabase.from('tracks').select('id, title, album, audio_url').order('album');
  
  let ok = 0;
  let fail = 0;
  for (const t of tracks) {
    const res = await checkUrl(t.audio_url);
    if (res.status === 200) {
      ok++;
    } else {
      console.log(`[FAIL ${res.status}] ${t.album} - ${t.title}`);
      fail++;
    }
  }
  console.log(`Total OK: ${ok}, Total FAIL: ${fail}`);
}
run();
