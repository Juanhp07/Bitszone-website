const fs = require('fs');
let file = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const groupingLogic = `
  const groupedTracks = type === 'downloads' 
    ? tracks.reduce((acc, track) => {
        const albumKey = track.albumId ? String(track.albumId) : 'unknown';
        if (!acc[albumKey]) {
          acc[albumKey] = {
            id: albumKey,
            title: track.albumTitle || 'Canciones sueltas',
            coverUrl: track.albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',
            tracks: []
          };
        }
        acc[albumKey].tracks.push(track);
        return acc;
      }, {} as Record<string, { id: string, title: string, coverUrl: string, tracks: Track[] }>)
    : null;

  const renderTrack = (track: Track, index: number) => {
    const isHovered = hoveredTrack === track.id;
    return (
      <div 
        key={track.id}
        onMouseEnter={() => setHoveredTrack(track.id)}
        onMouseLeave={() => setHoveredTrack(null)}
        onClick={() => handlePlay(track)}
        className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"
      >
        <div className="text-center text-white/50 font-medium">
          {isHovered ? (
            <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
        
        <div className="flex flex-col pr-4">
          <span className="font-medium line-clamp-1 text-white">
            {track.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-4">
          <div className="w-10 text-right text-white/50 text-sm">
            {formatDuration(track.duration)}
          </div>
        </div>

        <div className="flex items-center justify-center">
          {isHovered && (
            <button 
              onClick={(e) => handleRemove(e, track)}
              className="text-white/40 hover:text-red-400 transition-colors p-2"
              title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
            >
              {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };
`;

// Insert groupingLogic right before "if (tracks.length === 0) {"
file = file.replace('  if (tracks.length === 0) {', groupingLogic + '\n  if (tracks.length === 0) {');

// Now replace the Tracklist rendering part
const oldRender = `{/* Header */}
        <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">
          <div className="text-center">#</div>
          <div>Título</div>
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
          <div></div>
        </div>

        {/* Tracklist */}
        <div className="flex flex-col gap-1 pb-10">
          {tracks.map((track, index) => {
            const isHovered = hoveredTrack === track.id;
            return (
              <div 
                key={track.id}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() => handlePlay(track)}
                className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"
              >
                <div className="text-center text-white/50 font-medium">
                  {isHovered ? (
                    <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <div className="flex flex-col pr-4">
                  <span className="font-medium line-clamp-1 text-white">
                    {track.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-4">
                  <div className="w-10 text-right text-white/50 text-sm">
                    {formatDuration(track.duration)}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {isHovered && (
                    <button 
                      onClick={(e) => handleRemove(e, track)}
                      className="text-white/40 hover:text-red-400 transition-colors p-2"
                      title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
                    >
                      {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>`;

const newRender = `{type === 'downloads' && groupedTracks ? (
          <div className="flex flex-col gap-10 pb-10">
            {Object.values(groupedTracks).map(group => (
              <div key={group.id} className="flex flex-col">
                <div className="flex items-center gap-4 mb-4 px-4">
                  <img src={group.coverUrl} alt={group.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                  <h3 className="text-xl font-bold text-white">{group.title}</h3>
                </div>
                
                <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-2">
                  <div className="text-center">#</div>
                  <div>Título</div>
                  <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
                  <div></div>
                </div>

                <div className="flex flex-col gap-1">
                  {group.tracks.map((track, index) => renderTrack(track, index))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">
              <div className="text-center">#</div>
              <div>Título</div>
              <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
              <div></div>
            </div>

            <div className="flex flex-col gap-1 pb-10">
              {tracks.map((track, index) => renderTrack(track, index))}
            </div>
          </>
        )}`;

if (file.includes('const isHovered = hoveredTrack === track.id;')) {
  file = file.replace(oldRender, newRender);
} else {
  console.log("Could not find the old render block to replace.");
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', file);
