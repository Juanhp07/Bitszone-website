const fs = require('fs');
let code = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

const target = `              )}
            </AnimatePresence>
          </div>
        </button>
      </div>`;

const newButton = `              )}
            </AnimatePresence>
          </div>
        </button>

        <div className="mt-6 border-t border-white/5 pt-6">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sad-mode'))}
            className={\`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 border \${isSadMode ? 'bg-blue-900/20 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-[#18181b]/50 text-white/50 hover:text-[#9ca3af] hover:bg-white/5'} group\`}
          >
            <CloudRain className={\`w-5 h-5 transition-transform duration-500 \${isSadMode ? 'text-blue-400' : 'group-hover:-translate-y-1 group-hover:text-blue-400 opacity-70'}\`} />
            <span className={\`font-medium tracking-wide text-sm transition-opacity \${isSadMode ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}\`}>Para Fabrizzio y Johan</span>
          </button>
        </div>
      </div>`;

code = code.replace(target, newButton);

fs.writeFileSync('src/components/player/Sidebar.tsx', code);
console.log('Sidebar button successfully inserted!');
