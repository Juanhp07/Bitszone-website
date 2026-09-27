const fs = require('fs');

let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Inject sidebarW
file = file.replace(
  /setIsPlaying\(!isPlaying\);\n  };\n\n  return \(/,
  `setIsPlaying(!isPlaying);
  };

  const sidebarW = isSidebarOpen ? 256 : 0;

  return (`
);

const oldGlassLayer = `{/* GLOBAL GLASS LAYER for TopNav and Sidebar */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* Sidebar Glass Area */}
        <div className={\`absolute top-0 left-0 h-full bg-black/30 backdrop-blur-xl transition-all duration-300 \${isSidebarOpen ? 'w-64' : 'w-0'}\`}>
          {/* Vertical right border starting AFTER the corner */}
          <div className={\`absolute right-0 top-[104px] bottom-0 w-[1px] bg-white/10 transition-opacity duration-300 \${isSidebarOpen ? 'opacity-100' : 'opacity-0'}\`}></div>
        </div>

        {/* Header Glass Area */}
        <div className={\`absolute top-0 right-0 h-20 bg-black/30 backdrop-blur-xl transition-all duration-300 \${isSidebarOpen ? 'left-64' : 'left-0'}\`}>
          {/* Horizontal bottom border starting AFTER the corner */}
          <div className="absolute bottom-0 right-0 h-[1px] bg-white/10 transition-all duration-300" style={{ left: isSidebarOpen ? '24px' : '0px' }}></div>
        </div>

        {/* The Curved Intersection */}
        <div className={\`absolute top-20 transition-all duration-300 \${isSidebarOpen ? 'left-64 opacity-100' : 'left-0 opacity-0'}\`} style={{ width: 24, height: 24 }}>
          {/* Glass fill for the inverted corner */}
          <div className="absolute inset-0 bg-black/30" style={{ 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)', 
            maskImage: 'radial-gradient(circle at 100% 100%, transparent 23px, black 23.5px)', 
            WebkitMaskImage: 'radial-gradient(circle at 100% 100%, transparent 23px, black 23.5px)' 
          }}></div>
          {/* White curve */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute inset-0">
             <path d="M 0 24 A 24 24 0 0 0 24 0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
        </div>
      </div>`;

const newGlassLayer = `{/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a CSS mask */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* The single glass pane */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-300"
          style={{
            maskImage: \`linear-gradient(to bottom, black 80px, transparent 80px), linear-gradient(to right, black \${sidebarW}px, transparent \${sidebarW}px), radial-gradient(circle at 100% 100%, transparent 23.5px, black 24px)\`,
            WebkitMaskImage: \`linear-gradient(to bottom, black 80px, transparent 80px), linear-gradient(to right, black \${sidebarW}px, transparent \${sidebarW}px), radial-gradient(circle at 100% 100%, transparent 23.5px, black 24px)\`,
            maskPosition: \`0 0, 0 0, \${sidebarW}px 80px\`,
            WebkitMaskPosition: \`0 0, 0 0, \${sidebarW}px 80px\`,
            maskSize: \`100% 100%, 100% 100%, 24px 24px\`,
            WebkitMaskSize: \`100% 100%, 100% 100%, 24px 24px\`,
            maskRepeat: 'no-repeat, no-repeat, no-repeat',
            WebkitMaskRepeat: 'no-repeat, no-repeat, no-repeat',
          }}
        ></div>

        {/* The precise borders (drawn completely separate from the glass to guarantee sub-pixel alignment) */}
        
        {/* Vertical Line */}
        <div 
          className="absolute top-[104px] bottom-0 w-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: \`\${sidebarW}px\`, opacity: isSidebarOpen ? 1 : 0 }}
        ></div>
        
        {/* Horizontal Line */}
        <div 
          className="absolute top-[80px] right-0 h-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: \`\${sidebarW + 24}px\` }}
        ></div>
        
        {/* Curved Corner SVG */}
        <div 
          className="absolute top-[80px] transition-all duration-300" 
          style={{ left: \`\${sidebarW}px\`, width: 24, height: 24, opacity: isSidebarOpen ? 1 : 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
             {/* 0.5 to 23.5 to align the 1px centered stroke EXACTLY with the 1px wide vertical/horizontal borders */}
             <path d="M 0.5 24 A 23.5 23.5 0 0 0 24 0.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
        </div>
      </div>`;

file = file.replace(oldGlassLayer, newGlassLayer);

fs.writeFileSync('src/components/player/MainApp.tsx', file);

