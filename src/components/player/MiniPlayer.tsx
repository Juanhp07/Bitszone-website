import React from 'react';
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat1, Heart, HeartOff, Mic2 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import type { Album, Track } from './types';

export const MiniPlayer = ({ 
  track,
  album,
  isPlaying,
  togglePlay,
  progress,
  volume,
  onExpand,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSelectAlbum,
  onSelectArtist,
  isLyricsOpen,
  onToggleLyrics,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat
}: { 
  track: Track,
  album: Album,
  isPlaying: boolean,
  togglePlay: () => void,
  progress: number,
  volume: number,
  onExpand: () => void,
  onNext: () => void,
  onPrev: () => void,
  onSeek?: (progress: number) => void,
  onVolumeChange?: (volume: number) => void,
  onToggleMute?: () => void,
  onSelectAlbum?: () => void,
  onSelectArtist?: () => void,
  isLyricsOpen?: boolean,
  onToggleLyrics?: () => void,
  isShuffle?: boolean,
  repeatMode?: "off" | "all" | "one",
  onToggleShuffle?: () => void,
  onToggleRepeat?: () => void
}) => {
  const { isFavorite, toggleFavorite, isLicensed } = useDownloads();
  
  React.useEffect(() => {
    const handleToggleFavorite = () => {
      if (track) toggleFavorite(track, album);
    };
    window.addEventListener('toggle-favorite-current', handleToggleFavorite);
    return () => window.removeEventListener('toggle-favorite-current', handleToggleFavorite);
  }, [track, album, toggleFavorite]);

  const durationSecs = Math.floor((track.duration || 0) / 1000);
  const currentSecs = Math.floor(durationSecs * progress);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  const waveSvg = "data:image/svg+xml,%3Csvg width='80' height='20' viewBox='0 0 80 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10C13 2 27 18 40 10C53 2 67 18 80 10' stroke='%23ffffff' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E";

  return (
    <div className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none">
      <style>{`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -80px; }
        }
        .animate-wave-slide {
          animation: wave-slide 1s linear infinite;
        }
      `}</style>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none opacity-30"></div>
      
      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-150" style={{ backgroundImage: `url(${(track.albumCover || album.coverUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', maskImage: 'linear-gradient(to right, black 5%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to right, black 5%, transparent 70%)' }} />
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px] relative z-10">
        <div 
          role="button"
          tabIndex={0}
          onClick={onExpand}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onExpand()}
          className="w-14 h-14 rounded-md overflow-hidden bg-white/10 cursor-pointer relative group shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Expandir reproductor a pantalla completa (F)"
          aria-label="Expandir reproductor a pantalla completa"
        >
          <img src={(track.albumCover || album.coverUrl)} alt="Cover" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h4 
            onClick={(e) => { e.stopPropagation(); onSelectAlbum && onSelectAlbum(); }} 
            className="text-white font-semibold text-sm line-clamp-1 hover:underline cursor-pointer flex items-center gap-1.5"
            title={`Álbum: ${album.title || track.title}`}
          >
            {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" aria-hidden="true" />}
            <span className="truncate">{track.title}</span>
          </h4>
          <span 
            onClick={(e) => { e.stopPropagation(); onSelectArtist && onSelectArtist(); }} 
            className="text-white/60 text-xs mt-0.5 line-clamp-1 hover:underline cursor-pointer"
            title={`Artista: ${track.artist}`}
          >
            {track.artist}
          </span>
        </div>
        <button 
          className={`group/favbtn ml-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-1.5 cursor-pointer ${isFavorite(track.id) ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}`}
          onClick={() => toggleFavorite(track, album)}
          title={isFavorite(track.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
          aria-label={isFavorite(track.id) ? `Quitar ${track.title} de favoritos` : `Añadir ${track.title} a favoritos`}
        >
          {isFavorite(track.id) ? (
            <>
              <Heart className="w-5 h-5 block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
              <HeartOff className="w-5 h-5 hidden group-hover/favbtn:block" aria-hidden="true" />
            </>
          ) : (
            <Heart className="w-5 h-5" fill="none" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px] relative z-10">
        <div className="flex items-center gap-6">
          <button 
            className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"}`}
            onClick={onToggleShuffle}
            title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-pressed={isShuffle}
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
          </button>
          <button 
            className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer" 
            onClick={onPrev}
            title="Canción anterior (←)"
            aria-label="Canción anterior"
          >
            <SkipBack className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </button>
          <button 
            className="w-10 h-10 bg-white hover:scale-105 rounded-full flex items-center justify-center text-black transition-transform shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer" 
            onClick={togglePlay}
            title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            aria-label={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" aria-hidden="true" /> : <Play className="w-4 h-4 ml-1" fill="currentColor" aria-hidden="true" />}
          </button>
          <button 
            className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer" 
            onClick={onNext}
            title="Siguiente canción (→)"
            aria-label="Siguiente canción"
          >
            <SkipForward className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </button>
          <button 
            className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"}`}
            onClick={onToggleRepeat}
            title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
            aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'repetir una canción' : repeatMode === 'all' ? 'repetir todo' : 'desactivado'}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" aria-hidden="true" /> : <Repeat className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-medium text-white/50 tabular-nums w-10 text-right">{formatTime(currentSecs)}</span>
          <div className="flex-1 h-6 relative group flex items-center cursor-pointer">
            {/* Unplayed straight line */}
            <div className="absolute right-0 h-[4px] bg-white/30 rounded-full pointer-events-none" style={{ left: `${progress * 100}%` }} />
            
            {/* Played wavy line clipping container */}
            <div className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none" style={{ width: `${progress * 100}%` }}>
               <div 
                 className={`absolute left-0 top-0 bottom-0 w-[200vw] ${isPlaying ? 'animate-wave-slide' : ''}`}
                 style={{
                   backgroundImage: `url("${waveSvg}")`,
                   backgroundRepeat: 'repeat-x',
                   backgroundPosition: 'left center',
                   backgroundSize: '80px 20px',
                   maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)',
                   WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black 100%)'
                 }}
               />
            </div>
            
            {/* The Dot (Handle) */}
            <div 
               className="absolute w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
               style={{ left: `${progress * 100}%` }}
            />
            
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001" 
              value={progress}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10 focus-visible:outline-none"
              title={`Progreso: ${formatTime(currentSecs)} de ${formatTime(durationSecs)}`}
              aria-label="Barra de progreso de la canción"
            />
          </div>
          <span className="text-[11px] font-medium text-white/50 tabular-nums w-10">{formatTime(durationSecs)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px] relative z-10">
        <button 
          onClick={onToggleLyrics}
          className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isLyricsOpen ? 'text-[#a855f7]' : 'text-white/50 hover:text-white'}`}
          title={isLyricsOpen ? "Ocultar panel de letras" : "Mostrar panel de letras"}
          aria-label={isLyricsOpen ? "Ocultar letras de la canción" : "Mostrar letras de la canción"}
          aria-pressed={isLyricsOpen}
        >
          <Mic2 className="w-4 h-4" aria-hidden="true" />
        </button>
        <button 
          onClick={onToggleMute} 
          className="text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
          title={volume === 0 ? "Activar sonido" : "Silenciar"}
          aria-label={volume === 0 ? "Activar sonido" : "Silenciar reproductor"}
          aria-pressed={volume === 0}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : volume < 50 ? <Volume1 className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
        </button>
        <div className="w-24 h-1.5 bg-white/10 rounded-full relative group cursor-pointer flex items-center">
          <div className="absolute left-0 h-full bg-white group-hover:bg-[#a855f7] rounded-full transition-colors pointer-events-none" style={{ width: `${volume}%` }}></div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume}
            onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10 focus-visible:outline-none"
            title={`Volumen: ${Math.round(volume)}%`}
            aria-label="Control de volumen"
          />
        </div>
      </div>
    </div>
  );
};
