const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function run() {
    const newUrl = "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Thriller/The%20Girl%20Is%20Mine%20(with%20Paul%20McCartney).mp3";
    await supabase.from('tracks').update({ audio_url: newUrl }).eq('title', 'The Girl Is Mine (with Paul McCartney)');
    console.log('Fixed Thriller');
}
run();
