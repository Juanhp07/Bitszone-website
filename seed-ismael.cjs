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
    console.log('Fetching Ismael Rivera...');
    const ismaelData = await fetchJson('https://itunes.apple.com/search?term=Esto+Fue+Lo+Que+Trajo+El+Barco+Ismael+Rivera&entity=song&limit=50');
    
    console.log('Fetching Post Malone...');
    const postData = await fetchJson('https://itunes.apple.com/search?term=Hollywood%27s+Bleeding+Post+Malone&entity=song&limit=50');

    // Ismael Rivera tracks
    const ismaelTracks = ismaelData.results
        .filter(t => t.collectionName && t.collectionName.includes("Esto Fue Lo Que Trajo"))
        .sort((a,b) => a.trackNumber - b.trackNumber);
        
    // Post Malone tracks
    const postTracks = postData.results
        .filter(t => t.collectionName && t.collectionName.includes("Hollywood's Bleeding"))
        .sort((a,b) => a.trackNumber - b.trackNumber);

    console.log(`Found ${ismaelTracks.length} Ismael Rivera tracks.`);
    console.log(`Found ${postTracks.length} Post Malone tracks.`);

    const records = [];

    // Map Ismael Rivera
    for (const t of ismaelTracks) {
        let filename = t.trackName + '.mp3';
        let url = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Esto%20Fue%20Lo%20Que%20Trajo%20El%20Barco/${encodeURIComponent(filename)}`;
        
        records.push({
            title: t.trackName,
            artist: "Ismael Rivera",
            album: "Esto Fue Lo Que Trajo El Barco",
            track_number: t.trackNumber,
            duration: t.trackTimeMillis,
            image_url: t.artworkUrl100.replace('100x100bb', '500x500bb'),
            audio_url: url
        });
    }

    // Map Post Malone
    for (const t of postTracks) {
        let filename = t.trackName + '.mp3';
        if (t.trackName.includes('Sunflower')) filename = 'Sunflower (Spider-Man : Into the Spider-Verse).mp3';
        if (t.trackName === 'Wow.') filename = 'Wow..mp3';
        let url = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Hollywood's%20Bleeding/${encodeURIComponent(filename)}`;
        
        records.push({
            title: t.trackName,
            artist: t.artistName,
            album: "Hollywood's Bleeding",
            track_number: t.trackNumber,
            duration: t.trackTimeMillis,
            image_url: t.artworkUrl100.replace('100x100bb', '500x500bb'),
            audio_url: url
        });
    }

    const uniqueRecords = [];
    const seen = new Set();
    for (const r of records) {
        const key = r.album + r.track_number;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueRecords.push(r);
        }
    }

    // Delete existing Post Malone tracks to replace them
    await supabase.from('tracks').delete().eq('album', "Hollywood's Bleeding");

    console.log(`Inserting ${uniqueRecords.length} records...`);
    const { data, error } = await supabase.from('tracks').insert(uniqueRecords);
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
