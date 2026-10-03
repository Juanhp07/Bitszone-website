const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');

// 1. removeAlbumFromDownloads
code = code.replace(
  "calculateBytes(updated);\n      return updated;",
  "calculateBytes(updated);\n      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Álbum eliminado de Descargas' }));\n      return updated;"
);

// 2. removeAlbumFromFavorites
code = code.replace(
  "localStorage.setItem('bz_favorites', JSON.stringify(updated));\n      return updated;",
  "localStorage.setItem('bz_favorites', JSON.stringify(updated));\n      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Álbum eliminado de Favoritos' }));\n      return updated;"
);

// 3. clearDownloads
code = code.replace(
  "calculateBytes([]);\n  };",
  "calculateBytes([]);\n    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Todas las descargas eliminadas' }));\n  };"
);

// 4. clearFavorites
code = code.replace(
  "localStorage.setItem('bz_favorites', JSON.stringify([]));\n  };",
  "localStorage.setItem('bz_favorites', JSON.stringify([]));\n    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Todos los favoritos eliminados' }));\n  };"
);

fs.writeFileSync('src/components/player/DownloadsContext.tsx', code);
console.log("Updated DownloadsContext with missing toasts");
