import React, { useEffect, useRef } from 'react';
import { PopSwap } from '../ui/PopSwap';
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat1, Heart, HeartOff, Mic2 } from 'lucide-react';
import { useDownloads } from './DownloadsContext';
import { usePlayback } from './PlaybackContext';
import type { Album, Track } from './types';


// Squiggly seek line: sine wave that tapers flat at both ends, drifts toward the handle
// while playing and eases into a straight line when paused.
// Unifies played curves and unplayed straight track in the exact same SVG to guarantee
// a single continuous line without gaps, divisions, or overlapping artifacts.
export const WavyProgress = ({ progress, isPlaying }: { progress: number; isPlaying: boolean }) => {
  const playedPathRef = useRef<SVGPathElement>(null);
  const unplayedPathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const state = useRef({ phase: 0, amp: isPlaying ? 1 : 0, hoverAmp: 0, grab: 0, held: false, progress, isPlaying });
  state.current.progress = progress;
  state.current.isPlaying = isPlaying;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    // held = pointer down on the bar (the parent is the seek area)
    const area = svgRef.current?.parentElement;
    const hold = () => { state.current.held = true; };
    const letGo = () => { state.current.held = false; };
    area?.addEventListener('pointerdown', hold);
    window.addEventListener('pointerup', letGo);
    window.addEventListener('pointercancel', letGo);
    const WAVELENGTH = 34;
    const BASE_AMPLITUDE = 3.2;
    const HOVER_AMPLITUDE = 4.0;
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
      st.grab += ((st.held ? 1 : 0) - st.grab) * Math.min(1, dt / 110);

      if (!reduce) st.phase += dt * 0.0036;

      const totalWidth = svgRef.current?.clientWidth ?? 0;
      const width = Math.max(0, Math.min(totalWidth, totalWidth * st.progress));
      const MID = (svgRef.current?.clientHeight ?? 24) / 2;
      const effectiveAmp = (BASE_AMPLITUDE + (HOVER_AMPLITUDE - BASE_AMPLITUDE) * st.hoverAmp) * Math.max(st.amp, st.grab * 0.6) * (1 + 0.5 * st.grab);

      // 1. Played wavy path (0 -> width): pure white sine wave
      let dPlayed = `M0 ${MID}`;
      if (width > 0) {
        for (let x = 0; x <= width; x += 2) {
          const taper = Math.min(1, x / TAPER, (width - x) / TAPER);
          const y = MID + Math.sin((x / WAVELENGTH) * Math.PI * 2 - st.phase) * effectiveAmp * Math.max(0, taper);
          dPlayed += ` L${x.toFixed(1)} ${y.toFixed(2)}`;
        }
        dPlayed += ` L${width.toFixed(1)} ${MID}`;
      }
      playedPathRef.current?.setAttribute('d', dPlayed);

      // 2. Unplayed straight path (width -> totalWidth):
      // Starts EXACTLY at (width, MID) where the curves end, so it is impossible
      // for the straight line to be visible behind the curves or to have a division gap!
      if (width < totalWidth) {
        const dUnplayed = `M${width.toFixed(1)} ${MID} L${totalWidth.toFixed(1)} ${MID}`;
        unplayedPathRef.current?.setAttribute('d', dUnplayed);
      } else {
        unplayedPathRef.current?.setAttribute('d', '');
      }

      // 3. Handle dot centered at the exact joint (width, MID)
      if (circleRef.current) {
        circleRef.current.setAttribute('cx', width.toFixed(1));
        circleRef.current.setAttribute('cy', MID.toString());
        circleRef.current.setAttribute('r', (6 + 3.5 * st.grab).toFixed(2));
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      area?.removeEventListener('pointerdown', hold);
      window.removeEventListener('pointerup', letGo);
      window.removeEventListener('pointercancel', letGo);
    };
  }, []);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
      {/* Línea recta unplayed: comienza exactamente donde termina la onda */}
      <path
        ref={unplayedPathRef}
        fill="none"
        stroke="rgba(255, 255, 255, 0.28)"
        className="transition-[stroke-width,stroke] duration-200 stroke-[5px] md:stroke-[5.5px] group-hover:stroke-[6.5px] md:group-hover:stroke-[7px] group-hover:stroke-white/45"
        strokeLinecap="round"
      />
      {/* Ondas reproducidas: blanco puro brillante con resplandor */}
      <path
        ref={playedPathRef}
        fill="none"
        stroke="white"
        className="transition-[stroke-width] duration-200 stroke-[5px] md:stroke-[5.5px] group-hover:stroke-[6.5px] md:group-hover:stroke-[7px] drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.95)]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Círculo indicador perfectamente unido al punto de transición */}
      <circle
        ref={circleRef}
        r="6"
        fill="white"
        className="transition-[r] duration-150 group-hover:r-[8] drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
      />
    </svg>
  );
};

