const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const oldEmptyState = `          <h2 className="text-xl font-bold text-white mb-2">No hay nada aquí todavía</h2>
          <p className="text-white/50 text-sm leading-relaxed">Aún no has descargado ninguna canción ni álbum. Todo lo que descargues aparecerá en esta sección.</p>`;

const newEmptyState = `          <h2 className="text-xl font-bold text-white mb-2">No hay nada aquí todavía</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            {type === 'licenses' 
              ? 'Aquí aparecerán las licencias de las canciones y álbumes que hayas adquirido.'
              : type === 'playlists'
                ? 'Crea tus propias listas de reproducción y guárdalas aquí para escucharlas cuando quieras.'
                : type === 'favorites'
                  ? 'Aún no has agregado ninguna canción a tus favoritos. Las canciones que marques aparecerán aquí.'
                  : 'Aún no has descargado ninguna canción ni álbum. Todo lo que descargues aparecerá en esta sección.'}
          </p>`;

if (code.includes('Aún no has descargado ninguna canción ni álbum')) {
  code = code.replace(oldEmptyState, newEmptyState);
  
  // Also update the icon in the empty state
  code = code.replace(
    "<DownloadCloud className=\"w-10 h-10 text-white/40\" />",
    "<Icon className=\"w-10 h-10 text-white/40\" />"
  );
  
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Fixed empty state text and icon");
} else {
  console.log("Could not find the empty state text");
}
