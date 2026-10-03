const fs = require('fs');

// 1. DownloadsContext.tsx
let ctx = fs.readFileSync('src/components/player/DownloadsContext.tsx', 'utf8');
ctx = ctx.replace(/eliminada de Favoritos/g, 'eliminada de tu Biblioteca');
ctx = ctx.replace(/agregada a Favoritos/g, 'agregada a tu Biblioteca');
ctx = ctx.replace(/eliminado de Favoritos/g, 'eliminado de tu Biblioteca');
ctx = ctx.replace(/agregado a Favoritos/g, 'agregado a tu Biblioteca');
ctx = ctx.replace(/Todos los favoritos eliminados/g, 'Toda la biblioteca ha sido eliminada');
fs.writeFileSync('src/components/player/DownloadsContext.tsx', ctx);

// 2. DownloadsView.tsx
let dlView = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');
dlView = dlView.replace(/Quitar de favoritos/g, 'Quitar de tu Biblioteca');
dlView = dlView.replace(/Buscar en favoritos\.\.\./g, 'Buscar en tu Biblioteca...');
fs.writeFileSync('src/components/player/DownloadsView.tsx', dlView);

// 3. MainApp.tsx
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
mainApp = mainApp.replace(/Agregar a favoritos/g, 'Agregar a tu Biblioteca');
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

// 4. AlbumView.tsx
let albView = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');
albView = albView.replace(/Eliminar de favoritos/g, 'Eliminar de tu Biblioteca');
albView = albView.replace(/Agregar a favoritos/g, 'Agregar a tu Biblioteca');
fs.writeFileSync('src/components/player/AlbumView.tsx', albView);

console.log("Updated terminology to Biblioteca");
