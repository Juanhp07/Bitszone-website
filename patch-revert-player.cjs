const fs = require('fs');
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Remove import GlassSurface
mainApp = mainApp.replace("import GlassSurface from '../ui/GlassSurface';\n", "");

// 2. Revert padding bottom
mainApp = mainApp.replace('className="pt-24 pb-[140px] min-h-full"', 'className="pt-24 pb-12 min-h-full"');

// 3. Revert Player wrap
const regex = /\{\/\* Floating Glass Player \*\/\}[\s\S]*?(?=\n\s*<\/div>\n\s*<\/div>\n\n\s*<ImmersivePlayer)/;
const oldPlayerWrap = `{/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
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
                    }
                  }}
                  onVolumeChange={(v) => {
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v / 100;
                  }}
                />
              </div>
            )}`;

if (regex.test(mainApp)) {
  mainApp = mainApp.replace(regex, oldPlayerWrap);
  fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
  console.log("MainApp reverted successfully.");
} else {
  console.log("Failed to revert MainApp.");
}

// 4. Revert MiniPlayer rounded-none
let miniPlayer = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');
miniPlayer = miniPlayer.replace(/rounded-\[inherit\]/g, "rounded-none");
fs.writeFileSync('src/components/player/MiniPlayer.tsx', miniPlayer);
console.log("MiniPlayer reverted successfully.");

