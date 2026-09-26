const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function run() {
  const { data } = await supabase.from('tracks').select('id, title, audio_url').like('album', 'Hollywood%');
  for (const t of data) {
    if (!t.audio_url.includes('%20Bleeding/')) { // if it doesn't have the folder name
       console.log('Wrong url:', t.title, t.audio_url);
    }
  }
}
run();
