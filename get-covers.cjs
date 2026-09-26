const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('tracks').select('album, image_url');
  if (error) {
    console.error(error);
  } else {
    const covers = {};
    data.forEach(t => {
      covers[t.album] = t.image_url;
    });
    console.log(JSON.stringify(covers, null, 2));
  }
}
main();
