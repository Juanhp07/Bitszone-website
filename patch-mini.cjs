const fs = require('fs');

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

const styleBlock = `
  const waveSvg = "data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E";

  return (
    <div className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none">
      <style>{\`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -24px; }
        }
        .animate-wave-slide {
          animation: wave-slide 1s linear infinite;
        }
      \`}</style>
      {/* Decorative gradient overlay */}`;

code = code.replace(`  return (\n    <div className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none">\n      {/* Decorative gradient overlay */}`, styleBlock);

const pbTarget = `          <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group flex items-center cursor-pointer">
            <div className="absolute left-0 h-full bg-white rounded-full group-hover:bg-[#a855f7] transition-colors pointer-events-none" style={{ width: \`\${progress * 100}%\` }}></div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001" 
              value={progress}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
            />
          </div>`;

const pbReplace = `          <div className="flex-1 h-6 relative group flex items-center cursor-pointer">
            {/* Unplayed straight line */}
            <div className="absolute left-0 right-0 h-[2px] bg-white/20 rounded-full pointer-events-none" />
            
            {/* Played wavy line clipping container */}
            <div className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none" style={{ width: \`\${progress * 100}%\` }}>
               <div 
                 className={\`absolute left-0 top-0 bottom-0 w-[200vw] \${isPlaying ? 'animate-wave-slide' : ''}\`}
                 style={{
                   backgroundImage: \`url("\${waveSvg}")\`,
                   backgroundRepeat: 'repeat-x',
                   backgroundPosition: 'left center',
                   backgroundSize: '24px 12px'
                 }}
               />
            </div>
            
            {/* The Dot (Handle) */}
            <div 
               className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
               style={{ left: \`\${progress * 100}%\` }}
            />
            
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001" 
              value={progress}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
            />
          </div>`;

code = code.replace(pbTarget, pbReplace);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('Successfully patched MiniPlayer.tsx');

