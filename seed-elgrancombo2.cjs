const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching El Gran Combo songs...');
    const data = await fetchJson('https://itunes.apple.com/search?term=El+Gran+Combo+de+Puerto+Rico&entity=song&limit=15');
    
    const records = [];
    let i = 1;
    for (const t of data.results) {
        let filename = t.trackName + '.mp3';
        let url = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/El%20Gran%20Combo%20de%20Puerto%20Rico/${encodeURIComponent(filename)}`;
        
        records.push({
            title: t.trackName,
            artist: "El Gran Combo de Puerto Rico",
            album: "El Gran Combo de Puerto Rico",
            track_number: i++,
            duration: t.trackTimeMillis,
            image_url: t.artworkUrl100.replace('100x100bb', '500x500bb'),
            audio_url: url
        });
    }

    console.log(`Inserting ${records.length} records...`);
    const { error } = await supabase.from('tracks').insert(records);
    if (error) {
        console.error('Error inserting:', error);
    } else {
        console.log('Inserted successfully!');
    }
  } catch(e) {
    console.error(e);
  }
}

run();
