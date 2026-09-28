const fs = require('fs');
let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Update groupedTracks definition
const oldGroupedDef = `  const groupedTracks = type === 'downloads' \n    ? tracks.reduce((acc, track) => {\n        const albumKey = track.albumId ? String(track.albumId) : 'unknown';\n        if (!acc[albumKey]) {\n          acc[albumKey] = {\n            id: albumKey,\n            title: track.albumTitle || 'Canciones sueltas',\n            coverUrl: track.albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',\n            tracks: []\n          };\n        }\n        acc[albumKey].tracks.push(track);\n        return acc;\n      }, {} as Record<string, { id: string, title: string, coverUrl: string, tracks: Track[] }>)\n    : null;`;
const newGroupedDef = `  const groupedTracks = tracks.reduce((acc, track) => {\n    const albumKey = track.albumId ? String(track.albumId) : 'unknown';\n    if (!acc[albumKey]) {\n      acc[albumKey] = {\n        id: albumKey,\n        title: track.albumTitle || 'Canciones sueltas',\n        coverUrl: track.albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',\n        tracks: []\n      };\n    }\n    acc[albumKey].tracks.push(track);\n    return acc;\n  }, {} as Record<string, { id: string, title: string, coverUrl: string, tracks: Track[] }>);`;

content = content.replace(oldGroupedDef, newGroupedDef);

// Update rendering block
const oldRenderBlock = `{type === 'downloads' && groupedTracks ? (
          <div className="flex flex-col gap-10">
            {Object.values(groupedTracks).map(group => (
              <div key={group.id} className="flex flex-col">
                <div className="flex items-center gap-4 mb-4 px-4">
                  <img src={group.coverUrl} alt={group.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                  <h3 className="text-xl font-bold text-white">{group.title}</h3>
                </div>
                
                <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
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
            <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
              <div className="text-center">#</div>
              <div>Título</div>
              <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
              <div></div>
            </div>

            <div className="flex flex-col gap-1">
              {tracks.map((track, index) => renderTrack(track, index))}
            </div>
          </>
        )}`;

const newRenderBlock = `<div className="flex flex-col gap-10">
          {Object.values(groupedTracks).map(group => (
            <div key={group.id} className="flex flex-col">
              <div className="flex items-center gap-4 mb-4 px-4">
                <img src={group.coverUrl} alt={group.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                <h3 className="text-xl font-bold text-white">{group.title}</h3>
              </div>
              
              <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-3">
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
        </div>`;

content = content.replace(oldRenderBlock, newRenderBlock);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Grouped tracks rendered unconditionally.');
