const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

const target = `className={\`h-full rounded-full transition-all duration-700 relative \${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                }\`}`;

const replacement = `className={\`h-full rounded-full transition-all duration-700 relative animated-storage-bar \${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : "bg-gradient-to-r from-rose-500 via-red-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                }\`}`;

sidebar = sidebar.replace(target, replacement);

fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
console.log('Sidebar updated');
