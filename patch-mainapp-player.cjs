const fs = require('fs');
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Add import for GlassSurface
mainApp = mainApp.replace(
  "import { ImmersivePlayer } from './ImmersivePlayer';",
  "import { ImmersivePlayer } from './ImmersivePlayer';\nimport GlassSurface from '../ui/GlassSurface';"
);

// 2. Adjust padding bottom of main content to make room for floating player
mainApp = mainApp.replace(
  'className="pt-24 pb-12 min-h-full"',
  'className="pt-24 pb-[140px] min-h-full"'
);

// 3. Replace the Player wrapper
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

mainApp = mainApp.replace(oldPlayerWrap, newPlayerWrap);
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

