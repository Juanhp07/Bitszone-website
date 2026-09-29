const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Remove activeLineIndex, currentSecs, and auto-scroll useEffect
const logicToRemoveRegex = /const currentSecs = progress \* \(track\.duration \/ 1000\);\s*const activeLineIndex = React\.useMemo\(\(\) => \{\s*return activeLyrics\.reduce\(\(acc, line, i\) => \{\s*if \(currentSecs >= line\.time\) return i;\s*return acc;\s*\}, -1\);\s*\}, \[currentSecs, activeLyrics\]\);\s*React\.useEffect\(\(\) => \{\s*if \(activeTab === 'letra' && activeLineRef\.current && lyricsContainerRef\.current\) \{\s*activeLineRef\.current\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\s*\}\s*\}, \[activeLineIndex, activeTab\]\);/;

code = code.replace(logicToRemoveRegex, '');

// 2. Simplify the lyrics mapping and styling inside the JSX
const mapRegex = /\{activeLyrics\.map\(\(line, i\) => \{\s*const isActive = i === activeLineIndex;\s*const isPassed = i < activeLineIndex;\s*return \([\s\S]*?\}\s*\}\)\}/;

const simpleMap = `{activeLyrics.map((line, i) => (
                    <p 
                      key={i}
                      className="text-center text-lg md:text-xl text-white/70 hover:text-white/90 transition-colors duration-300 font-medium tracking-wide max-w-2xl px-4"
                    >
                      {line.text}
                    </p>
                  ))}`;

code = code.replace(mapRegex, simpleMap);

// 3. Fix the container padding (py-[18vh] -> py-12) since we don't need auto-scroll centering space
code = code.replace(/py-\[18vh\]/g, "py-12");

// 4. Slightly increase the height to 55vh since it's static and we want to see more text, but keep it above Meteoro
code = code.replace(/h-\[45vh\]/g, "h-[55vh]");

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer to use static scrollable lyrics');
