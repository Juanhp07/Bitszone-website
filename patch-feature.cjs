const fs = require('fs');
let file = fs.readFileSync('src/components/FeatureSection.tsx', 'utf8');

file = file.replace('EL QUE BUSCA,', 'El que busca,');
file = file.replace('ENCUENTRA SU RITMO', 'encuentra su ritmo');

fs.writeFileSync('src/components/FeatureSection.tsx', file);
