const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const regex = /\{\/\*\s*2\. CENTER: Visualizer & Controls\s*\*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/>,\s*document\.body)/;

const newSection = `{/* 2. RIGHT: Unified Cover, Info & Controls */}
        <div className="w-[65%] h-full relative flex flex-col items-center justify-center">
           {/* Background Cover Image */}
           <img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className="absolute inset-0 w-full h-full object-cover opacity-50 z-0 grayscale-[20%] contrast-125" 
           />
           
           {/* Fades on all sides */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80 z-10 pointer-events-none" />

           {/* Top Tabs (PORTADA / LETRA) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
              <button className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Portada</button>
              <button className="text-white/40 hover:text-white transition-colors">Letra</button>
           </div>

           {/* Floating Content: Info & Controls */}
           <div className="relative z-30 flex flex-col items-center justify-center w-full px-8">
              <h2 className="text-4xl md:text-6xl xl:text-7xl font-serif italic font-bold text-white mb-4 drop-shadow-lg text-center leading-tight">
                {album.title}
              </h2>
              <p className="text-white/50 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-center drop-shadow-md mb-16">
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
                  onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
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
           </div>`;

if (player.match(regex)) {
  player = player.replace(regex, newSection);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully replaced 3-column layout with 2-column unified layout.');
} else {
  console.log('Regex did not match.');
}

