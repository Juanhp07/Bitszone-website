const fs = require('fs');

// 1. Update global.css to shorten pauses in the ping-pong animation and speed it up slightly
let globalCss = fs.readFileSync('src/styles/global.css', 'utf8');

const oldMarquee = `@keyframes marquee-pingpong {
  0%, 10% { transform: translateX(0px); }
  45%, 55% { transform: translateX(var(--overflow-amount, -50px)); }
  90%, 100% { transform: translateX(0px); }
}
.animate-marquee-pingpong {
  animation: marquee-pingpong 20s ease-in-out infinite;
  width: max-content;
}`;

const newMarquee = `@keyframes marquee-pingpong {
  0%, 5% { transform: translateX(0px); }
  48%, 52% { transform: translateX(var(--overflow-amount, -50px)); }
  95%, 100% { transform: translateX(0px); }
}
.animate-marquee-pingpong {
  animation: marquee-pingpong 14s ease-in-out infinite;
  width: max-content;
}`;

if (globalCss.includes('@keyframes marquee-pingpong')) {
  globalCss = globalCss.replace(oldMarquee, newMarquee);
  fs.writeFileSync('src/styles/global.css', globalCss);
  console.log('global.css updated with faster ping-pong.');
} else {
  console.log('Could not find marquee-pingpong in global.css');
}

// 2. Update ImmersivePlayer.tsx to add overflow-x-hidden to the tracklist container
let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const scrollContainer = `w-full h-full overflow-y-auto flex flex-col justify-start`;
const fixedScrollContainer = `w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start`;

if (player.includes(scrollContainer)) {
  player = player.replace(scrollContainer, fixedScrollContainer);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('ImmersivePlayer.tsx updated with overflow-x-hidden.');
} else {
  console.log('Could not find scrollContainer in ImmersivePlayer.tsx');
}

