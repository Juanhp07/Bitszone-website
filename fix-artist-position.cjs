const fs = require('fs');
let content = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');

content = content.replace(
  `                  </div>
                </div>
                {album.tracks && album.tracks.length > 0 && (
                  <button `,
  `                  </div>
                  {album.tracks && album.tracks.length > 0 && (
                  <button `
);

content = content.replace(
  `                    )}
                  </button>
                )}
                <h3 className="font-bold text-white mb-1 truncate">`,
  `                    )}
                  </button>
                )}
                </div>
                <h3 className="font-bold text-white mb-1 truncate">`
);

fs.writeFileSync('src/components/player/ArtistView.tsx', content);
