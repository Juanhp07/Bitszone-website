const fs = require('fs');
let file = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

file = file.replace(
  "import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';",
  "import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react';\nimport { useDownloads } from './DownloadsContext';"
);

file = file.replace(
  "export const MiniPlayer = ({",
  "export const MiniPlayer = ({"
);

file = file.replace(
  "  onVolumeChange?: (volume: number) => void\n}) => {",
  "  onVolumeChange?: (volume: number) => void\n}) => {\n  const { isFavorite, toggleFavorite } = useDownloads();"
);

// Insert Heart button next to track info
file = file.replace(
  /          <span className="text-white\/60 text-xs mt-0\.5 line-clamp-1 hover:underline">\{track\.artist\}<\/span>\n        <\/div>\n      <\/div>/,
  `          <span className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline">{track.artist}</span>
        </div>
        <button 
          className="ml-4 text-white/50 hover:text-white transition-colors"
          onClick={() => toggleFavorite(track)}
        >
          <Heart 
            className="w-5 h-5" 
            fill={isFavorite(track.id) ? "#a855f7" : "none"} 
            color={isFavorite(track.id) ? "#a855f7" : "currentColor"} 
          />
        </button>
      </div>`
);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', file);
