const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Import ChevronDown
player = player.replace('VolumeX, X }', 'VolumeX, ChevronDown }');

// 2. Add the Close/Back button at the top left of the modal container
const modalContainerRegex = /<div \s*onClick=\{\(e\) => e\.stopPropagation\(\)\}\s*className=\{`fixed z-\[100\] inset-0 [^>]+>\s*/;
const backButton = `<button 
          onClick={onClose}
          className="absolute top-10 left-10 xl:left-[4.5rem] z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5 group"
        >
          <ChevronDown className="w-7 h-7 group-hover:translate-y-0.5 transition-transform" />
        </button>

        `;
player = player.replace(modalContainerRegex, (match) => match + backButton);

// 3. Adjust left column padding, top/bottom fade heights, and PISTAS position
// Left Column definition:
player = player.replace(
  '<div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-24 pb-24">',
  '<div className="w-[35%] h-full relative overflow-hidden flex flex-col pt-36 pb-0">'
);

// Fades
player = player.replace(
  '<div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />',
  '<div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#05050A] via-[#05050A]/90 to-transparent z-20 pointer-events-none" />'
);
player = player.replace(
  '<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent z-20 pointer-events-none" />',
  '<div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent z-20 pointer-events-none" />'
);

// PISTAS text position
player = player.replace(
  '<div className="absolute top-12 left-12 xl:left-20 z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">PISTAS</div>',
  '<div className="absolute top-28 left-12 xl:left-[5rem] z-30 text-white/30 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">PISTAS</div>'
);

// Scrollable container padding
player = player.replace(
  `pl-12 xl:pl-20 gap-4 md:gap-5 transition-all duration-700 pb-32" style={{ scrollbarWidth: 'none' }}>`,
  `pl-12 xl:pl-[5rem] gap-4 md:gap-5 transition-all duration-700 pb-40 pt-4" style={{ scrollbarWidth: 'none' }}>`
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Fades deepened, back button added.');

