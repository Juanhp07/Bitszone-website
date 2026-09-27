const fs = require('fs');

let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldGlobalBg = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>`;

const newGlobalBgWithGlass = `{/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

      {/* GLOBAL GLASS LAYER for TopNav and Sidebar */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
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

file = file.replace(oldGlobalBg, newGlobalBgWithGlass);

fs.writeFileSync('src/components/player/MainApp.tsx', file);

