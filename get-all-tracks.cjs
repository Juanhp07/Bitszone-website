const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('tracks').select('*');
  if (error) console.error(error);
  else console.log(`Total tracks: ${data.length}`);
}
main();
