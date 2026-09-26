const baseUrl = 'https://oxloqoggjldbjjratwoh.supabase.co/storage/v1/object/public/songs';
const paths = [
  'CALM/Best%20Years.mp3',
  'Calm/Best%20Years.mp3',
  'calm/Best%20Years.mp3',
  'CALM/01%20Best%20Years.mp3',
  'CALM/01%20-%20Best%20Years.mp3',
  '5%20Seconds%20of%20Summer/CALM/Best%20Years.mp3',
  '5%20Seconds%20Of%20Summer/CALM/Best%20Years.mp3',
  '5%20Seconds%20of%20Summer%20-%20CALM/Best%20Years.mp3',
  'CALM/Best_Years.mp3',
  'CALM/best%20years.mp3'
];

async function main() {
  for (const p of paths) {
    const url = `${baseUrl}/${p}`;
    const res = await fetch(url, { method: 'HEAD' });
    console.log(res.status, url);
  }
}
main();
