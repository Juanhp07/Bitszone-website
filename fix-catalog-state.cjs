const fs = require('fs');
let content = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

const stateLogic = `
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

content = content.replace(
  "  const { downloadTrack, isDownloaded } = useDownloads();",
  "  const { downloadTrack, isDownloaded } = useDownloads();\n" + stateLogic
);

fs.writeFileSync('src/components/player/CatalogView.tsx', content);
