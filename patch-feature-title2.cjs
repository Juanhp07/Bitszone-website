const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

// Change text color from 30% to 70%
file = file.replace(/text-white\/30/g, 'text-white/70');

// Remove period from ENCUENTRA SU RITMO.
file = file.replace('ENCUENTRA SU RITMO.', 'ENCUENTRA SU RITMO');

fs.writeFileSync('src/components/FeatureSection.tsx', file);
