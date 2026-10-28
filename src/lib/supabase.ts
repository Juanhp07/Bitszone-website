import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY: sign-in will not work until they are set.');
}

// The placeholders only keep the build and the server render from crashing when the variables are missing.
export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'missing-anon-key');
