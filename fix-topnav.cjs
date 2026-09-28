const fs = require('fs');
let topnav = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');

topnav = topnav.replace('/>\n        </div>\n\n      </div>', '/>\n        </button>\n\n      </div>');
fs.writeFileSync('src/components/player/TopNav.tsx', topnav);
