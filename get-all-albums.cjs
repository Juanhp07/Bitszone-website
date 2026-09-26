const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key] = val.trim();
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('tracks').select('album, artist, image_url');
  if (data) {
    const unique = [];
    const seen = new Set();
    data.forEach(t => {
      if (!seen.has(t.album)) {
        seen.add(t.album);
        unique.push(t);
      }
    });
    console.log(JSON.stringify(unique, null, 2));
  }
}
main();
