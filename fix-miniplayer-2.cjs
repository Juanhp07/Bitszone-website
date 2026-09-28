const fs = require('fs');

let miniPlayer = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

const targetTrackInfo = `<div className="flex flex-col cursor-pointer" onClick={onExpand}>
          <h4 className="text-white font-semibold text-sm line-clamp-1 hover:underline">{track.title}</h4>
          <span className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline">{track.artist}</span>
        </div>`;

const newTrackInfo = `<div className="flex flex-col justify-center">
          <h4 
            onClick={(e) => { e.stopPropagation(); onSelectAlbum && onSelectAlbum(); }} 
            className="text-white font-semibold text-sm line-clamp-1 hover:underline cursor-pointer"
          >
            {track.title}
          </h4>
          <span 
            onClick={(e) => { e.stopPropagation(); onSelectArtist && onSelectArtist(); }} 
            className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline cursor-pointer"
          >
            {track.artist}
          </span>
        </div>`;

miniPlayer = miniPlayer.replace(targetTrackInfo, newTrackInfo);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', miniPlayer);
console.log('MiniPlayer track info updated');
