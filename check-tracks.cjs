const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);
async function run() {
  const { data: tracks, error } = await supabase.from('tracks').select('album, title, track_number').order('album').order('track_number');
  if (error) console.error(error);
  
  const groups = {};
  for(const t of tracks) {
      if(!groups[t.album]) groups[t.album] = [];
      groups[t.album].push(`${t.track_number}: ${t.title}`);
  }
  for(const a in groups) {
      console.log(`Album: ${a} (${groups[a].length} tracks)`);
      console.log(groups[a]);
  }
}
run();
