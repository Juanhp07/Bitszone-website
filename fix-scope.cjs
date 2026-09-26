const fs = require('fs');
let content = fs.readFileSync('src/components/player/AlbumView.tsx', 'utf8');

const logicToInsert = `
  const handleDownloadAlbum = async () => {
    setShowDownloadConfirm(false);
    if (!album.tracks) return;
    
    setIsDownloadingAlbum(true);
    const tracksToDownload = album.tracks.filter(t => !isDownloaded(t.id));
    
    for (const track of tracksToDownload) {
      setDownloadingIds(prev => [...prev, track.id]);
      await downloadTrack(track);
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
    
    setIsDownloadingAlbum(false);
  };

  const isEntireAlbumDownloaded = album.tracks?.every(t => isDownloaded(t.id)) ?? false;
`;

// Remove the wrongly inserted block
content = content.replace(logicToInsert + "\n  return (", "  return (");

// Insert it right before the LAST return (
// Wait, the main return is after `const handleFavorite = ...`
const properInsertTarget = `  const handleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  return (`;

content = content.replace(
  properInsertTarget,
  `  const handleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    toggleFavorite(track);
  };\n${logicToInsert}\n  return (`
);

fs.writeFileSync('src/components/player/AlbumView.tsx', content);
