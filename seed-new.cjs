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
    console.log('Fetching Post Malone...');
    const postData = await fetchJson('https://itunes.apple.com/search?term=Hollywood%27s+Bleeding+Post+Malone&entity=song&limit=50');
    
    console.log('Fetching Linkin Park...');
    const lpData = await fetchJson('https://itunes.apple.com/search?term=Meteora+Linkin+Park&entity=song&limit=50');

    // Filter and group by exact album
    const postTracks = postData.results
        .filter(t => t.collectionName && t.collectionName.includes("Hollywood's Bleeding"))
        .sort((a,b) => a.trackNumber - b.trackNumber);
        
    const lpTracks = lpData.results
        .filter(t => t.collectionName === "Meteora")
        .sort((a,b) => a.trackNumber - b.trackNumber);

    console.log(`Found ${postTracks.length} Post Malone tracks and ${lpTracks.length} Linkin Park tracks.`);

    const records = [];

    // Map Post Malone
    // We will use the file names from the screenshot.
    // The iTunes API might return slightly different names, but we will construct the URL based on the iTunes track name to be safe, or just use the exact names from screenshot.
    // Actually, I will use iTunes trackName, but replace characters if needed. 
    // The user has files exactly named as the screenshot. Let's try to match them.
    for (const t of postTracks) {
        // Let's use the trackName for the URL, but the user's files are named exactly like the screenshot.
        // E.g. "A Thousand Bad Times.mp3"
        // Let's just construct the filename directly from the trackName, stripping illegal chars if needed, but since the user has a screenshot of their local files, they are just "TrackName.mp3".
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

    // Map Linkin Park (Meteoro)
    for (const t of lpTracks) {
        let filename = t.trackName + '.mp3';
        let url = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/Meteoro/${encodeURIComponent(filename)}`;
        
        records.push({
            title: t.trackName,
            artist: t.artistName,
            album: "Meteoro",
            track_number: t.trackNumber,
            duration: t.trackTimeMillis,
            image_url: t.artworkUrl100.replace('100x100bb', '500x500bb'),
            audio_url: url
        });
    }

    console.log(`Inserting ${records.length} records...`);
    // Remove duplicates if any (iTunes might return same track multiple times)
    const uniqueRecords = [];
    const seen = new Set();
    for (const r of records) {
        const key = r.album + r.track_number;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueRecords.push(r);
        }
    }

    console.log(`Inserting ${uniqueRecords.length} unique records...`);
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
