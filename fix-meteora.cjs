const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function run() {
  const records = [
    {
        title: "Foreword",
        artist: "LINKIN PARK",
        album: "Meteoro",
        track_number: 1,
        duration: 13000,
        image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg",
        audio_url: "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Meteora/Foreword.mp3"
    },
    {
        title: "Session",
        artist: "LINKIN PARK",
        album: "Meteoro",
        track_number: 12,
        duration: 143000,
        image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg",
        audio_url: "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Meteora/Session.mp3"
    }
  ];
  const { error } = await supabase.from('tracks').insert(records);
  console.log(error ? error : "Inserted missing Meteora tracks!");
}
run();
