import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTracks() {
  const { data, error } = await supabase.from('tracks').select('*');
  if (error) {
    console.error('Error fetching tracks:', error);
  } else {
    console.log('Tracks in DB:', data);
  }
}

checkTracks();
