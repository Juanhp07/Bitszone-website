const fs = require('fs');

function fixFile(filePath, modalStateSetterType) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix Imports
  if (!content.includes('createPortal')) {
    content = content.replace(
      /import React, \{ useState \} from 'react';/,
      "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
    );
  }

  // 2. Add useEffect for Escape key
  const setterVal = modalStateSetterType === 'null' ? 'null' : 'false';
  const useEffectCode = `\n  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloadConfirm(${setterVal});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDownloadConfirm]);\n`;

  // We find where to insert it: probably after `const [showDownloadConfirm, setShowDownloadConfirm] = ...`
  if (!content.includes('e.key === \'Escape\'')) {
    content = content.replace(
      /(const \[showDownloadConfirm, setShowDownloadConfirm\] = useState[^\n]+)\n/,
      `$1\n${useEffectCode}`
    );
  }

  // 3. Fix modal wrapper
  // Replace {showDownloadConfirm && (
  content = content.replace(
    /\{showDownloadConfirm && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm px-4">/g,
    `{showDownloadConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowDownloadConfirm(${setterVal})}>`
  );

  // 4. Stop propagation on inner container
  content = content.replace(
    /className="bg-\[#18181b\] border border-white\/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">/g,
    'className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>'
  );

  // 5. Wrap the end in document.body
  content = content.replace(
    /Descargar Todo<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/g,
    'Descargar Todo</button>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}'
  );

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('src/components/player/CatalogView.tsx', 'null');
fixFile('src/components/player/AlbumView.tsx', 'false');
fixFile('src/components/player/ArtistView.tsx', 'null');

