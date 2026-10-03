const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Replace the style block
const styleStart = '<style>{`';
const styleEnd = '`}</style>';

const oldStyleRegex = /<style>\{`[\s\S]*?`\}<\/style>/m;

const newStyle = `<style>{\`
        @keyframes iconFillAnimation {
          0%, 100% { fill: transparent; stroke-width: 2px; }
          50% { fill: rgba(255, 255, 255, 0.6); stroke-width: 2.5px; }
        }
        .animate-icon-fill {
          animation: iconFillAnimation 3s ease-in-out infinite;
        }
      \`}</style>`;

code = code.replace(oldStyleRegex, newStyle);

// 2. Remove animate-cover-float
code = code.replace(' animate-cover-float', '');

// 3. Replace animate-icon-breathe with animate-icon-fill
code = code.replace('animate-icon-breathe', 'animate-icon-fill');

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log('Cover float removed, icon fill animation added.');
