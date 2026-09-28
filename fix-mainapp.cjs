const fs = require('fs');

let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

// 1. Change volume to 100 and add prevVolume
mainApp = mainApp.replace(
  'const [volume, setVolume] = useState(70);',
  'const [volume, setVolume] = useState(100);\n  const [prevVolume, setPrevVolume] = useState(100);'
);

// 2. Insert toggleMute function
const toggleMuteFunc = `  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 100);
      if (audioRef.current) audioRef.current.volume = (prevVolume > 0 ? prevVolume : 100) / 100;
    }
  };
`;
// Insert before useEffect
mainApp = mainApp.replace(
  '  const audioRef = useRef<HTMLAudioElement | null>(null);',
  '  const audioRef = useRef<HTMLAudioElement | null>(null);\n\n' + toggleMuteFunc
);

// 3. Add props to MiniPlayer
const oldMiniPlayer = `<MiniPlayer 
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
                />`;

const newMiniPlayer = `<MiniPlayer 
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
                  onToggleMute={toggleMute}
                  onSelectAlbum={() => handleSelectAlbum(nowPlayingAlbum)}
                  onSelectArtist={() => {
                    setSelectedArtist({ name: nowPlayingAlbum.artist, img: nowPlayingAlbum.coverUrl, type: nowPlayingAlbum.artist.includes('Combo') || nowPlayingAlbum.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista' });
                    setCurrentView('artist');
                  }}
                />`;

mainApp = mainApp.replace(oldMiniPlayer, newMiniPlayer);

fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
console.log('MainApp updated');
