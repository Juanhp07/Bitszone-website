const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // 1. Fix Ismael Rivera URLs (Remove accent from "Fué" which is %C3%A9 in the URL)
  console.log("Fetching Ismael Rivera tracks...");
  const { data: ismaelTracks, error: ismaelErr } = await supabase
    .from('tracks')
    .select('*')
    .ilike('artist', '%Ismael%');
    
  if (ismaelErr) {
    console.error(ismaelErr);
    return;
  }
  
  for (const track of ismaelTracks) {
    if (track.audio_url.includes('Esto%20Fu%C3%A9%20Lo%20Que%20Trajo%20El%20Barco')) {
      const fixedUrl = track.audio_url.replace('Esto%20Fu%C3%A9%20Lo%20Que%20Trajo%20El%20Barco', 'Esto%20Fue%20Lo%20Que%20Trajo%20El%20Barco');
      const { error } = await supabase.from('tracks').update({ audio_url: fixedUrl }).eq('id', track.id);
      if (error) console.error("Error updating", track.id, error);
      else console.log(`Fixed track ${track.id}: ${track.title}`);
    }
  }
}

main();
