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
      console.log("Success:", data);
    }
  }
}

async function main() {
  await processFolder(
    '/home/jeffryjara/Música/Downloads/Ahora Mas Que Nunca',
    'Ahora Mas Que Nunca',
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/df/e8/3b/dfe83bb9-9d58-94df-73bb-eb1ec826317b/886445388062.jpg/500x500bb.jpg',
    "Adolescent's Orquesta",
    'Ahora Mas Que Nunca'
  );
  
  await processFolder(
    '/home/jeffryjara/Música/Downloads/Coverizando',
    'Coverizando',
    'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c7/28/68/c72868da-dbab-e95b-dddc-6379f64bfda9/653341334629.jpg/500x500bb.jpg',
    'Zaperoko',
    'Coverizando'
  );
}

main();
