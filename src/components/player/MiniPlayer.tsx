import React, { useEffect, useId, useRef } from 'react';
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat1, Heart, HeartOff, Mic2 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import { usePlayback } from './PlaybackContext';
import type { Album, Track } from './types';


// Squiggly seek line: sine wave that tapers flat at both ends, drifts toward the handle
// while playing and eases into a straight line when paused.
export const WavyProgress = ({ progress, isPlaying }: { progress: number; isPlaying: boolean }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const state = useRef({ phase: 0, amp: isPlaying ? 1 : 0, hoverAmp: 0, progress, isPlaying });
  state.current.progress = progress;
  state.current.isPlaying = isPlaying;
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    const WAVELENGTH = 34;
    const BASE_AMPLITUDE = 2.2;
    const HOVER_AMPLITUDE = 3.6;
    const TAPER = 24;

    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const st = state.current;
      const target = st.isPlaying && !reduce ? 1 : 0;
      st.amp += (target - st.amp) * Math.min(1, dt / 220);

      // Smoothly expand curves when hovering over seek bar
      const isHovered = Boolean(svgRef.current?.closest('.group')?.matches(':hover'));
      st.hoverAmp += ((isHovered ? 1 : 0) - st.hoverAmp) * Math.min(1, dt / 140);

      if (!reduce) st.phase += dt * 0.0036;
      const width = (svgRef.current?.clientWidth ?? 0) * st.progress;
      const MID = (svgRef.current?.clientHeight ?? 24) / 2;
      const effectiveAmp = (BASE_AMPLITUDE + (HOVER_AMPLITUDE - BASE_AMPLITUDE) * st.hoverAmp) * st.amp;

      let d = `M0 ${MID}`;
      for (let x = 0; x <= width; x += 2) {
        const taper = Math.min(1, x / TAPER, (width - x) / TAPER);
        const y = MID + Math.sin((x / WAVELENGTH) * Math.PI * 2 - st.phase) * effectiveAmp * Math.max(0, taper);
        d += ` L${x.toFixed(1)} ${y.toFixed(2)}`;
      }
      pathRef.current?.setAttribute('d', d);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
      <defs>
        {/* Soft feathering / fade at the start (difuminado al inicio) */}
        <linearGradient id={`wave-fade-${gradientId}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="36" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="35%" stopColor="white" stopOpacity="0.55" />
          <stop offset="70%" stopColor="white" stopOpacity="0.88" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        fill="none"
        stroke={`url(#wave-fade-${gradientId})`}
        className="transition-[stroke-width,filter] duration-200 stroke-[3.5px] md:stroke-[4px] group-hover:stroke-[5.5px] md:group-hover:stroke-[6px] drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.75)]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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
  const originAlbum = usePlayback().nowPlayingOrigin;

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



  return (
    <>
    {/* Phone: compact bar. Tapping it opens the full-screen player; buttons keep their own action. */}
    <div className="md:hidden relative w-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#FF9FFC]" style={{ width: `${progress * 100}%` }} />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={(e) => { if (e.key === 'Enter') onExpand(); }}
        aria-label={`Abrir reproductor: ${track.title}, ${track.artist}`}
        className="flex items-center gap-3 pl-3 pr-1 h-16 cursor-pointer active:bg-white/[0.04]"
      >
        <img src={(track.albumCover || album.coverUrl)} alt="" className="w-11 h-11 rounded-md object-cover shrink-0 shadow-md" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[14px] font-semibold leading-tight truncate flex items-center gap-1">
            {isLicensed(track.id) && <Star className="w-3 h-3 text-yellow-500 shrink-0" fill="currentColor" />}
            <span className="truncate">{track.title}</span>
          </p>
          <p className="text-white/60 text-[12px] leading-tight truncate mt-0.5">{track.artist}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track, album); }}
          aria-label={isFavorite(track.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={`w-11 h-11 flex items-center justify-center shrink-0 ${isFavorite(track.id) ? 'text-[#a855f7]' : 'text-white/60'}`}
        >
          <Heart className="w-5 h-5" fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          className="w-11 h-11 flex items-center justify-center shrink-0"
        >
          <span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center">
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Siguiente canción"
          className="w-11 h-11 flex items-center justify-center shrink-0 text-white/80"
        >
          <SkipForward className="w-5 h-5" fill="currentColor" />
        </button>
      </div>
    </div>

    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const control = target.closest('button, a, input, [role="button"], [role="slider"], .cursor-pointer');
        if (!control || control === e.currentTarget) onExpand();
      }}
      className="w-full h-[80px] bg-transparent shrink-0 hidden md:flex items-center justify-between px-6 relative group/player rounded-none cursor-pointer"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none opacity-30"></div>

      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-150" style={{ backgroundImage: `url(${(track.albumCover || album.coverUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', maskImage: 'linear-gradient(to right, black 5%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to right, black 5%, transparent 70%)' }} />
      </div>
      {/* Seek bar on the top edge (YouTube Music style) */}
          <div className="absolute left-0 right-0 top-0 -translate-y-1/2 h-6 z-20 group flex items-center cursor-pointer">
            {/* Unplayed straight line */}
            <div className="absolute right-0 h-[4px] group-hover:h-[6px] bg-white/30 group-hover:bg-white/45 rounded-full pointer-events-none transition-all duration-200" style={{ left: `${progress * 100}%` }} />

            {/* Played part: live squiggle (Android 13 / YT Music style) */}
            <WavyProgress progress={progress} isPlaying={isPlaying} />

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
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px] relative z-10">
        <div
          role="button"
          tabIndex={0}
          onClick={onExpand}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onExpand()}
          data-cover-source="mini"
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
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className="text-white font-semibold text-sm line-clamp-1 hover:underline cursor-pointer flex items-center gap-1.5"
            title="Abrir reproductor"
          >
            {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" aria-hidden="true" />}
            <span className="truncate">{track.title}</span>
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/60 min-w-0">
            <span
              onClick={(e) => { e.stopPropagation(); onSelectArtist && onSelectArtist(); }}
              className="truncate hover:underline hover:text-white/90 cursor-pointer"
              title={`Artista: ${track.artist}`}
            >
              {track.artist}
            </span>
            {originAlbum && (
              <>
                <span className="text-white/30" aria-hidden="true">•</span>
                <span
                  onClick={(e) => { e.stopPropagation(); onSelectAlbum && onSelectAlbum(); }}
                  className="truncate hover:underline hover:text-white/90 cursor-pointer"
                  title={`Álbum: ${originAlbum.title}`}
                >
                  {originAlbum.title}{originAlbum.year ? ` (${originAlbum.year})` : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center flex-1 max-w-[600px] relative z-10">
        <div className="flex items-center gap-6">
          <button
            className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"}`}
            onClick={onToggleShuffle}
            title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-pressed={isShuffle}
          >
            <Shuffle className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
          <button
            className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
            onClick={onPrev}
            title="Canción anterior (←)"
            aria-label="Canción anterior"
          >
            <SkipBack className="w-6 h-6" fill="currentColor" aria-hidden="true" />
          </button>
          <button
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-white bg-[radial-gradient(120%_120%_at_25%_20%,rgba(168,85,247,0.55)_0%,rgba(88,28,135,0.35)_55%,rgba(18,8,28,0.45)_100%)] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_20px_rgba(168,85,247,0.22)] hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 cursor-pointer"
            onClick={togglePlay}
            title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            aria-label={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" aria-hidden="true" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" aria-hidden="true" />}
          </button>
          <button
            className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
            onClick={onNext}
            title="Siguiente canción (→)"
            aria-label="Siguiente canción"
          >
            <SkipForward className="w-6 h-6" fill="currentColor" aria-hidden="true" />
          </button>
          <button
            className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"}`}
            onClick={onToggleRepeat}
            title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
            aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'repetir una canción' : repeatMode === 'all' ? 'repetir todo' : 'desactivado'}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-[18px] h-[18px]" aria-hidden="true" /> : <Repeat className="w-[18px] h-[18px]" aria-hidden="true" />}
          </button>
          <button
            className={`group/favbtn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isFavorite(track.id) ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'}`}
            onClick={() => toggleFavorite(track, album)}
            title={isFavorite(track.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-label={isFavorite(track.id) ? `Quitar ${track.title} de favoritos` : `Añadir ${track.title} a favoritos`}
          >
            {isFavorite(track.id) ? (
              <>
                <Heart className="w-[18px] h-[18px] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                <HeartOff className="w-[18px] h-[18px] hidden group-hover/favbtn:block" aria-hidden="true" />
              </>
            ) : (
              <Heart className="w-[18px] h-[18px]" fill="none" aria-hidden="true" />
            )}
          </button>
        </div>

      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px] relative z-10">
        <span className="text-xs font-medium text-white/50 tabular-nums whitespace-nowrap mr-1">{formatTime(currentSecs)} / {formatTime(durationSecs)}</span>
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
    </>
  );
};
