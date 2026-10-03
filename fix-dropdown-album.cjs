const fs = require('fs');
let code = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

const targetStr = `className="absolute top-full right-0 mt-2 w-56 bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50"`;

const newStr = `className="absolute top-full left-0 mt-4 w-56 bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/player/AlbumView.tsx', code);
  console.log('Successfully fixed position and blur of Album dropdown');
} else {
  console.log('Could not find target string in AlbumView.tsx');
}
