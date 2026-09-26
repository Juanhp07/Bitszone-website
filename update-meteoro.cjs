const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function run() {
  const { data: tracks } = await supabase.from('tracks').select('id, audio_url').eq('album', 'Meteoro');
  for (const t of tracks) {
    if (t.audio_url.includes('/Meteora/')) {
        const newUrl = t.audio_url.replace('/Meteora/', '/Meteoro/');
        await supabase.from('tracks').update({ audio_url: newUrl }).eq('id', t.id);
        console.log(`Updated ${t.id} to Meteoro`);
    }
  }
}
run();
