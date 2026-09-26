const fs = require('fs');
let cat = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');
// Fix CatalogView
cat = cat.replace(
  "  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);\n  const { downloadTrack, isDownloaded } = useDownloads();\n\n  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);",
  "  const { downloadTrack, isDownloaded } = useDownloads();\n  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);"
);
fs.writeFileSync('src/components/player/CatalogView.tsx', cat);

// Fix ArtistView
let art = fs.readFileSync('src/components/player/ArtistView.tsx', 'utf8');
const artState = `
  const { downloadTrack, isDownloaded } = useDownloads();
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState<Album | null>(null);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);

  const handleDownloadAlbumClick = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation();
    setShowDownloadConfirm(album);
  };

  const executeDownloadAlbum = async () => {
    const album = showDownloadConfirm;
    setShowDownloadConfirm(null);
    if (!album || !album.tracks) return;
    setIsDownloadingAlbum(album.id);
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    for (const track of tracksToDownload) {
      setDownloadingIds(prev => [...prev, track.id]);
      await downloadTrack(track);
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
    setIsDownloadingAlbum(null);
  };
`;

art = art.replace(
  "  const artistAlbums = albums.filter(a => a.artist.toLowerCase().includes(artist.name.toLowerCase()));",
  artState + "\n  const artistAlbums = albums.filter(a => a.artist.toLowerCase().includes(artist.name.toLowerCase()));"
);

fs.writeFileSync('src/components/player/ArtistView.tsx', art);
