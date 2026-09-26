import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';
import type { Album, Track } from './types';
import { useDownloads } from './DownloadsContext';

export const AlbumView = ({ 
  album, 
  loading,
  onViewChange,
  onPlayTrack,
  nowPlayingTrackId,
  isPlaying,
  togglePlay
}: { 
  album: Album | null, 
  loading: boolean,
  onViewChange: (view: any) => void,
  onPlayTrack: (t: Track, a: Album) => void,
  nowPlayingTrackId?: number,
  isPlaying: boolean,
  togglePlay: () => void
}) => {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const { downloadTrack, isDownloaded, toggleFavorite, isFavorite } = useDownloads();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!album) return null;

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPlays = (id: number) => {
    // Generate a pseudo-random looking number based on the ID so it doesn't change on re-render
    const num = ((id * 1234567) % 900000) + 100000;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleDownload = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (isDownloaded(track.id)) return;
    setDownloadingIds(prev => [...prev, track.id]);
    await downloadTrack(track);
    setDownloadingIds(prev => prev.filter(id => id !== track.id));
  };

  const handleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Background Blurred Cover Glow from Top-Right */}
      <div className="absolute top-0 right-0 w-[70vw] h-[700px] z-0 pointer-events-none opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}>
        <div className="absolute inset-0 bg-cover bg-center blur-[100px]" style={{ backgroundImage: `url(${album.coverUrl})` }}></div>
      </div>

      {/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-end gap-6 relative z-10">
        <button 
          onClick={() => onViewChange('catalog')}
          className="absolute top-8 left-8 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="w-52 h-52 shrink-0 rounded-2xl shadow-2xl overflow-hidden mt-12 relative group">
          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Álbum</span>
          <h1 className="text-6xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{album.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span className="text-white">{album.artist}</span>
            <span>•</span>
            <span>{album.year}</span>
            <span>•</span>
            <span>{album.trackCount} canciones</span>
          </div>
        </div>
      </div>

      <div className="px-8 relative z-10 flex-1">
        {/* Actions */}
        <div className="flex items-center gap-6 py-4">
          <button 
            className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] hover:scale-105 rounded-full flex items-center justify-center text-white transition-all shadow-[0_8px_20px_rgba(168,85,247,0.3)]"
            onClick={() => {
              if (nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId)) {
                togglePlay();
              } else if (album.tracks && album.tracks.length > 0) {
                onPlayTrack(album.tracks[0], album);
              }
            }}
          >
            {isPlaying && nowPlayingTrackId && album.tracks?.find(t => t.id === nowPlayingTrackId) ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            )}
          </button>
          <button className="text-white/50 hover:text-white transition-colors">
            <Heart className="w-8 h-8" />
          </button>
          <button className="text-white/50 hover:text-white transition-colors">
            <MoreHorizontal className="w-8 h-8" />
          </button>
        </div>

        <div className="mt-8">
          {/* Header */}
          <div className="grid grid-cols-[50px_1fr_100px_120px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">
            <div className="text-center">#</div>
            <div>Título</div>
            <div className="text-right">Reproducciones</div>
            <div className="flex items-center justify-end gap-6">
               <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Tracklist */}
          <div className="flex flex-col gap-1 pb-10">
            {album.tracks?.map((track) => {
              const isPlayingTrack = nowPlayingTrackId === track.id && isPlaying;
              const isHovered = hoveredTrack === track.id;
              const downloaded = isDownloaded(track.id);
              const isDownloading = downloadingIds.includes(track.id);
              const favorited = isFavorite(track.id);

              return (
                <div 
                  key={track.id}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onClick={() => onPlayTrack(track, album)}
                  className={`grid grid-cols-[50px_1fr_100px_120px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group ${
                    nowPlayingTrackId === track.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="text-center text-white/50 font-medium">
                    {isPlayingTrack ? (
                      <div className="w-4 h-4 flex items-end justify-center gap-[2px] mx-auto">
                        <div className="w-1 h-3 bg-[#a855f7] animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 h-4 bg-[#a855f7] animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1 h-2 bg-[#a855f7] animate-[bounce_0.8s_infinite]"></div>
                      </div>
                    ) : isHovered ? (
                      <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
                    ) : (
                      <span className={nowPlayingTrackId === track.id ? 'text-[#a855f7]' : ''}>{track.trackNumber}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col pr-4">
                    <span className={`font-medium line-clamp-1 ${nowPlayingTrackId === track.id ? 'text-[#a855f7]' : 'text-white'}`}>
                      {track.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {track.previewUrl.includes('explicit') && (
                        <span className="px-1 py-0.5 rounded-sm bg-white/20 text-[10px] font-bold text-white leading-none">E</span>
                      )}
                      <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
                    </div>
                  </div>
                  
                  <div className="text-right text-white/50 text-sm">{getPlays(track.id)}</div>
                  
                  <div className="flex items-center justify-end gap-5">
                    <button 
                      onClick={(e) => handleDownload(e, track)}
                      className="text-white/40 hover:text-white transition-colors"
                      disabled={isDownloading || downloaded}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                      ) : downloaded ? (
                        <Check className="w-4 h-4 text-[#a855f7]" />
                      ) : (
                        isHovered && <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      onClick={(e) => handleFavorite(e, track)}
                      className={`transition-colors ${favorited ? 'text-[#a855f7]' : 'text-white/40 hover:text-white'}`}
                    >
                      {(isHovered || favorited) && <Heart className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />}
                    </button>
                    <div className="w-10 text-right text-white/50 text-sm">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
