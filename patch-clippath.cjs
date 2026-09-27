const fs = require('fs');

let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldGlassLayer = `{/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a CSS mask */}
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

const newGlassLayer = `{/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a vector clip-path */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* The single glass pane with a vector clip-path to perfectly cut out the L-shape and rounded corner without ANY masking artifacts */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-300"
          style={{
            clipPath: \`path('M 0 0 L 4000 0 L 4000 80 L \${sidebarW + 24} 80 A 24 24 0 0 0 \${sidebarW} 104 L \${sidebarW} 4000 L 0 4000 Z')\`,
            WebkitClipPath: \`path('M 0 0 L 4000 0 L 4000 80 L \${sidebarW + 24} 80 A 24 24 0 0 0 \${sidebarW} 104 L \${sidebarW} 4000 L 0 4000 Z')\`
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
             {/* Use sweep-flag 1 (clockwise) to curve INWARD (concave glass) so it perfectly hugs the Main Content */}
             <path d="M 0.5 24 A 23.5 23.5 0 0 1 24 0.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
        </div>
      </div>`;

file = file.replace(oldGlassLayer, newGlassLayer);

fs.writeFileSync('src/components/player/MainApp.tsx', file);

