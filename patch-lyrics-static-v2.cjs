const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Remove logic
const logicToRemoveRegex = /const currentSecs = progress[\s\S]*?\[activeLineIndex, activeTab\]\);/m;
code = code.replace(logicToRemoveRegex, '');

// 2. Replace map block
const mapRegex = /\{activeLyrics\.map\(\(line, i\) => \{[\s\S]*?\}\)\}/m;
const simpleMap = `{activeLyrics.map((line, i) => (
                    <p 
                      key={i}
                      className="text-center text-lg md:text-xl text-white/70 hover:text-white transition-colors duration-300 font-medium tracking-wide max-w-2xl px-4"
                    >
                      {line.text}
                    </p>
                  ))}`;
code = code.replace(mapRegex, simpleMap);

// 3. Fix container padding (py-[18vh] -> py-12)
code = code.replace(/py-\[18vh\]/g, "py-12");

// 4. Slightly increase the height to 55vh
code = code.replace(/h-\[45vh\]/g, "h-[55vh]");

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer to use static scrollable lyrics (v2)');
