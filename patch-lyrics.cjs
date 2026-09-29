const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const lyricsConst = `
const somewhereIBelongLyrics = [
  {time:14.5,text:"(When this began)"},{time:17.5,text:"I had nothing to say"},{time:20,text:"And I get lost in the nothingness inside of me"},{time:23.5,text:"(I was confused)"},{time:26,text:"And I let it all out to find"},{time:29,text:"That I'm not the only person with these things in mind"},{time:32.5,text:"(Inside of me)"},{time:34.5,text:"But all the vacancy the words revealed"},{time:38,text:"Is the only real thing that I've got left to feel"},{time:41.5,text:"(Nothing to lose)"},{time:43.5,text:"Just stuck, hollow and alone"},{time:46.5,text:"And the fault is my own"},{time:48.5,text:"And the fault is my own"},{time:51.5,text:"I wanna heal, I wanna feel"},{time:54,text:"What I thought was never real"},{time:56.5,text:"I wanna let go of the pain I've felt so long"},{time:59.5,text:"(Erase all the pain 'til it's gone)"},{time:62,text:"I wanna heal, I wanna feel"},{time:64.5,text:"Like I'm close to something real"},{time:67.5,text:"I wanna find something I've wanted all along"},{time:70.5,text:"Somewhere I belong"},{time:75,text:"And I've got nothing to say"},{time:78,text:"I can't believe I didn't fall right down on my face"},{time:81.5,text:"(I was confused)"},{time:83.5,text:"Looking everywhere only to find"},{time:86.5,text:"That it's not the way I had imagined it all in my mind"},{time:90,text:"(So what am I?)"},{time:92,text:"What do I have but negativity?"},{time:95.5,text:"'Cause I can't justify the way everyone is looking at me"},{time:99,text:"(Nothing to lose)"},{time:101.5,text:"Nothing to gain, hollow and alone"},{time:104.5,text:"And the fault is my own"},{time:106.5,text:"And the fault is my own"},{time:109,text:"I wanna heal, I wanna feel"},{time:112,text:"What I thought was never real"},{time:114.5,text:"I wanna let go of the pain I've felt so long"},{time:117.5,text:"(Erase all the pain 'til it's gone)"},{time:120,text:"I wanna heal, I wanna feel"},{time:122.5,text:"Like I'm close to something real"},{time:125.5,text:"I wanna find something I've wanted all along"},{time:128.5,text:"Somewhere I belong"},{time:133.5,text:"I will never know myself until I do this on my own"},{time:138.5,text:"And I will never feel anything else until my wounds are healed"},{time:144.5,text:"I will never be anything 'til I break away from me"},{time:150,text:"I will break away, I'll find myself today"},{time:156,text:"I wanna heal, I wanna feel"},{time:159,text:"What I thought was never real"},{time:161.5,text:"I wanna let go of the pain I've felt so long"},{time:164.5,text:"(Erase all the pain 'til it's gone)"},{time:167,text:"I wanna heal, I wanna feel"},{time:169.5,text:"Like I'm close to something real"},{time:172.5,text:"I wanna find something I've wanted all along"},{time:175.5,text:"Somewhere I belong"},{time:181.5,text:"I wanna heal, I wanna feel like I'm somewhere I belong"},{time:192.5,text:"I wanna heal, I wanna feel like I'm somewhere I belong"},{time:202.5,text:"Somewhere I belong"}
];
`;

if (!code.includes('somewhereIBelongLyrics')) {
  code = code.replace(/export const ImmersivePlayer/, lyricsConst + '\nexport const ImmersivePlayer');
}

// Inside component, add references and logic
const stateVariablesFind = `const [activeTab, setActiveTab] = React.useState<'portada' | 'letra'>('portada');`;
const logicAdd = `
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeLineRef = React.useRef<HTMLParagraphElement>(null);

  const isSomewhereIBelong = track.title === "Somewhere I Belong";
  const activeLyrics = isSomewhereIBelong ? somewhereIBelongLyrics : [];
  const currentSecs = progress * (track.duration / 1000);

  const activeLineIndex = React.useMemo(() => {
    return activeLyrics.reduce((acc, line, i) => {
      if (currentSecs >= line.time) return i;
      return acc;
    }, -1);
  }, [currentSecs, activeLyrics]);

  React.useEffect(() => {
    if (activeTab === 'letra' && activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex, activeTab]);
`;

if (!code.includes('lyricsContainerRef')) {
  code = code.replace(stateVariablesFind, stateVariablesFind + logicAdd);
}

// Replace the UI
const lyricsUIFind = `<p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>`;

const lyricsUIReplace = `
              {isSomewhereIBelong ? (
                <div 
                  ref={lyricsContainerRef}
                  className="w-full h-full max-h-[60vh] overflow-y-auto px-8 py-[30vh] flex flex-col items-center gap-6"
                  style={{ 
                    scrollbarWidth: 'none',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                  }}
                >
                  {activeLyrics.map((line, i) => {
                    const isActive = i === activeLineIndex;
                    const isPassed = i < activeLineIndex;
                    return (
                      <p 
                        key={i}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => {
                           // If we wanted click-to-seek we would do it here, but no seek API is provided.
                        }}
                        className={\`text-center transition-all duration-500 ease-out cursor-pointer font-bold \${
                          isActive 
                            ? 'text-3xl md:text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110' 
                            : isPassed 
                              ? 'text-xl md:text-3xl text-white/40 hover:text-white/70' 
                              : 'text-xl md:text-3xl text-white/20 hover:text-white/50'
                        }\`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>
              )}
`;

if (!code.includes('isSomewhereIBelong ?')) {
  code = code.replace(lyricsUIFind, lyricsUIReplace);
}

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Synchronized lyrics logic added');
