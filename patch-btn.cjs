const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const oldButton = `<button 
          onClick={onClose}
          className="absolute top-10 left-12 xl:left-[5rem] z-50 h-10 md:h-12 px-5 md:px-6 flex items-center justify-center gap-2 md:gap-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5 group"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-0.5 transition-transform" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-0.5">Ocultar Reproductor</span>
        </button>`;

const newButton = `<button 
          onClick={onClose}
          className="absolute top-10 left-12 xl:left-[5rem] z-50 flex items-center gap-2 md:gap-3 text-white/30 hover:text-white/80 transition-all group py-2"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-1 transition-transform" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-0.5">Ocultar Reproductor</span>
        </button>`;

if (code.includes(oldButton)) {
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
  console.log('Successfully patched button');
} else {
  console.log('Could not find the button code to replace');
}
