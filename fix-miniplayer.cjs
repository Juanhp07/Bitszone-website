const fs = require('fs');

let miniPlayer = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// Ensure correct lucide-react imports for volume
if (!miniPlayer.includes('Volume1') || !miniPlayer.includes('VolumeX')) {
  miniPlayer = miniPlayer.replace(
    `import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react';`,
    `import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart } from 'lucide-react';`
  );
}

// Add onToggleMute, onSelectAlbum, onSelectArtist to props
miniPlayer = miniPlayer.replace(
  `  onVolumeChange?: (volume: number) => void\n}`,
  `  onVolumeChange?: (volume: number) => void,\n  onToggleMute?: () => void,\n  onSelectAlbum?: () => void,\n  onSelectArtist?: () => void\n}`
);
miniPlayer = miniPlayer.replace(
  `  onVolumeChange\n}:`,
  `  onVolumeChange,\n  onToggleMute,\n  onSelectAlbum,\n  onSelectArtist\n}:`
);

// Add click interactions to Title and Artist
miniPlayer = miniPlayer.replace(
  `<div className="flex flex-col min-w-0 flex-1">
          <span className="text-white font-semibold text-sm truncate">{track.title}</span>
          <span className="text-white/50 text-xs truncate">{album.artist}</span>
        </div>`,
  `<div className="flex flex-col min-w-0 flex-1">
          <span onClick={onSelectAlbum} className="text-white font-semibold text-sm truncate cursor-pointer hover:underline">{track.title}</span>
          <span onClick={onSelectArtist} className="text-white/50 text-xs truncate cursor-pointer hover:underline">{album.artist}</span>
        </div>`
);

// Add Volume Icon logic
const volumeIconReplacement = `        <button onClick={onToggleMute} className="text-white/50 hover:text-white transition-colors focus:outline-none">
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 50 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>`;
miniPlayer = miniPlayer.replace(
  `<Volume2 className="w-4 h-4 text-white/50" />`,
  volumeIconReplacement
);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', miniPlayer);
console.log('MiniPlayer updated');
