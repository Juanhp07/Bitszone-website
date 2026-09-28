const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Add createPortal and useEffect to imports
if (!player.includes('createPortal')) {
  player = player.replace(
    "import React from 'react';",
    "import React, { useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

// Add useEffect for Escape key
const escapeHook = `
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded, onClose]);
`;

player = player.replace(
  '  if (!track || !album) return null;\n\n  return (',
  '  if (!track || !album) return null;\n' + escapeHook + '\n  return createPortal('
);

// Close the portal tag at the end
player = player.replace(
  '    </>\n  );\n};\n',
  '    </>,\n    document.body\n  );\n};\n'
);

// Update z-indexes and sizes
player = player.replace(
  /fixed inset-0 bg-\[#05050A\]\/80 backdrop-blur-md z-30/g,
  'fixed inset-0 bg-[#05050A]/80 backdrop-blur-md z-[100]'
);

player = player.replace(
  /fixed z-30 left-1\/2 -translate-x-1\/2 w-\[90%\] max-w-\[1200px\] top-24 bottom-\[120px\]/g,
  'fixed z-[100] left-1/2 -translate-x-1/2 w-[95vw] max-w-[1400px] top-10 bottom-[100px]'
);

// Also stop propagation on the modal container to prevent closing if they click the modal itself
player = player.replace(
  `{/* Modal Container */}
      <div 
        className={\`fixed`,
  `{/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={\`fixed`
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('ImmersivePlayer updated');
