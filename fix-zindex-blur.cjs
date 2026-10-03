const fs = require('fs');

let code = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

// 1. Fix the stacking context of the Hero Section so it's above the Tracklist
// It currently is: <div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-10">
// We will change z-10 to z-30
const heroRegex = /<div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-10">/;
if (code.match(heroRegex)) {
  code = code.replace(heroRegex, '<div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-30">');
  console.log("Fixed Hero Section z-index");
} else {
  console.log("Could not find Hero Section div");
}

// 2. Fix the position of the dropdown. It was changed to left-0, but it needs to be right-0 to not cut off.
// Let's change `left-0` back to `right-0` and keep `mt-4`.
const dropdownRegex = /className="absolute top-full left-0 mt-4 w-56 bg-black\/40 border border-white\/10 rounded-xl overflow-hidden shadow-\[0_16px_48px_rgba\(0,0,0,0\.8\)\] z-50"/;
if (code.match(dropdownRegex)) {
  code = code.replace(
    dropdownRegex, 
    'className="absolute top-full right-0 mt-4 w-56 bg-[#18181b]/60 border border-white/10 rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50"'
  );
  console.log("Fixed dropdown position to right-0 and tweaked background");
} else {
  console.log("Could not find dropdown div");
}

fs.writeFileSync('src/components/player/AlbumView.tsx', code);
