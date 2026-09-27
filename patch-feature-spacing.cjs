const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

// Change text color and remove drop shadow
file = file.replace('text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-normal leading-tight', 'text-white/30 text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-normal leading-tight');
file = file.replace('text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-normal leading-tight mt-2', 'text-white/30 text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-normal leading-tight mt-2');
file = file.replace('drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]', '');

// Reduce margin-top to bring carousel closer to title
file = file.replace('mt-20 md:mt-32 mb-20', 'mt-4 md:mt-8 mb-20');

fs.writeFileSync('src/components/FeatureSection.tsx', file);
