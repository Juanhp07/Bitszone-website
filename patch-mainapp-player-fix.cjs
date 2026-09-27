const fs = require('fs');
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const regex = /\{\/\* Fusionado Player at the bottom of the body - Sits structurally in flex flow \*\/\}[\s\S]*?(?=\n\s*<\/div>\n\s*<\/div>\n\n\s*<ImmersivePlayer)/;

const newPlayerWrap = `{/* Floating Glass Player */}
            {nowPlayingTrack && nowPlayingAlbum && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-screen-2xl">
                <GlassSurface
                  width="100%"
                  height="90px"
                  borderRadius={24}
                  blur={20}
                  opacity={0.7}
                  brightness={10}
                  borderWidth={1}
                >
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
                </GlassSurface>
              </div>
            )}`;

if (regex.test(mainApp)) {
  mainApp = mainApp.replace(regex, newPlayerWrap);
  fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
  console.log("Replacement successful.");
} else {
  console.log("Regex did not match!");
}
