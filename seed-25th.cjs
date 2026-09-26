const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');
const path = require('path');

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
    console.log('Fetching iTunes tracks...');
    const data = await fetchJson('https://itunes.apple.com/lookup?id=334442610&entity=song');
    
    const itunesTracks = data.results.filter(r => r.wrapperType === 'track');
    
    const localFiles = fs.readdirSync('/home/jeffryjara/Música/Downloads/25th Anniversary/');
    console.log(`Found ${localFiles.length} local files.`);

    const records = [];
    
    // Deletions first
    await supabase.from('tracks').delete().eq('artist', 'El Gran Combo de Puerto Rico');

    for (const file of localFiles) {
        if (!file.endsWith('.mp3')) continue;
        
        let trackName = file.replace('.mp3', '');
        
        // Find best match in iTunes
        // We'll just do a simple lowercase check
        let match = itunesTracks.find(t => t.trackName.toLowerCase().includes(trackName.toLowerCase().replace('pa\'', 'pa').replace('na\'', 'na')));
        if (!match) {
           // try fuzzy matching or just fallback
           match = itunesTracks.find(t => trackName.toLowerCase().includes(t.trackName.toLowerCase().split(' ')[0]));
        }

        let duration = match ? match.trackTimeMillis : 240000;
        let img = match ? match.artworkUrl100.replace('100x100bb', '500x500bb') : 'https://is1-ssl.mzstatic.com/image/thumb/Features/ab/71/ff/dj.klgvouou.jpg/500x500bb.jpg';
        let trackNum = match ? match.trackNumber : records.length + 1;
        
        let url = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/25th%20Anniversary/${encodeURIComponent(file)}`;
        
        records.push({
            title: trackName,
            artist: "El Gran Combo de Puerto Rico",
            album: "25th Anniversary",
            track_number: trackNum,
            duration: duration,
            image_url: img,
            audio_url: url
        });
    }

    console.log(`Inserting ${records.length} records with correct URLs...`);
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
