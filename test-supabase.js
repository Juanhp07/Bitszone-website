import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://oxloqoggjldbjjratwoh.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
  const { data, error } = await supabase.storage.from('songs').list('Thriller');
  if (error) {
    console.error('Error fetching bucket:', error);
  } else {
    console.log('Files in Thriller folder:', data);
  }
}

checkBucket();
