const fs = require('fs');
let file = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');

// Add import for SpecularText
if (!file.includes('SpecularText')) {
  file = file.replace(
    "import { Menu, User } from 'lucide-react';",
    "import { Menu, User } from 'lucide-react';\nimport { SpecularText } from '../ui/SpecularText';"
  );
}

// Replace the span with SpecularText
const logoSpanRegex = /<span\s+className="font-bold text-xl tracking-widest cursor-pointer"[\s\S]*?BITSZONE\n\s*<\/span>/m;

const specularLogo = `
        <div 
          onClick={() => onViewChange('catalog')}
          className="cursor-pointer"
        >
          <SpecularText
            text="Bitszone"
            className="pe-2"
            style={{
              fontSize: "42px",
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E"
            baseStrokeColor="transparent"
            strokeWidth={1.5}
            glowSize={50}
          />
        </div>
`;

file = file.replace(logoSpanRegex, specularLogo);

fs.writeFileSync('src/components/player/TopNav.tsx', file.trim() + '\n');
