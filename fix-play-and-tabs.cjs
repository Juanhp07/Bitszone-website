const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add activeTab state
if (!player.includes("const [activeTab, setActiveTab]")) {
  player = player.replace(
    'if (!track || !album) return null;',
    'if (!track || !album) return null;\n  const [activeTab, setActiveTab] = React.useState<"portada" | "letra">("portada");'
  );
}

// 2. Fix togglePlay
player = player.replace(
  'onTogglePlay();',
  'togglePlay();'
);

// 3. Improve Text Legibility
player = player.replace(
  '<div className="relative z-30 flex flex-col items-center justify-center w-full px-8">',
  '<div className="relative z-30 flex flex-col items-center justify-center w-full px-8">\n              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,5,10,0.8)_0%,transparent_60%)] pointer-events-none -z-10" />'
);

player = player.replace(
  'text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white mb-4 drop-shadow-lg text-center leading-tight',
  'text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white mb-4 drop-shadow-lg text-center leading-tight [text-shadow:_0_4px_30px_rgba(0,0,0,1)]'
);

player = player.replace(
  'text-white/50 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center drop-shadow-md mb-16',
  'text-white/80 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center drop-shadow-md mb-16 [text-shadow:_0_2px_10px_rgba(0,0,0,1)]'
);

// 4. Redesign Tabs
const oldTabsRegex = /\{\/\*\s*Top Tabs \(PORTADA \/ LETRA\)\s*\*\/\}[\s\S]*?<\/div>/;
const newTabs = `{/* Top Tabs (PORTADA / LETRA) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 p-1.5 flex items-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              {/* Sliding Background */}
              <div 
                className={\`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm \${activeTab === 'letra' ? 'translate-x-full left-[calc(50%)]' : 'translate-x-0 left-1.5'}\`}
              />
              <button 
                onClick={() => setActiveTab('portada')}
                className={\`relative z-10 px-8 py-3 text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-colors \${activeTab === 'portada' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/50 hover:text-white/80'}\`}
              >
                Portada
              </button>
              <button 
                onClick={() => setActiveTab('letra')}
                className={\`relative z-10 px-8 py-3 text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-colors \${activeTab === 'letra' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/50 hover:text-white/80'}\`}
              >
                Letra
              </button>
           </div>`;

player = player.replace(oldTabsRegex, newTabs);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Fixed play button, improved legibility, and redesigned tabs.');

