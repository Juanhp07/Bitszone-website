const fs = require('fs');

let file = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Replace the root container and add the global orbs and noise
file = file.replace(
  /<div className="w-full h-screen bg-\[#050505\] text-white font-sans overflow-hidden flex flex-col relative">\n\s*{\/\* Root background orb so the sidebar blur is visible \*\/}\n\s*<div className="absolute top-\[-20%\] left-\[-10%\] w-\[50%\] h-\[50%\] bg-\[#a855f7\]\/10 rounded-full blur-\[150px\] pointer-events-none z-0"><\/div>/,
  `<div className="w-full h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col relative">
      {/* Global Background Orbs and Noise */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#a855f7]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0"></div>`
);

// 2. Remove the padded wrapper and the rounded glass panel, replacing it with a simple full-bleed flex container
const oldMainContentStruct = `{/* Floating Main Content (Body) wrapper - provides the gap */}
        <div className="flex-1 relative flex flex-col min-w-0 pb-4 pr-4 pl-4">
          
          {/* Main Body container that fully clips its background layers */}
          <div className="flex-1 relative flex flex-col min-w-0 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] overflow-hidden">
            
            {/* The colored orbs are now CONFINED inside this container so they don't bleed into the padding */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#a855f7]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
            
            {/* The glass layer that blurs the confined orbs */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/[0.05] pointer-events-none z-0 rounded-2xl"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0"></div>

            {/* Actual scrollable content on top of the glass */}
            <div className="flex-1 relative flex flex-col min-h-0 z-10">`;

const newMainContentStruct = `{/* Full-bleed Main Content container */}
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
            {/* Actual scrollable content */}
            <div className="flex-1 relative flex flex-col min-h-0 z-10">`;

file = file.replace(oldMainContentStruct, newMainContentStruct);

// 3. Close the missing div since we removed two wrappers but only added one. 
// Old struct closed two divs at the end of the Main Content. We only need to close one now.
// Let's find the end of the Main Content.
// We'll just replace the closing tags.
const oldClosingStruct = `            {/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
            {nowPlayingTrack && nowPlayingAlbum && (
              <div className="shrink-0 z-30 border-t border-white/5 bg-black/95 backdrop-blur-3xl">
                <MiniPlayer 
                  track={nowPlayingTrack}
                  album={nowPlayingAlbum}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  progress={progress}
                  volume={volume}
                  onExpand={() => setIsPlayerExpanded(true)}
                  onNext={handleNextTrack}
                  onPrev={handlePrevTrack}
                  onSeek={(p) => {
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = p * audioRef.current.duration;
                      setProgress(p);
                    }
                  }}
                  onVolumeChange={(v) => setVolume(v)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ImmersivePlayer`;

const newClosingStruct = `            {/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
            {nowPlayingTrack && nowPlayingAlbum && (
              <div className="shrink-0 z-30 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                <MiniPlayer 
                  track={nowPlayingTrack}
                  album={nowPlayingAlbum}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  progress={progress}
                  volume={volume}
                  onExpand={() => setIsPlayerExpanded(true)}
                  onNext={handleNextTrack}
                  onPrev={handlePrevTrack}
                  onSeek={(p) => {
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = p * audioRef.current.duration;
                      setProgress(p);
                    }
                  }}
                  onVolumeChange={(v) => setVolume(v)}
                />
              </div>
            )}
        </div>
      </div>

      <ImmersivePlayer`;

// We also made the MiniPlayer bg glassy instead of bg-black/95 so it matches the vibe
file = file.replace(oldClosingStruct, newClosingStruct);

fs.writeFileSync('src/components/player/MainApp.tsx', file);
