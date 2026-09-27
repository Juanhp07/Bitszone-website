const fs = require('fs');
let file = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Replace the div wrapping the logo with an anchor tag
file = file.replace(
  '<div className="d-flex align-items-center justify-content-center" style={{ pointerEvents: "auto", cursor: "pointer" }}>',
  '<a href="/" className="d-flex align-items-center justify-content-center text-decoration-none" style={{ pointerEvents: "auto", cursor: "pointer" }}>'
);
file = file.replace(
  '          />\n        </div>',
  '          />\n        </a>'
);

fs.writeFileSync('src/components/Header.tsx', file);
