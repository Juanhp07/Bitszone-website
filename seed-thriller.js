import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Fetch iTunes data
  const res = await fetch("https://itunes.apple.com/lookup?id=269572838&entity=song");
  const data = await res.json();
  const tracks = data.results.slice(1);

  // 2. Clear old tracks
  await supabase.from('tracks').delete().neq('id', 0); // Delete all

  // 3. Insert new tracks
  const toInsert = tracks.map(t => {
    // Generate URL based on the title
    let filename = t.trackName;
    if (filename === 'The Girl Is Mine (with Paul McCartney)') filename = 'The Girl Is Mine'; // Sometimes users just name it this
    // We'll just use the exact trackName from iTunes, the user can rename their files to match this.
    const url = `${supabaseUrl}/storage/v1/object/public/songs/Thriller/${encodeURIComponent(t.trackName)}.mp3`;

    return {
      title: t.trackName,
      artist: t.artistName,
      album: t.collectionName,
      track_number: t.trackNumber,
      duration: t.trackTimeMillis,
      image_url: t.artworkUrl100.replace('100x100bb', '500x500bb'),
      audio_url: url
    };
  });

  const { error } = await supabase.from('tracks').insert(toInsert);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully inserted Thriller album into Supabase!');
  }
}
run();
