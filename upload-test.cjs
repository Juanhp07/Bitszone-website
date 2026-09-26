const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const fileData = fs.readFileSync('/home/jeffryjara/Música/Downloads/CALM/Easier.mp3');
  const { data, error } = await supabase.storage.from('songs').upload('CALM/Easier.mp3', fileData, { upsert: true });
  if (error) console.error("Upload error:", error);
  else console.log("Upload success:", data);
}
main();
