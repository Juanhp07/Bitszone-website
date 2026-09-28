const fs = require('fs');
let sidebar = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

const targetBadge = `<AnimatePresence>
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
            </AnimatePresence>`;

const newBadge = `<AnimatePresence>
              {newDownloadsCount > 0 && currentView !== "downloads" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex items-center justify-center h-6 min-w-[24px] ml-2"
                >
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={newDownloadsCount}
                      initial={{ y: 25, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -25, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10, mass: 1 }}
                      className="text-[#f0abfc] text-base font-extrabold tracking-wider absolute"
                      style={{ textShadow: '0 0 10px rgba(232, 121, 249, 1), 0 0 20px rgba(232, 121, 249, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)' }}
                    >
                      {newDownloadsCount}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>`;

sidebar = sidebar.replace(targetBadge, newBadge);
fs.writeFileSync('src/components/player/Sidebar.tsx', sidebar);
console.log('Badge updated');
