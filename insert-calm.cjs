const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').trim();
  return acc;
}, {});
const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

const getMp3Metadata = (filePath) => {
  try {
    const jsonStr = execSync(`ffprobe -v quiet -print_format json -show_format "${filePath}"`).toString();
    const data = JSON.parse(jsonStr);
    return data.format;
  } catch (e) {
    console.error("Error with file", filePath, e.message);
    return null;
  }
};

const BASE_URL = "https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs";

async function processFolder(folderPath, folderNameInBucket, imageUrl, defaultArtist, defaultAlbum) {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));
  
  const tracks = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(folderPath, file);
    const format = getMp3Metadata(fullPath);
    if (!format) continue;
    
    const tags = format.tags || {};
    const title = tags.title || file.replace('.mp3', '');
    const artist = tags.artist || defaultArtist;
    const album = tags.album || defaultAlbum;
    const durationStr = format.duration;
    const duration = durationStr ? Math.floor(parseFloat(durationStr) * 1000) : 180000;
    
    const audio_url = `${BASE_URL}/${encodeURIComponent(folderNameInBucket)}/${encodeURIComponent(file)}`;
    
    tracks.push({
      title,
      artist,
      album,
      image_url: imageUrl,
      audio_url,
      track_number: i + 1,
      duration
    });
  }
  
  if (tracks.length > 0) {
    console.log(`Inserting ${tracks.length} tracks for album ${defaultAlbum}...`);
    const { data, error } = await supabase.from('tracks').insert(tracks);
    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.log("Success");
    }
  }
}

async function main() {
  await processFolder(
    '/home/jeffryjara/Música/Downloads/CALM',
    'CALM',
    'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/04/31/61/0431617b-8479-58fe-3cc3-9fbfef175a71/20UMGIM06593.rgb.jpg/500x500bb.jpg',
    '5 Seconds of Summer',
    'CALM'
  );
}

main();
