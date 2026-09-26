import React, { useState } from 'react';
import { DownloadCloud, Play, Heart, Clock } from 'lucide-react';
import { useDownloads } from './DownloadsContext';

export const DownloadsView = () => {
  const { downloadedTracks } = useDownloads();
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (downloadedTracks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative z-10 px-8 text-center pt-24">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <DownloadCloud className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No has descargado nada aún</h2>
        <p className="text-white/50 max-w-md">
          Las canciones que descargues aparecerán aquí para que puedas escucharlas sin conexión a internet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Hero Section */}
      <div className="px-8 pt-16 pb-6 flex items-end gap-6 relative z-10 border-b border-white/5">
        <div className="w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] shadow-2xl flex items-center justify-center">
          <DownloadCloud className="w-16 h-16 text-white" />
        </div>
        
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-white/70 text-sm font-semibold tracking-widest uppercase">Playlist</span>
          <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Mis descargas</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 font-medium">
            <span>{downloadedTracks.length} canciones descargadas</span>
          </div>
        </div>
      </div>

      <div className="px-8 relative z-10 flex-1 pt-6">
        {/* Header */}
        <div className="grid grid-cols-[50px_1fr_100px] gap-4 px-4 py-2 text-white/50 text-sm font-medium border-b border-white/5 mb-4">
          <div className="text-center">#</div>
          <div>Título</div>
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
        </div>

        {/* Tracklist */}
        <div className="flex flex-col gap-1 pb-10">
          {downloadedTracks.map((track, index) => {
            const isHovered = hoveredTrack === track.id;
            return (
              <div 
                key={track.id}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                className="grid grid-cols-[50px_1fr_100px] gap-4 px-4 py-3 items-center rounded-xl cursor-pointer group hover:bg-white/5"
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
                  {isHovered && <Heart className="w-4 h-4 text-white/40 hover:text-white transition-colors" />}
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
  );
};
