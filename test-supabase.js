const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: albums } = await supabase.from('albums').select('*');
  console.log('Albums:', albums);
  
  const { data: tracks } = await supabase.from('tracks').select('*').limit(3);
  console.log('Sample Tracks:', tracks);
}

check();
