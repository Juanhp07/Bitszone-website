const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function run() {
  const { data: tracks } = await supabase.from('tracks').select('album, title, audio_url').order('album');
  for(const t of tracks) {
      if(t.album === 'Esto Fue Lo Que Trajo El Barco') continue;
      try {
          // Replace single quotes for shell safety
          const safeUrl = t.audio_url.replace(/'/g, "'\\''");
          const out = execSync(`curl -sI '${safeUrl}' | head -n 1`).toString();
          if(!out.includes('200')) {
              console.log(`[FAIL] ${t.album} - ${t.title}`);
          }
      } catch(e) {
          console.log(`[ERR] ${t.title}`);
      }
  }
}
run();
