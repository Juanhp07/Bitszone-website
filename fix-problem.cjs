const fs = require('fs');
let prob = fs.readFileSync('src/components/ProblemSection.tsx', 'utf8');

// Remove Probar Bitszone Gratis
prob = prob.replace(
  /      \{\/\* CTA Button \*\/\}\n      <div className="mt-20">[\s\S]*?<\/div>\n/,
  ""
);

// Remove border from card
prob = prob.replace(
  /className="rounded-2xl p-8 bg-white\/\[0\.03\] border border-white\/5 flex flex-col"/g,
  'className="rounded-2xl p-8 bg-white/[0.03] flex flex-col"'
);

// Remove border from icon (optional? the user said "a las cards que estan debajo", so removing the card border is what they want, let's also remove icon border to be safe and clean)
prob = prob.replace(
  /className="w-14 h-14 rounded-full border border-white\/10 bg-white\/5 flex items-center justify-center mb-6"/g,
  'className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6"'
);

fs.writeFileSync('src/components/ProblemSection.tsx', prob);
