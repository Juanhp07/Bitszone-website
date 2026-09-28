const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const oldButtonRegex = /<button[\s\S]*?onClick=\{onClose\}[\s\S]*?className="absolute top-10 left-10 xl:left-\[4\.5rem\] z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white\/5 hover:bg-white\/10 text-white\/50 hover:text-white transition-all backdrop-blur-md border border-white\/5 group"[\s\S]*?>[\s\S]*?<ChevronDown className="w-7 h-7 group-hover:translate-y-0\.5 transition-transform" \/>[\s\S]*?<\/button>/;

const newButton = `<button 
          onClick={onClose}
          className="absolute top-10 left-12 xl:left-[5rem] z-50 h-10 md:h-12 px-5 md:px-6 flex items-center justify-center gap-2 md:gap-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5 group"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-0.5 transition-transform" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-0.5">Ocultar Reproductor</span>
        </button>`;

if (player.match(oldButtonRegex)) {
  player = player.replace(oldButtonRegex, newButton);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Close button updated to include text.');
} else {
  console.log('Could not find old button to replace.');
}