export const MiniPlayer = ({
  track,
  album,
  isPlaying,
  isLoading = false,
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
  /** the song was chosen but its audio is still loading (or stalled waiting for data) */
  isLoading?: boolean,
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

  // Fluid scrubbing for MiniPlayer top bar
  const [scrubProgress, setScrubProgress] = React.useState<number | null>(null);
  const [volHeld, setVolHeld] = React.useState(false);
  const isScrubbingRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isScrubbingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(p);
    onSeek?.(p);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(p);
    onSeek?.(p);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    if (scrubProgress !== null) {
      onSeek?.(scrubProgress);
      setScrubProgress(null);
    }
  };

  const activeProgress = scrubProgress !== null ? scrubProgress : progress;

  return (
    <>
    {/* Phone: compact bar. Tapping it opens the full-screen player; buttons keep their own action. */}
    <div className="md:hidden relative w-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#FF9FFC]" style={{ width: `${activeProgress * 100}%` }} />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={(e) => { if (e.key === 'Enter') onExpand(); }}
        aria-label={`Abrir reproductor: ${track.title}, ${track.artist}`}
        className="flex items-center gap-3 pl-3 pr-2.5 h-16 cursor-pointer active:bg-white/[0.04]"
      >
        <img src={(track.albumCover || album.coverUrl)} alt="" className="w-11 h-11 rounded-md object-cover shrink-0 shadow-md" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-bold leading-tight truncate flex items-center gap-1">
            {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
            <span className="truncate">{track.title}</span>
          </p>
          <p className="text-white/70 text-[13px] leading-tight truncate mt-0.5">{track.artist}</p>
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
          <span className="relative w-9 h-9 rounded-full bg-white text-black flex items-center justify-center">
            <PopSwap className="w-5 h-5" items={[
              { id: 'play', on: !isLoading && !isPlaying, node: <Play className="w-4 h-4 ml-0.5" fill="currentColor" /> },
              { id: 'pause', on: !isLoading && isPlaying, node: <Pause className="w-4 h-4" fill="currentColor" /> },
              { id: 'load', on: isLoading, node: <span className="w-[18px] h-[18px] rounded-full border-[2.5px] border-black/20 border-t-black animate-spin" role="status" aria-label="Cargando canción" /> },
            ]} />
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
      data-no-pressfx-self
      className="w-full h-[80px] bg-transparent shrink-0 hidden md:flex items-center justify-between px-6 relative group/player rounded-none cursor-pointer"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none opacity-30"></div>

      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-150" style={{ backgroundImage: `url(${(track.albumCover || album.coverUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', maskImage: 'linear-gradient(to right, black 5%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to right, black 5%, transparent 70%)' }} />
      </div>
      {/* Seek bar on the top edge with fluid pointer scrubbing */}
      <div
        data-no-pressfx
        className="absolute left-0 right-0 top-0 -translate-y-1/2 h-6 z-20 group flex items-center cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title={`Progreso: ${formatTime(Math.floor(durationSecs * activeProgress))} de ${formatTime(durationSecs)}`}
        aria-label="Barra de progreso de la canción"
      >
        <WavyProgress progress={activeProgress} isPlaying={isPlaying} />
      </div>
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-4 w-[32%] min-w-[220px] max-w-[380px] relative z-10">
        <div
          role="button"
          tabIndex={0}
          onClick={onExpand}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onExpand()}
          data-cover-source="mini"
          className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0 cursor-pointer relative group shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Expandir reproductor a pantalla completa (F)"
          aria-label="Expandir reproductor a pantalla completa"
        >
          <img src={(track.albumCover || album.coverUrl)} alt="Cover" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </div>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h4
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className="text-white font-bold text-[16.5px] leading-snug line-clamp-1 hover:underline cursor-pointer flex items-center gap-1.5"
            title="Abrir reproductor"
          >
            {isLicensed(track.id) && <Star className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" aria-hidden="true" />}
            <span className="truncate">{track.title}</span>
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[14px] text-white/70 font-medium min-w-0">
            <span
              onClick={(e) => { e.stopPropagation(); onSelectArtist && onSelectArtist(); }}
              className="truncate hover:underline hover:text-white cursor-pointer"
              title={`Artista: ${track.artist}`}
            >
              {track.artist}
            </span>
            {originAlbum && (
              <>
                <span className="text-white/35 text-[11px]" aria-hidden="true">•</span>
                <span
                  onClick={(e) => { e.stopPropagation(); onSelectAlbum && onSelectAlbum(); }}
                  className="truncate hover:underline hover:text-white cursor-pointer"
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
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            className={`w-9 h-9 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"} pop-press`}
            onClick={onToggleShuffle}
            title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
            aria-pressed={isShuffle}
          >
            <Shuffle className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer pop-press"
            onClick={onPrev}
            title="Canción anterior (←)"
            aria-label="Canción anterior"
          >
            <SkipBack className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </button>
          {/* Botón de reproducción estilo vinilo giratorio y cristal esmerilado (igual al reproductor gigante) */}
          <button
            className="w-[50px] h-[50px] md:w-13 md:h-13 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.18)] hover:shadow-[0_0_28px_rgba(255,255,255,0.35)] group/vplay relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
            onClick={togglePlay}
            title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            aria-label={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
            aria-pressed={isPlaying}
            aria-busy={isLoading}
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

            {/* Loading ring while the song's audio loads; it turns into pause by itself once it plays */}
            <PopSwap className="relative z-20 w-6 h-6 drop-shadow-md" items={[
              { id: 'play', on: !isLoading && !isPlaying, node: <Play className="w-5 h-5 ml-0.5" fill="currentColor" aria-hidden="true" /> },
              { id: 'pause', on: !isLoading && isPlaying, node: <Pause className="w-5 h-5" fill="currentColor" aria-hidden="true" /> },
              { id: 'load', on: isLoading, node: <span className="w-6 h-6 rounded-full border-[2.5px] border-white/25 border-t-white animate-spin" role="status" aria-label="Cargando canción" /> },
            ]} />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer pop-press"
            onClick={onNext}
            title="Siguiente canción (→)"
            aria-label="Siguiente canción"
          >
            <SkipForward className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </button>
          <button
            className={`w-9 h-9 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40 hover:text-white"} pop-press`}
            onClick={onToggleRepeat}
            title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
            aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'repetir una canción' : repeatMode === 'all' ? 'repetir todo' : 'desactivado'}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-[18px] h-[18px]" aria-hidden="true" /> : <Repeat className="w-[18px] h-[18px]" aria-hidden="true" />}
          </button>
          <button
            className={`w-9 h-9 flex items-center justify-center group/favbtn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer ${isFavorite(track.id) ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/50 hover:text-white'} pop-press`}
            onClick={() => toggleFavorite(track, album)}
            title={isFavorite(track.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-label={isFavorite(track.id) ? `Quitar ${track.title} de favoritos` : `Añadir ${track.title} a favoritos`}
          >
            <span key={String(isFavorite(track.id))} className="pop-in flex items-center justify-center">
              {isFavorite(track.id) ? (
                <>
                  <Heart className="w-[18px] h-[18px] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                  <HeartOff className="w-[18px] h-[18px] hidden group-hover/favbtn:block" aria-hidden="true" />
                </>
              ) : (
                <Heart className="w-[18px] h-[18px]" fill="none" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>

      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-3.5 w-[30%] min-w-[220px] relative z-10">
        <span className="text-sm font-medium text-white/60 tabular-nums whitespace-nowrap mr-1">{formatTime(currentSecs)} / {formatTime(durationSecs)}</span>
        <button
          onClick={onToggleLyrics}
          className={`w-9 h-9 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer ${isLyricsOpen ? 'text-[#a855f7]' : 'text-white/60 hover:text-white'}`}
          title={isLyricsOpen ? "Ocultar panel de letras" : "Mostrar panel de letras"}
          aria-label={isLyricsOpen ? "Ocultar letras de la canción" : "Mostrar letras de la canción"}
          aria-pressed={isLyricsOpen}
        >
          <Mic2 className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={onToggleMute}
          className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer"
          title={volume === 0 ? "Activar sonido" : "Silenciar"}
          aria-label={volume === 0 ? "Activar sonido" : "Silenciar reproductor"}
          aria-pressed={volume === 0}
        >
          <PopSwap className="w-5 h-5" items={[
            { id: 'mute', on: volume === 0, node: <VolumeX className="w-5 h-5" aria-hidden="true" /> },
            { id: 'low', on: volume > 0 && volume < 50, node: <Volume1 className="w-5 h-5" aria-hidden="true" /> },
            { id: 'high', on: volume >= 50, node: <Volume2 className="w-5 h-5" aria-hidden="true" /> },
          ]} />
        </button>
        <div
          data-no-pressfx
          className={`w-28 bg-white/15 rounded-full relative group cursor-pointer flex items-center transition-[height] duration-200 ${volHeld ? 'h-3' : 'h-2'}`}
          onPointerDown={() => setVolHeld(true)}
          onPointerUp={() => setVolHeld(false)}
          onPointerCancel={() => setVolHeld(false)}
          onPointerLeave={() => setVolHeld(false)}
        >
          <div className="absolute left-0 h-full bg-white group-hover:bg-[#a855f7] rounded-full transition-colors pointer-events-none" style={{ width: `${volume}%` }}></div>
          {/* handle and value: pop in while the bar is held */}
          <div
            aria-hidden="true"
            className={`absolute top-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${volHeld ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ left: `${volume}%` }}
          />
          <div
            aria-hidden="true"
            className={`absolute -top-8 -ml-4 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xl text-xs font-semibold text-white tabular-nums pointer-events-none transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${volHeld ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ left: `${volume}%` }}
          >
            {Math.round(volume)}%
          </div>
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
