const fs = require('fs');

// ArtistView
let art = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');
art = art.replace("import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle }", "import { Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle }");
if (!art.includes('HeartOff')) {
  art = art.replace("import { Play, Pause, Heart, MoreHorizontal", "import { Play, Pause, Heart, HeartOff, MoreHorizontal");
}
if (!art.includes('AlertCircle')) {
  art = art.replace("import { Play, Pause, Heart, HeartOff, MoreHorizontal", "import { Play, Pause, Heart, HeartOff, MoreHorizontal, AlertCircle");
}
fs.writeFileSync('src/components/player/ArtistView.tsx', art);

// CatalogView
let cat = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');
if (!cat.includes('cancelAlbumDownload')) {
  cat = cat.replace("const { isDownloaded, getDownloadProgress, downloadAlbum", "const { isDownloaded, getDownloadProgress, downloadAlbum, cancelAlbumDownload");
}
fs.writeFileSync('src/components/player/CatalogView.tsx', cat);

// SadView
let sad = fs.readFileSync('src/components/player/SadView.tsx', 'utf8');
sad = sad.replace(/className="w-16 h-16 bg-white\/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white\/20 hover:scale-110 transition-all border border-white\/20"/g, 'XCLASSX');
sad = sad.replace(/XCLASSX\s*XCLASSX/g, 'className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"');
sad = sad.replace(/XCLASSX/g, 'className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"');
fs.writeFileSync('src/components/player/SadView.tsx', sad);
