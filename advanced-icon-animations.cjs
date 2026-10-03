const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Replace the style block
const styleStart = '<style>{`';
const styleEnd = '`}</style>';

const oldStyleRegex = /<style>\{`[\s\S]*?`\}<\/style>/m;

const newStyle = `<style>{\`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); fill: transparent; }
          15% { transform: scale(1.25); fill: white; }
          30% { transform: scale(1.05); fill: white; }
          45% { transform: scale(1.25); fill: white; }
          60%, 80% { transform: scale(1); fill: transparent; }
        }
        .custom-icon-favorites {
          animation: heartBeat 2.5s ease-in-out infinite;
        }

        @keyframes starSpin {
          0% { transform: rotate(0deg) scale(1); fill: transparent; }
          15%, 35% { transform: rotate(144deg) scale(1.2); fill: white; }
          50%, 70% { transform: rotate(288deg) scale(1.2); fill: white; }
          85%, 100% { transform: rotate(360deg) scale(1); fill: transparent; }
        }
        .custom-icon-licenses {
          animation: starSpin 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes drawPlaylist {
          0% { stroke-dashoffset: 100; fill: transparent; transform: scale(1); }
          25% { stroke-dashoffset: 0; fill: transparent; transform: scale(1.15); }
          35%, 65% { stroke-dashoffset: 0; fill: white; transform: scale(1.15); }
          75% { stroke-dashoffset: 0; fill: transparent; transform: scale(1.15); }
          100% { stroke-dashoffset: -100; fill: transparent; transform: scale(1); }
        }
        .custom-icon-playlists path,
        .custom-icon-playlists line,
        .custom-icon-playlists polyline,
        .custom-icon-playlists circle {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawPlaylist 4s ease-in-out infinite;
        }

        @keyframes cloudBounce {
          0%, 100% { transform: translateY(0) scale(1); fill: transparent; }
          30%, 70% { transform: translateY(-8px) scale(1.15); fill: white; }
        }
        .custom-icon-downloads {
          animation: cloudBounce 3.5s ease-in-out infinite;
        }
      \`}</style>`;

code = code.replace(oldStyleRegex, newStyle);

// 2. Replace animate-icon-fill with the dynamic custom-icon-\${type}
code = code.replace(
  '<Icon className="w-16 h-16 text-white animate-icon-fill" />',
  '<Icon className={`w-16 h-16 text-white custom-icon-${type}`} />'
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log('Advanced specific icon animations added.');
