const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

function sanitize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  try {
    const { data: tracks, error } = await supabase.from('tracks').select('*');
    if (error) throw error;
    
    console.log(`Found ${tracks.length} total tracks in DB.`);
    
    const baseDir = '/home/jeffryjara/Música/Downloads/';
    const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
    
    let updatedCount = 0;
    
    for (const folder of folders) {
        const files = fs.readdirSync(path.join(baseDir, folder)).filter(f => f.endsWith('.mp3'));
        
        for (const file of files) {
            const trackName = file.replace('.mp3', '');
            
            // Find the best match in DB
            let bestMatch = null;
            
            // First try exact album folder match if possible
            let possibleTracks = tracks;
            if (folder === 'Esto Fué Lo Que Trajo El Barco') {
                possibleTracks = tracks.filter(t => t.album === 'Esto Fue Lo Que Trajo El Barco');
            } else if (folder === '25th Anniversary') {
                possibleTracks = tracks.filter(t => t.album === '25th Anniversary');
            } else if (folder === 'Meteora') {
                possibleTracks = tracks.filter(t => t.album === 'Meteora');
            } else if (folder === "Hollywood's Bleeding") {
                possibleTracks = tracks.filter(t => t.album === "Hollywood's Bleeding");
            }

            // Find matching track
            bestMatch = possibleTracks.find(t => sanitize(t.title) === sanitize(trackName));
            if (!bestMatch) {
                // Try fuzzy (contains)
                bestMatch = possibleTracks.find(t => sanitize(t.title).includes(sanitize(trackName)) || sanitize(trackName).includes(sanitize(t.title)));
            }
            if (!bestMatch) {
                // Try first word
                const fw = sanitize(trackName.split(' ')[0]);
                if (fw.length > 2) {
                    bestMatch = possibleTracks.find(t => sanitize(t.title).startsWith(fw));
                }
            }

            if (bestMatch) {
                const newUrl = `https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
                if (bestMatch.audio_url !== newUrl) {
                    // Update in DB
                    await supabase.from('tracks').update({ audio_url: newUrl }).eq('id', bestMatch.id);
                    updatedCount++;
                }
            } else {
                console.log(`Could not find DB match for local file: ${folder}/${file}`);
            }
        }
    }
    
    console.log(`Updated URLs for ${updatedCount} tracks.`);
  } catch(e) {
    console.error(e);
  }
}

run();
