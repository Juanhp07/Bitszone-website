const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Replace the entire somewhereIBelongLyrics array with the accurate LRCLIB timings
const newLyricsArray = `const somewhereIBelongLyrics = [
  {time:43.71,text:"When it began"},{time:45.15,text:"I had nothing to say"},{time:46.82,text:"And I get lost in the nothingness inside of me"},{time:49.70,text:"(I was confused)"},{time:50.59,text:"And I let it all out to find"},{time:52.60,text:"That I'm not the only person with these things in mind"},{time:55.53,text:"(Inside of me)"},{time:56.45,text:"But all that they can see the words revealed"},{time:58.68,text:"Is the only real thing that I've got left to feel"},{time:61.45,text:"(Nothing to lose)"},{time:62.36,text:"Just stuck, hollow and alone"},{time:64.44,text:"And the fault is my own, and the fault is my own"},{time:67.53,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:73.34,text:"I wanna let go of the pain I've felt so long"},{time:77.30,text:"(Erase all the pain till it's gone)"},{time:79.29,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:85.20,text:"I wanna find something I've wanted all along"},{time:90.09,text:"Somewhere I belong"},{time:92.49,text:"And I've got nothing to say"},{time:94.07,text:"I can't believe I didn't fall right down on my face"},{time:97.06,text:"(I was confused)"},{time:98.00,text:"Looking everywhere only to find"},{time:100.08,text:"That it's not the way I have imagined it all in my mind"},{time:102.93,text:"(So what am I)"},{time:103.93,text:"What do I have but negativity"},{time:105.85,text:"'Cause I can't justify the way everyone is looking at me"},{time:108.80,text:"(Nothing to lose)"},{time:109.81,text:"Nothing to gain, hollow and alone"},{time:111.80,text:"And the fault is my own, and the fault is my own"},{time:114.80,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:120.66,text:"I wanna let go of the pain I've felt so long"},{time:124.58,text:"(Erase all the pain till it's gone)"},{time:126.62,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:132.62,text:"I wanna find something I've wanted all along"},{time:137.49,text:"Somewhere I belong"},{time:139.83,text:"I will never know myself until I do this on my own"},{time:145.68,text:"And I will never feel anything else until my wounds are healed"},{time:151.58,text:"I will never be anything till I break away from me"},{time:157.46,text:"I will break away, I'll find myself today"},{time:167.15,text:"I wanna heal, I wanna feel, what I thought was never real"},{time:173.99,text:"I wanna let go of the pain I've felt so long"},{time:178.11,text:"(Erase all the pain till it's gone)"},{time:179.95,text:"I wanna heal, I wanna feel, like I'm close to something real"},{time:185.86,text:"I wanna find something I've wanted all along"},{time:190.82,text:"Somewhere I belong"},{time:193.22,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:198.93,text:"(I wanna heal, I wanna feel like I'm somewhere I belong)"},{time:208.66,text:"Somewhere I belong"}
];`;

code = code.replace(/const somewhereIBelongLyrics = \[\s*[\s\S]*?\];/, newLyricsArray);

// 2. Remove the offset hack
code = code.replace(/const currentSecs = progress \* \(track\.duration \/ 1000\) \- 26; \/\/ Offset to 40\.5s start/, "const currentSecs = progress * (track.duration / 1000);");

// 3. Make the container even smaller to avoid overlap (h-[48vh] instead of h-[60vh])
code = code.replace(/h-\[60vh\]/g, "h-[45vh]");

// 4. Update the inner container padding
code = code.replace(/py-\[25vh\]/g, "py-[18vh]");

// 5. Shrink text sizes further
// Active text
code = code.replace(
    /'text-2xl md:text-4xl text-white drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.6\)\] scale-110'/g,
    "'text-xl md:text-3xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'"
);
// Inactive passed text
code = code.replace(
    /'text-lg md:text-2xl text-white\/40 hover:text-white\/70'/g,
    "'text-base md:text-xl text-white/40 hover:text-white/70'"
);
// Inactive upcoming text
code = code.replace(
    /'text-lg md:text-2xl text-white\/20 hover:text-white\/50'/g,
    "'text-base md:text-xl text-white/20 hover:text-white/50'"
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer lyrics to v4 (LRCLIB timings + height strictly 45vh + smaller font)');
