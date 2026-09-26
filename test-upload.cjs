const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key] = val.trim();
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.storage.from('songs').upload('test.txt', 'hello world', { upsert: true });
  console.log("Upload result:", data, error);
}
main();
