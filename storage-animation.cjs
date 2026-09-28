const fs = require('fs');
let css = fs.readFileSync('src/styles/global.css', 'utf8');

if (!css.includes('animated-storage-bar')) {
  css += `\n
@keyframes storage-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes storage-pulse {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(168,85,247,0.5)); }
  50% { filter: brightness(1.2) drop-shadow(0 0 15px rgba(168,85,247,0.8)); }
}

.animated-storage-bar {
  background-size: 200% auto;
  animation: storage-flow 3s linear infinite, storage-pulse 2s ease-in-out infinite;
}
`;
  fs.writeFileSync('src/styles/global.css', css);
}

let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  /className=\`\{\\\$h-full rounded-full transition-all duration-700 relative \\\$\{[^}]+\}\}\`/g,
  `className={\`h-full rounded-full transition-all duration-700 relative animated-storage-bar \${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : "bg-gradient-to-r from-rose-500 via-red-500 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                }\`}`
);

// I need to write the regex correctly.
