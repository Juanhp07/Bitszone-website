const fs = require('fs');

let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

if (!sidebar.includes('framer-motion')) {
  sidebar = sidebar.replace(
    'import React from "react";',
    'import React from "react";\nimport { motion, AnimatePresence } from "framer-motion";'
  );
}

const targetButton = `<button
          onClick={() => onViewChange("downloads")}
          className={\`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors relative \${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }\`}
        >
          <div className="relative">
            <DownloadCloud className="w-5 h-5" />
            {newDownloadsCount > 0 && currentView !== "downloads" && (
              <span
                key={newDownloadsCount}
                className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-[#a855f7] border border-white/20 text-white text-[10px] font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-in zoom-in duration-300"
              >
                {newDownloadsCount}
              </span>
            )}
          </div>
          Mis descargas
        </button>`;

const replacementButton = `<button
          onClick={() => onViewChange("downloads")}
          className={\`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors relative w-full \${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }\`}
        >
          <DownloadCloud className="w-5 h-5 shrink-0" />
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">Mis descargas</span>
            <AnimatePresence>
              {newDownloadsCount > 0 && currentView !== "downloads" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="overflow-hidden relative flex items-center justify-center bg-black/40 border border-white/5 rounded-md px-1.5 h-5 min-w-[24px] ml-2"
                >
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={newDownloadsCount}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      className="text-[#e879f9] text-[11px] font-bold tracking-wider absolute"
                      style={{ textShadow: '0 0 10px rgba(232, 121, 249, 0.8)' }}
                    >
                      {newDownloadsCount}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>`;

sidebar = sidebar.replace(targetButton, replacementButton);
fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
console.log('Sidebar rewritten');
