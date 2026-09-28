const fs = require('fs');

let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldImmersive = `<ImmersivePlayer 
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        track={nowPlayingTrack}
        album={nowPlayingAlbum}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onPlayTrack={handlePlayTrack}
        volume={volume}
        setVolume={setVolume}
        progress={progress}
      />`;

const newImmersive = `<ImmersivePlayer 
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        track={nowPlayingTrack}
        album={nowPlayingAlbum}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onPlayTrack={handlePlayTrack}
        volume={volume}
        setVolume={(v) => {
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v / 100;
        }}
        progress={progress}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onToggleMute={toggleMute}
      />`;

mainApp = mainApp.replace(oldImmersive, newImmersive);
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);
console.log('MainApp Immersive props updated');
