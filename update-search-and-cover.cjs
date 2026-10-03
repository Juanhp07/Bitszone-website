const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Update the Search Placeholder
const oldPlaceholderStr = "placeholder={type === 'downloads' ? 'Buscar en descargas' : type === 'licenses' ? 'Buscar en licencias' : type === 'playlists' ? 'Buscar en listas' : 'Buscar en favoritos'}";
const newPlaceholderStr = "placeholder={type === 'downloads' ? 'Buscar en descargas' : 'Buscar en biblioteca'}";

if (code.includes(oldPlaceholderStr)) {
  code = code.replace(oldPlaceholderStr, newPlaceholderStr);
} else {
  // Try regex if exact string mismatch
  const regex = /placeholder=\{type === 'downloads'.*?\}/;
  code = code.replace(regex, newPlaceholderStr);
}

// 2. Add Animations
const heroStartStr = '{/* Hero Section */}';
const animationsStyle = `<style>{\`
        @keyframes coverFloat {
          0%, 100% { transform: translateY(0px) scale(1); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
          50% { transform: translateY(-12px) scale(1.02); box-shadow: 0 35px 60px -15px rgba(0,0,0,0.8); }
        }
        .animate-cover-float {
          animation: coverFloat 6s ease-in-out infinite;
        }
        @keyframes iconBreathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 25px rgba(255,255,255,0.6)); }
        }
        .animate-icon-breathe {
          animation: iconBreathe 4s ease-in-out infinite;
        }
      \`}</style>
      {/* Hero Section */}`;

code = code.replace(heroStartStr, animationsStyle);

// 3. Apply animation classes to cover
const oldCoverClassRegex = /className={`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center \${gradientClass \|\| \(type === 'downloads' \? 'from-\[#a855f7\] to-\[#3b82f6\]' : 'from-pink-500 to-purple-600'\)}`}/;

const oldCoverMatch = code.match(oldCoverClassRegex);
if (oldCoverMatch) {
  const newCoverClass = oldCoverMatch[0].replace(
    'w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center',
    'w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br flex items-center justify-center animate-cover-float'
  );
  code = code.replace(oldCoverClassRegex, newCoverClass);
}

// 4. Apply animation to Icon
const oldIconMatch = '<Icon className="w-16 h-16 text-white" />';
const newIconMatch = '<Icon className="w-16 h-16 text-white animate-icon-breathe" />';
code = code.replace(oldIconMatch, newIconMatch);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated search placeholder and added float/breathe animations to the hero cover.");
