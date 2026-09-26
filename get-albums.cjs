const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('tracks').select('album, artist, image_url, audio_url, id');
  if (error) {
    console.error(error);
  } else {
    const albums = new Set();
    data.forEach(t => albums.add(t.album));
    console.log("Albums in DB:", Array.from(albums));
  }
}
main();
