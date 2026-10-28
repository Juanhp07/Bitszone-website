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
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const stop1Ref = useRef<SVGStopElement>(null);
  const stop2Ref = useRef<SVGStopElement>(null);
  const stop3Ref = useRef<SVGStopElement>(null);
  const state = useRef({ phase: 0, amp: isPlaying ? 1 : 0, hoverAmp: 0, smoothProgress: progress, progress, isPlaying });
  state.current.progress = progress;
  state.current.isPlaying = isPlaying;
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    const WAVELENGTH = 34;
    const BASE_AMPLITUDE = 3.2;
    const HOVER_AMPLITUDE = 3.8;
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

      // Ultra-fluid progress lerp to eliminate discrete jumps
      if (st.smoothProgress === undefined || Math.abs(st.progress - st.smoothProgress) > 0.05) {
        st.smoothProgress = st.progress;
      } else if (st.isPlaying && !reduce) {
        st.smoothProgress += (st.progress - st.smoothProgress) * Math.min(1, dt * 0.02);
      } else {
        st.smoothProgress = st.progress;
      }

      const width = (svgRef.current?.clientWidth ?? 0) * st.smoothProgress;
      const MID = (svgRef.current?.clientHeight ?? 24) / 2;
      const effectiveAmp = (BASE_AMPLITUDE + (HOVER_AMPLITUDE - BASE_AMPLITUDE) * st.hoverAmp) * st.amp;

      // Update dual fade gradient (difuminado al inicio Y al final de la onda)
      if (gradRef.current && stop1Ref.current && stop2Ref.current && stop3Ref.current) {
        gradRef.current.setAttribute('x2', Math.max(1, width).toFixed(1));
        const startPx = Math.min(width * 0.35, 32);
        const endPx = Math.max(startPx, width - 28);
        stop1Ref.current.setAttribute('offset', `${startPx.toFixed(1)}px`);
        stop2Ref.current.setAttribute('offset', `${endPx.toFixed(1)}px`);
        stop3Ref.current.setAttribute('offset', `${width.toFixed(1)}px`);
      }

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
        {/* Difuminado suave tanto al inicio como al final de la animación de ondas */}
        <linearGradient ref={gradRef} id={`wave-fade-${gradientId}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop ref={stop1Ref} offset="32px" stopColor="white" stopOpacity="1" />
          <stop ref={stop2Ref} offset="70px" stopColor="white" stopOpacity="1" />
          <stop ref={stop3Ref} offset="100px" stopColor="white" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        fill="none"
        stroke={`url(#wave-fade-${gradientId})`}
        className="transition-[stroke-width,filter] duration-200 stroke-[5px] md:stroke-[5.5px] group-hover:stroke-[6px] md:group-hover:stroke-[6.5px] drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.85)]"
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
            <div className="absolute right-0 h-[6px] group-hover:h-[7px] bg-white/30 group-hover:bg-white/45 rounded-full pointer-events-none transition-all duration-200" style={{ left: `${progress * 100}%` }} />

            {/* Played part: live squiggle (Android 13 / YT Music style) */}
            <WavyProgress progress={progress} isPlaying={isPlaying} />

            {/* The Dot (Handle) */}
            <div
               className="absolute w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-[transform,left] duration-75 ease-linear"
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
            className="text-white font-semibold text-[15px] line-clamp-1 hover:underline cursor-pointer flex items-center gap-1.5"
            title="Abrir reproductor"
          >
            {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" aria-hidden="true" />}
            <span className="truncate">{track.title}</span>
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-white/65 min-w-0">
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
                  {originAlbum.title}
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
          {/* Botón de reproducción estilo vinilo giratorio y cristal esmerilado (igual al reproductor gigante) */}
          <button
            className="w-[50px] h-[50px] md:w-13 md:h-13 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.18)] hover:shadow-[0_0_28px_rgba(255,255,255,0.35)] group/vplay relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
            onClick={togglePlay}
            title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            aria-label={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
            aria-pressed={isPlaying}
          >
            {/* Spinning Vinyl Cover */}
            <div
              className="absolute inset-0 w-full h-full rounded-full animate-spin"
              style={{ animationDuration: '12s', animationPlayState: isPlaying ? 'running' : 'paused' }}
            >
              <img src={(track.albumCover || album.coverUrl)} className="w-full h-full object-cover scale-110" alt="" />
            </div>

            {/* Frosted Glass Overlay */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition-colors group-hover/vplay:bg-white/30" />

            {/* Vinyl Grooves Details */}
            <div className="absolute inset-0.5 rounded-full border border-white/30 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-1.5 rounded-full border border-white/20 mix-blend-overlay pointer-events-none" />

            {/* Vinyl Center Label */}
            <div className="absolute w-4.5 h-4.5 rounded-full bg-black/40 backdrop-blur-xl border border-black/10 shadow-[0_0_10px_4px_rgba(0,0,0,0.35)] pointer-events-none" />
            <div className="absolute w-1 h-1 rounded-full bg-white/10 shadow-inner pointer-events-none" />

            {/* Play/Pause Icon */}
            {isPlaying ? (
              <Pause className="w-5 h-5 relative z-10 group-hover/vplay:scale-95 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 relative z-10 group-hover/vplay:scale-105 transition-transform drop-shadow-md" fill="currentColor" aria-hidden="true" />
            )}
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
      <div className="flex items-center justify-end gap-3.5 w-[30%] min-w-[220px] relative z-10">
        <span className="text-sm font-medium text-white/60 tabular-nums whitespace-nowrap mr-1">{formatTime(currentSecs)} / {formatTime(durationSecs)}</span>
        <button
          onClick={onToggleLyrics}
          className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer ${isLyricsOpen ? 'text-[#a855f7]' : 'text-white/60 hover:text-white'}`}
          title={isLyricsOpen ? "Ocultar panel de letras" : "Mostrar panel de letras"}
          aria-label={isLyricsOpen ? "Ocultar letras de la canción" : "Mostrar letras de la canción"}
          aria-pressed={isLyricsOpen}
        >
          <Mic2 className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={onToggleMute}
          className="text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-2 cursor-pointer"
          title={volume === 0 ? "Activar sonido" : "Silenciar"}
          aria-label={volume === 0 ? "Activar sonido" : "Silenciar reproductor"}
          aria-pressed={volume === 0}
        >
          {volume === 0 ? <VolumeX className="w-5 h-5" aria-hidden="true" /> : volume < 50 ? <Volume1 className="w-5 h-5" aria-hidden="true" /> : <Volume2 className="w-5 h-5" aria-hidden="true" />}
        </button>
        <div className="w-28 h-2 bg-white/15 rounded-full relative group cursor-pointer flex items-center">
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
