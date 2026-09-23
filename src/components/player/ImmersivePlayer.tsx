import React from 'react';
import type { Album, Track } from "./types";
import { Play, Pause, X } from 'lucide-react';

export const ImmersivePlayer = ({ 
  isExpanded,
  onClose,
  track,
  album,
  isPlaying,
  togglePlay,
  onPlayTrack,
  volume,
  setVolume,
  progress
}: { 
  isExpanded: boolean,
  onClose: () => void,
  track: Track | null,
  album: Album | null,
  isPlaying: boolean,
  togglePlay: () => void,
  onPlayTrack?: (t: Track, a: Album) => void,
  volume?: number,
  setVolume?: (v: number) => void,
  progress?: number
}) => {
  if (!track || !album) return null;

  return (
    <>
      {/* Backdrop (oscurece el resto de la página al abrir el modal) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-[#05050A]/80 backdrop-blur-md z-30 transition-opacity duration-500 ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal Container */}
      <div 
        className={`fixed z-30 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] top-24 bottom-[120px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/5 bg-[#111111]/80 ${
          isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[20%] opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Fondo difuminado (Portada del álbum) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={album.coverUrl} className="w-full h-full object-cover scale-125 opacity-20 blur-[60px]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05050A]/90" />
        </div>

        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido (Listado de Canciones) */}
        <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-10 overflow-hidden">
          
          {/* Cabecera del Modal */}
          <div className="flex items-end gap-6 mb-8 shrink-0">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.2)] border border-white/10">
              <img src={album.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            </div>
            <div className="pb-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/70 mb-3 inline-block font-medium">
                Reproductor Integrado
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-2">{album.title}</h2>
              <p className="text-white/60 text-base font-medium">{album.artist}</p>
            </div>
          </div>

          {/* Lista de Canciones Scrollable */}
          <div className="flex-1 overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            <div className="grid grid-cols-[50px_1fr_100px_100px] gap-4 px-4 py-3 text-xs font-medium text-white/40 tracking-widest uppercase border-b border-white/5 mb-2 sticky top-0 bg-[#05050A]/40 backdrop-blur-xl z-10">
               <div>#</div>
               <div>Título</div>
               <div className="text-right">Calidad</div>
               <div className="text-right">Duración</div>
             </div>

             {album.tracks?.map((t) => {
               const isThisTrackPlaying = track.id === t.id;
               const durationSecs = t.duration ? Math.floor(t.duration / 1000) : 0;
               const mins = Math.floor(durationSecs / 60);
               const secs = durationSecs % 60;
               const formattedDuration = t.duration ? `${mins}:${secs.toString().padStart(2, '0')}` : "--:--";

               return (
                 <div 
                   key={t.id}
                   onClick={() => {
                     if (isThisTrackPlaying) {
                       togglePlay();
                     } else if (onPlayTrack) {
                       onPlayTrack(t, album);
                     }
                   }}
                   className={`grid grid-cols-[50px_1fr_100px_100px] gap-4 px-4 py-3.5 items-center rounded-xl transition-colors group cursor-pointer border border-transparent ${
                     isThisTrackPlaying ? 'bg-white/[0.08] border-[#a855f7]/40' : 'hover:bg-white/5 hover:border-white/5'
                   }`}
                 >
                   <div className="text-white/50 text-sm font-medium group-hover:text-white flex items-center">
                     {isThisTrackPlaying && isPlaying ? (
                       <svg className="w-4 h-4 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                     ) : (
                       t.trackNumber.toString().padStart(2, '0')
                     )}
                   </div>
                   <div>
                     <h4 className={`font-medium mb-0.5 line-clamp-1 ${isThisTrackPlaying ? 'text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-white'}`}>{t.title}</h4>
                     <p className="text-white/50 text-xs line-clamp-1">{t.artist}</p>
                   </div>
                   <div className="text-right text-xs text-white/40">Lossless</div>
                   <div className="text-right text-sm text-white/60 tabular-nums">{formattedDuration}</div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </>
  );
};
