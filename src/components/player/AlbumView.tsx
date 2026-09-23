import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { Album, Track } from './types';

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
  onViewChange: (v: any) => void,
  onPlayTrack: (t: Track, a: Album) => void,
  nowPlayingTrackId?: number,
  isPlaying: boolean,
  togglePlay: () => void
}) => {
  if (!album) return null;

  return (
    <div className="w-full h-full pt-32 px-12 overflow-y-auto pb-40 relative z-10 flex gap-12">
      <div className="w-[30%] max-w-[400px] shrink-0">
        <button onClick={() => onViewChange('catalog')} className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-medium mb-8 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver
        </button>
        <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] border border-white/10 relative">
          <img src={album.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/80 font-medium flex items-center gap-1.5 border border-white/10 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> {album.genre}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[900px] pt-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1.5">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               Álbum Oficial
            </span>
          </div>
          <h1 className="text-6xl font-serif italic text-white mb-4">{album.title}</h1>
          <p className="text-lg text-white/70 flex items-center gap-4">
            <span className="font-semibold text-white">{album.artist}</span>
            <span>•</span>
            <span>{album.year}</span>
            <span>•</span>
            <span>{album.trackCount} pistas</span>
          </p>
        </div>

        <div className="flex items-center gap-4 mb-12">
          {album.tracks && album.tracks.length > 0 && (
            <button 
              onClick={() => onPlayTrack(album.tracks![0], album)}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            >
              <Play fill="currentColor" className="w-5 h-5" /> Reproducir Todo
            </button>
          )}
        </div>

        {/* Tracklist Table */}
        <div className="w-full">
           <div className="grid grid-cols-[50px_1fr_100px_100px] gap-4 px-4 py-3 text-xs font-medium text-white/40 tracking-widest uppercase border-b border-white/5 mb-2">
             <div>#</div>
             <div>Título</div>
             <div className="text-right">Calidad</div>
             <div className="text-right">Duración</div>
           </div>
           
           {loading ? (
             <div className="py-8 text-center text-white/50">Cargando pistas...</div>
           ) : (
             album.tracks?.map((track) => {
               const isThisTrackPlaying = nowPlayingTrackId === track.id;
               const durationSecs = track.duration ? Math.floor(track.duration / 1000) : 0;
               const mins = Math.floor(durationSecs / 60);
               const secs = durationSecs % 60;
               const formattedDuration = track.duration ? `${mins}:${secs.toString().padStart(2, '0')}` : "--:--";

               return (
                 <div 
                   key={track.id}
                   onClick={() => isThisTrackPlaying ? togglePlay() : onPlayTrack(track, album)}
                   className={`grid grid-cols-[50px_1fr_100px_100px] gap-4 px-4 py-4 items-center rounded-xl transition-colors group cursor-pointer border border-transparent ${
                     isThisTrackPlaying ? 'bg-white/[0.05] border-[#a855f7]/30' : 'hover:bg-white/5 hover:border-white/5'
                   }`}
                 >
                   <div className="text-white/50 text-sm font-medium group-hover:text-white flex items-center">
                     {isThisTrackPlaying && isPlaying ? (
                       <svg className="w-4 h-4 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                     ) : (
                       track.trackNumber.toString().padStart(2, '0')
                     )}
                   </div>
                   <div>
                     <h4 className={`font-medium mb-0.5 ${isThisTrackPlaying ? 'text-[#a855f7]' : 'text-white'}`}>{track.title}</h4>
                     <p className="text-white/50 text-xs">{track.artist}</p>
                   </div>
                   <div className="text-right text-xs text-white/40">Lossless</div>
                   <div className="text-right text-sm text-white/60 tabular-nums">{formattedDuration}</div>
                 </div>
               )
             })
           )}
        </div>
      </div>
    </div>
  );
};
