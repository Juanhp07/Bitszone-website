const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Patch the hero button
const oldHeroButton = `className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest font-bold text-[11px] shadow-lg shadow-red-500/5 hover:shadow-red-500/20 hover:border-red-500/0 hover:-translate-y-0.5 active:translate-y-0"`;
const newHeroButton = `className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all uppercase tracking-widest font-bold text-[10px]"`;
content = content.replace(oldHeroButton, newHeroButton);

// 2. Patch the Modal container
const oldModalContainer = `className="bg-[#18181b] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in duration-200"`;
const newModalContainer = `className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200"`;
content = content.replace(oldModalContainer, newModalContainer);

// 3. Patch the input field inside the Modal
const oldInput = `<input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 mb-6 font-mono text-center tracking-widest uppercase"
            />`;
const newInput = `<input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              autoFocus
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/20 mb-6 transition-colors"
            />`;
content = content.replace(oldInput, newInput);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('UI updates applied successfully.');
