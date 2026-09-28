const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Add import for createPortal
if (!content.includes("createPortal")) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

// Replace albumToRemove modal
content = content.replace(
  /\{albumToRemove && \(\n\s*<div className="fixed inset-0 z-50/g,
  "{albumToRemove && createPortal(\n        <div className=\"fixed inset-0 z-[100]"
);
content = content.replace(
  /Vaciar\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/g,
  "Vaciar\n              </button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);

// Replace trackToRemove modal
content = content.replace(
  /\{trackToRemove && \(\n\s*<div className="fixed inset-0 z-50/g,
  "{trackToRemove && createPortal(\n        <div className=\"fixed inset-0 z-[100]"
);
content = content.replace(
  /Eliminar\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/g,
  "Eliminar\n              </button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);
// Wait, the trackToRemove confirm button might have text depending on type... Let's use regex more carefully for the end of modals

