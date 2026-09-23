import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.storage.from('songs').list();
  console.log(data);
}
run();
