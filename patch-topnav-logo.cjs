const fs = require('fs');
let topnav = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');

const oldLogo = `<div 
          onClick={() => onViewChange('catalog')}
          className="cursor-pointer"
        >`;

const newLogo = `<button 
          onClick={() => window.location.reload()}
          className="cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300 border-none bg-transparent"
          aria-label="Recargar página"
        >`;

const oldLogoEnd = `</SpecularText>\n        </div>`;
const newLogoEnd = `</SpecularText>\n        </button>`;

if (topnav.includes(oldLogo)) {
  topnav = topnav.replace(oldLogo, newLogo).replace('</SpecularText>\n        </div>', '</SpecularText>\n        </button>');
  fs.writeFileSync('src/components/player/TopNav.tsx', topnav);
  console.log('TopNav updated successfully.');
} else {
  console.log('Could not find exact logo string.');
}
