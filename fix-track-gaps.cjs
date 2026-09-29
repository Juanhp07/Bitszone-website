const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Update Container Padding
player = player.replace(
  'className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[160px] pb-0"',
  'className="w-[35%] h-full relative overflow-hidden flex flex-col pt-[140px] pb-0"'
);

// Update Top fade mask height
player = player.replace(
  'className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b',
  'className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b'
);

// Remove gap from inner container
player = player.replace(
  'className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] gap-4 md:gap-5 transition-all duration-700 pb-20 pt-4"',
  'className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start pl-12 xl:pl-[5rem] transition-all duration-700 pb-20 pt-2"'
);

// Add py to track items
player = player.replace(
  'className={`group text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 ${',
  'className={`group py-2 md:py-2.5 text-2xl md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 ${'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Successfully adjusted gaps and padding.');

