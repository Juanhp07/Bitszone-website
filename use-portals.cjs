const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

if (!content.includes('createPortal')) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

// 1. albumToRemove
content = content.replace(
  /\{albumToRemove && \(/,
  "{albumToRemove && createPortal("
);
content = content.replace(
  /Vaciar\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  "Vaciar\n              </button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);

// 2. trackToRemove
content = content.replace(
  /\{trackToRemove && \(/,
  "{trackToRemove && createPortal("
);
content = content.replace(
  /\{type === 'downloads' \? 'Eliminar' : 'Quitar'\}\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  "{type === 'downloads' ? 'Eliminar' : 'Quitar'}\n              </button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);

// 3. showClearConfirm
content = content.replace(
  /\{showClearConfirm && \(/,
  "{showClearConfirm && createPortal("
);
content = content.replace(
  /Eliminar todo\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  "Eliminar todo\n              </button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);

// Finally, elevate z-50 to z-[100]
content = content.replace(/z-50/g, "z-[100]");

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Portals added!');
