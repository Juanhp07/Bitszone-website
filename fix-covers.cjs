const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const updates = [
    { album: 'Ahora Más Que Nunca', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ac/f9/f2/acf9f236-eae7-023a-120d-6c071797512d/cover.jpg/500x500bb.jpg' },
    { album: 'Coverizando', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/61/13/a461132e-73b6-10f9-5267-a64e53a01004/195079913662.jpg/500x500bb.jpg' },
    { album: 'Meteoro', url: 'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/500x500bb.jpg' }
  ];

  for (const up of updates) {
    const { data, error } = await supabase.from('tracks').update({ image_url: up.url }).eq('album', up.album);
    if (error) {
      console.error("Error for", up.album, error);
    } else {
      console.log("Updated", up.album);
    }
  }
}
main();
