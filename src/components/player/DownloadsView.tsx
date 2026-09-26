import React, { useState } from 'react';
import { DownloadCloud, Play, Heart, Clock, X, Trash2 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import type { Track, Album } from './types';

export const DownloadsView = ({ 
  type = 'downloads', 
  title = "Mis descargas", 
  icon: Icon = DownloadCloud,
  onPlayTrack
}: { 
  type?: 'downloads' | 'favorites', 
  title?: string, 
  icon?: any,
  onPlayTrack?: (t: Track, a: Album) => void 
}) => {
  const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite } = useDownloads();
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  const tracks = type === 'downloads' ? downloadedTracks : favoriteTracks;

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRemove = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (type === 'downloads') {
      removeDownload(track.id);
    } else {
      toggleFavorite(track);
    }
  };

  const handlePlay = (track: Track) => {
    if (onPlayTrack) {
      // Mock an album to satisfy the player interface
      const dummyAlbum: Album = {
        id: 'playlist',
        title: title,
        artist: 'Varios Artistas',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',
        year: '2026',
        genre: 'Playlist',
        trackCount: tracks.length,
        tracks: tracks
      };
      onPlayTrack(track, dummyAlbum);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative z-10 px-8 text-center pt-24">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Tu lista está vacía</h2>
        <p className="text-white/50 max-w-md">
          {type === 'downloads' 
            ? 'Las canciones que descargues aparecerán aquí para que puedas escucharlas sin conexión a internet.'
            : 'Las canciones a las que les des "Me gusta" aparecerán aquí.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Hero Section */}
      <div className="px-8 pt-16 pb-6 flex items-end gap-6 relative z-10 border-b border-white/5">
        <div className={`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center ${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}`}>
          <Icon className="w-16 h-16 text-white" />
        </div>
        
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Playlist</span>
          <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{tracks.length} canciones</span>
          </div>
        </div>
      </div>

      <div className="px-8 relative z-10 flex-1 pt-6 overflow-y-auto pb-32">
        {/* Header */}
        <div className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">
          <div className="text-center">#</div>
          <div>Título</div>
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
          <div></div>
        </div>

        {/* Tracklist */}
        <div className="flex flex-col gap-1 pb-10">
          {tracks.map((track, index) => {
            const isHovered = hoveredTrack === track.id;
            return (
              <div 
                key={track.id}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() => handlePlay(track)}
                className="grid grid-cols-[50px_1fr_100px_40px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"
              >
                <div className="text-center text-white/50 font-medium">
                  {isHovered ? (
                    <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <div className="flex flex-col pr-4">
                  <span className="font-medium line-clamp-1 text-white">
                    {track.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-4">
                  <div className="w-10 text-right text-white/50 text-sm">
                    {formatDuration(track.duration)}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {isHovered && (
                    <button 
                      onClick={(e) => handleRemove(e, track)}
                      className="text-white/40 hover:text-red-400 transition-colors p-2"
                      title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
                    >
                      {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
