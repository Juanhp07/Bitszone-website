async function run() {
  const res = await fetch("https://itunes.apple.com/lookup?id=269572838&entity=song");
  const data = await res.json();
  const tracks = data.results.slice(1);
  console.log(tracks.map(t => ({
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName,
    track_number: t.trackNumber,
    duration: t.trackTimeMillis,
    image_url: t.artworkUrl100.replace('100x100bb', '500x500bb')
  })));
}
run();
