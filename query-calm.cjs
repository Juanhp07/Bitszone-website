const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('tracks').select('id, title, audio_url').eq('album', 'CALM');
  console.log(data ? `Found ${data.length} tracks for CALM` : error);
}
main();
