const fs = require('fs');

function replaceFile(path, oldText, newText) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(oldText, newText);
  fs.writeFileSync(path, content);
}

// ArtistView
let art = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');
art = art.replace("import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle }", "import { Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle }");
if (!art.includes('cancelAlbumDownload')) {
  art = art.replace("const { isDownloaded, getDownloadProgress, downloadAlbum } = useDownloads();", "const { isDownloaded, getDownloadProgress, downloadAlbum, cancelAlbumDownload } = useDownloads();");
}
fs.writeFileSync('src/components/player/ArtistView.tsx', art);

// CatalogView
let cat = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');
if (!cat.includes('cancelAlbumDownload')) {
  cat = cat.replace("const { isDownloaded, getDownloadProgress, downloadAlbum } = useDownloads();", "const { isDownloaded, getDownloadProgress, downloadAlbum, cancelAlbumDownload } = useDownloads();");
}
fs.writeFileSync('src/components/player/CatalogView.tsx', cat);

// DownloadsView
let down = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');
if (!down.includes('const [showCancelConfirm, setShowCancelConfirm] = useState<any>(null);')) {
  down = down.replace("const [showClearConfirm, setShowClearConfirm] = useState(false);", "const [showClearConfirm, setShowClearConfirm] = useState(false);\n  const [showCancelConfirm, setShowCancelConfirm] = useState<any>(null);");
}
if (!down.includes('cancelAlbumDownload')) {
  down = down.replace("const { removeDownload, clearDownloads, isDownloaded, removeAlbumFromDownloads, removeAlbumFromFavorites, toggleFavorite } = useDownloads();", "const { removeDownload, clearDownloads, isDownloaded, removeAlbumFromDownloads, removeAlbumFromFavorites, toggleFavorite, cancelAlbumDownload } = useDownloads();");
  down = down.replace("const { removeDownload, clearDownloads, removeAlbumFromDownloads, removeAlbumFromFavorites, toggleFavorite } = useDownloads();", "const { removeDownload, clearDownloads, removeAlbumFromDownloads, removeAlbumFromFavorites, toggleFavorite, cancelAlbumDownload } = useDownloads();");
}
fs.writeFileSync('src/components/player/DownloadsView.tsx', down);

// SadView
let sad = fs.readFileSync('src/components/player/SadView.tsx', 'utf8');
sad = sad.replace(/className="w-16 h-16 bg-white\/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white\/20 hover:scale-110 transition-all border border-white\/20"\s*className="w-16 h-16 bg-white\/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white\/20 hover:scale-110 transition-all border border-white\/20"/g, 'className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"');
fs.writeFileSync('src/components/player/SadView.tsx', sad);
console.log("Fixed part 2");
