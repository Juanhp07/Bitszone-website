const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Rewrite the entire RIGHT section cleanly to avoid multiple fragile replaces
const regexRightSection = /\{\/\*\s*2\. RIGHT: Unified Cover, Info & Controls\s*\*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/>,\s*document\.body)/;

const newRightSection = `{/* 2. RIGHT: Unified Cover, Info & Controls */}
        <div className="w-[65%] h-full relative flex flex-col items-center justify-center">
           {/* Background Cover Image */}
           <img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className={\`absolute inset-0 w-full h-full object-cover z-0 grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
           />
           
           {/* Fades on all sides */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80 z-10 pointer-events-none" />

           {/* Top Tabs (PORTADA / LETRA) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 p-1 flex items-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              {/* Sliding Background */}
              <div 
                className={\`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm \${activeTab === 'letra' ? 'left-[calc(50%)]' : 'left-1'}\`}
              />
              <button 
                onClick={() => setActiveTab('portada')}
                className={\`relative z-10 px-6 py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 \${activeTab === 'portada' ? 'text-white' : 'text-white/40 hover:text-white/70'}\`}
              >
                Portada
              </button>
              <button 
                onClick={() => setActiveTab('letra')}
                className={\`relative z-10 px-6 py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 \${activeTab === 'letra' ? 'text-white' : 'text-white/40 hover:text-white/70'}\`}
              >
                Letra
              </button>
           </div>

           {/* Lyrics View Area */}
           <div className={\`absolute inset-0 flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-100 translate-y-[-5vh]' : 'opacity-0 translate-y-12 pointer-events-none'}\`}>
              <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase blur-[0.5px]">No hay letras disponibles</p>
           </div>

           {/* Floating Content: Info & Controls */}
           <div className={\`relative z-30 flex flex-col items-center justify-center w-full px-8 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'translate-y-[30vh] scale-[0.85]' : 'translate-y-0 scale-100'}\`}>
              <h2 className="text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white mb-4 text-center leading-tight [text-shadow:_0_4px_30px_rgba(0,0,0,0.8),_0_2px_10px_rgba(0,0,0,0.5)]">
                {album.title}
              </h2>
              <p className="text-white/70 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center mb-16 [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)]">
                {album.artist}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-8 md:gap-12">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipBack className="w-5 h-5 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform" fill="currentColor" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] group"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-95 transition-transform" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-2 group-hover:scale-105 transition-transform" fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/5 group"
                >
                  <SkipForward className="w-5 h-5 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" fill="currentColor" />
                </button>
              </div>
           </div>
        </div>`;

if (player.match(regexRightSection)) {
  player = player.replace(regexRightSection, newRightSection);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully updated Lyrics view, tabs, and removed background box.');
} else {
  console.log('Regex did not match.');
}

