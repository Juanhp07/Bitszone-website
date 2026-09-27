const fs = require('fs');

let mainFile = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// Add cornerR definition
mainFile = mainFile.replace(
  'const sidebarW = isSidebarOpen ? 256 : 0;',
  `const sidebarW = isSidebarOpen ? 256 : 0;\n  const cornerR = isSidebarOpen ? 24 : 0.01;`
);

// Replace Glass Layer
const oldGlassLayer = `{/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a vector clip-path */}
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

const newGlassLayer = `{/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a vector clip-path */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* The single glass pane with a vector clip-path to perfectly cut out the L-shape and rounded corner without ANY masking artifacts */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-300"
          style={{
            clipPath: \`path('M 0 0 L 4000 0 L 4000 80 L \${sidebarW + cornerR} 80 A \${cornerR} \${cornerR} 0 0 0 \${sidebarW} \${80 + cornerR} L \${sidebarW} 4000 L 0 4000 Z')\`,
            WebkitClipPath: \`path('M 0 0 L 4000 0 L 4000 80 L \${sidebarW + cornerR} 80 A \${cornerR} \${cornerR} 0 0 0 \${sidebarW} \${80 + cornerR} L \${sidebarW} 4000 L 0 4000 Z')\`
          }}
        ></div>

        {/* The precise borders (drawn completely separate from the glass to guarantee sub-pixel alignment) */}
        
        {/* Vertical Line */}
        <div 
          className="absolute bottom-0 w-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: \`\${sidebarW}px\`, top: \`\${80 + cornerR}px\`, opacity: isSidebarOpen ? 1 : 0 }}
        ></div>
        
        {/* Horizontal Line */}
        <div 
          className="absolute top-[80px] right-0 h-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: \`\${sidebarW + cornerR}px\` }}
        ></div>
        
        {/* Curved Corner SVG */}
        <div 
          className="absolute top-[80px] transition-all duration-300" 
          style={{ left: \`\${sidebarW}px\`, width: \`\${cornerR}px\`, height: \`\${cornerR}px\`, opacity: isSidebarOpen ? 1 : 0 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="none">
             {/* Use sweep-flag 1 (clockwise) to curve INWARD (concave glass) so it perfectly hugs the Main Content */}
             <path d="M 0.5 24 A 23.5 23.5 0 0 1 24 0.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>`;

mainFile = mainFile.replace(oldGlassLayer, newGlassLayer);
fs.writeFileSync('src/components/player/MainApp.tsx', mainFile);

