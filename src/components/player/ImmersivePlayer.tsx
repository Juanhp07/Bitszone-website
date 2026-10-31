import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Album, Track } from "./types";
import { Star, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, ChevronDown, Minimize2, Heart, HeartOff, Shuffle, Repeat, Repeat1, ListMusic, Mic2, ListOrdered, Download, CheckCircle, Loader2, MoreHorizontal, ListX, ListPlus, GripVertical, Sparkles, Sliders } from 'lucide-react';
import { TrackMenu } from './TrackMenu';
import { EqBars } from '../ui/EqBars';
import { MarqueeTitle } from '../ui/MarqueeTitle';
import { PopSwap } from '../ui/PopSwap';
import { NowPlayingToggle } from '../ui/NowPlayingToggle';
import { LiquidTabs } from '../ui/LiquidTabs';
import { usePlayback } from './PlaybackContext';
import { usePlaylists, withAlbumInfo } from './PlaylistsContext';
import { ListScrollbar } from '../ui/ListScrollbar';
import { WavyProgress } from './MiniPlayer';
import { useDownloads } from './DownloadsContext';
import { motion, AnimatePresence, Reorder, useDragControls, type DragControls } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';
import { useIsMobile } from './useIsMobile';
import { CavaVisualizer } from './CavaVisualizer';
import { CavaSettingsModal } from './CavaSettingsModal';
import { loadCavaSettings, saveCavaSettings, DEFAULT_CAVA_SETTINGS, type CavaSettings } from './cavaTypes';
import { fetchTrackLyrics, type LyricsResult, type LyricLine, somewhereIBelongLyrics } from '../../services/lyricsService';

const useAverageColor = (src: string) => {
  const [color, setColor] = useState('rgba(45, 10, 70, 0.8)');
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setColor(`rgba(${r}, ${g}, ${b}, 0.85)`);
      }
    };
    img.onerror = () => setColor('rgba(45, 10, 70, 0.8)');
    img.src = src;
  }, [src]);
  return color;
};

// Queue row that can only be dragged by its grip, so swiping the list still scrolls on phones
const QueueReorderItem = ({ value, constraintsRef, children }: { value: unknown; constraintsRef: React.RefObject<HTMLElement | null>; children: (controls: DragControls) => React.ReactNode }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      // Can't be dragged outside the "A continuación" block
      dragConstraints={constraintsRef}
      dragElastic={0.04}
      layout="position"
      whileDrag={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)', boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}
      className="relative rounded-xl list-none"
    >
      {children(controls)}
    </Reorder.Item>
  );
};

/**
 * Título de canción animado:
 * 1. Entrada escalonada letra por letra desde abajo que se ejecuta SOLO UNA VEZ al cambiar de canción.
 * 2. Destello morado/lila que recorre letra por letra de forma individual, apareciendo cada 2.5-3 segundos
 *    después de que el texto ha terminado de aparecer.
 */
const AnimatedSongTitle = ({
  title,
  trackId,
  className = ""
}: {
  title: string;
  trackId: string | number;
  className?: string;
}) => {
  let charCounter = 0;
  const words = title.split(' ');

  return (
    <div
      key={trackId}
      className={`relative flex w-full items-center justify-center max-w-full min-w-0 overflow-visible group/title select-none ${className}`}
    >
      <style>{`
        @keyframes titleCharRollUpOnce {
          0% {
            transform: translateY(125%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes letterSparkleGlint {
          0% {
            color: #ffffff;
            text-shadow: none;
            transform: translateY(0);
          }
          1.8% {
            color: #f5eeff;
            text-shadow: 0 0 6px rgba(192, 132, 252, 0.35);
            transform: translateY(-0.5px);
          }
          3.6% {
            color: #ebd5ff;
            text-shadow: 0 0 10px rgba(192, 132, 252, 0.55), 0 0 18px rgba(168, 85, 247, 0.25);
            transform: translateY(-0.8px);
          }
          5.4% {
            color: #f5eeff;
            text-shadow: 0 0 6px rgba(192, 132, 252, 0.3);
            transform: translateY(-0.3px);
          }
          7.2%, 100% {
            color: #ffffff;
            text-shadow: none;
            transform: translateY(0);
          }
        }
        .animate-title-char-roll {
          animation: titleCharRollUpOnce 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-letter-sparkle {
          animation: letterSparkleGlint 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-title-char-roll {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .animate-letter-sparkle {
            animation: none !important;
            text-shadow: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Base Rolling Text with Letter-by-Letter recurring shimmer */}
      <MarqueeTitle center slideOnHover measureKey={title}>
      <div className="inline-flex flex-nowrap whitespace-nowrap items-center justify-center gap-x-[0.26em] relative z-10 leading-tight">
        {words.map((word, wIdx) => (
          <div key={wIdx} className="inline-flex items-center">
            {word.split('').map((char) => {
              const charIndex = charCounter++;
              const enterDelay = Math.min(0.35, charIndex * 0.022);
              const shimmerDelay = 1.3 + charIndex * 0.032;
              return (
                <div key={`${wIdx}-${charIndex}`} className="relative h-[1.32em] -my-[0.16em] py-[0.08em] overflow-hidden flex items-center">
                  {/* Outer wrapper: executes roll up from below strictly ONCE */}
                  <span
                    className="inline-block leading-none text-white animate-title-char-roll whitespace-pre"
                    style={{ animationDelay: `${enterDelay}s` }}
                  >
                    {/* Inner wrapper: executes subtle recurring letter-by-letter purple shimmer every 5s after entrance */}
                    <span
                      className="inline-block leading-none animate-letter-sparkle whitespace-pre transition-transform duration-200"
                      style={{ animationDelay: `${shimmerDelay}s` }}
                    >
                      {char}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </MarqueeTitle>
    </div>
  );
};


export const ImmersivePlayer = ({
  isExpanded,
  onClose,
  track,
  album,
  isPlaying,
  isLoading = false,
  togglePlay,
  onPlayTrack,
  volume = 100,
  setVolume,
  progress = 0,
  onNext,
  onPrev,
  onToggleMute,
  onSeek,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  audioElement,
  activeTab = "pistas",
  onTabChange
}: {
  isExpanded: boolean,
  onClose: () => void,
  track: Track | null,
  album: Album | null,
  audioElement?: HTMLAudioElement | null,
  isPlaying: boolean,
  /** the song was chosen but its audio is still loading */
  isLoading?: boolean,
  togglePlay: () => void,
  onPlayTrack?: (t: Track, a: Album) => void,
  volume?: number,
  setVolume?: (v: number) => void,
  progress?: number,
  onNext?: () => void,
  onPrev?: () => void,
  onToggleMute?: () => void,
  onSeek?: (progress: number) => void,
  isShuffle?: boolean,
  repeatMode?: "off" | "all" | "one",
  onToggleShuffle?: () => void,
  onToggleRepeat?: () => void,
  activeTab?: "portada" | "letra" | "pistas" | "cola" | "inmersion",
  onTabChange?: (tab: "portada" | "letra" | "pistas" | "cola" | "inmersion") => void
}) => {
  if (!track || !album) return null;

  const [cavaSettings, setCavaSettings] = useState<CavaSettings>(loadCavaSettings);
  const [isCavaSettingsOpen, setIsCavaSettingsOpen] = useState(false);

  const handleUpdateCavaSettings = (updater: (prev: CavaSettings) => CavaSettings) => {
    setCavaSettings((prev) => {
      const next = updater(prev);
      saveCavaSettings(next);
      return next;
    });
  };

  const handleResetCavaSettings = () => {
    setCavaSettings(DEFAULT_CAVA_SETTINGS);
    saveCavaSettings(DEFAULT_CAVA_SETTINGS);
  };

  const [currentTab, setCurrentTab] = useState<"pistas" | "letra" | "cola" | "inmersion">(
    activeTab === "letra" ? "letra" : activeTab === "cola" ? "cola" : activeTab === "inmersion" ? "inmersion" : "pistas"
  );

  useEffect(() => {
    if (activeTab === "letra" || activeTab === "cola" || activeTab === "pistas" || activeTab === "inmersion") {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabSelect = (tab: "pistas" | "letra" | "cola" | "inmersion") => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  // Ultra-fluid scrub handling for full-screen immersion timeline
  const [scrubProgress, setScrubProgress] = useState<number | null>(null);
  const isScrubbingTimeline = useRef(false);
  const seekRafRef = useRef<number>(0);

  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isScrubbingTimeline.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(p);
    onSeek?.(p);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingTimeline.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(p);
    if (!seekRafRef.current) {
      seekRafRef.current = requestAnimationFrame(() => {
        seekRafRef.current = 0;
        onSeek?.(p);
      });
    }
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingTimeline.current) return;
    isScrubbingTimeline.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    if (seekRafRef.current) {
      cancelAnimationFrame(seekRafRef.current);
      seekRafRef.current = 0;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(null);
    onSeek?.(p);
  };

  const currentIndex = album?.tracks?.findIndex(t => t.id === track.id) ?? -1;
  const playback = usePlayback();
  const { createPlaylist } = usePlaylists();
  const isSongRadio = Boolean((album as any)?.isSongRadio);
  const currentTrackAlbum = playback.nowPlayingOrigin;
  const coverSource = track?.albumCover || currentTrackAlbum?.coverUrl || album?.coverUrl || '';
  const dominantColor = useAverageColor(coverSource);

  // Apple-style rubber band bounce for right scrollable area
  const { containerRef: rightScrollRef, springValue: rightSpringY, scrollProps: rightScrollProps, triggerBounce: rightBounce } = useRubberBand({ axis: 'y' });

  // Top-to-bottom cascade animation variants
  const tabListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      }
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  const cascadedItemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      }
    }
  };

  const volumeRef = React.useRef<HTMLDivElement>(null);
  const isDraggingVol = React.useRef(false);
  const [volDragging, setVolDragging] = useState(false);
  const [volBubble, setVolBubble] = useState(false);   // the % bubble: while dragging and for a moment after any change
  const [volPull, setVolPull] = useState(0);            // px the bars are stretched when you pull past the top / bottom
  const volBubbleTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const flashVolBubble = () => {
    setVolBubble(true);
    clearTimeout(volBubbleTimer.current);
    volBubbleTimer.current = setTimeout(() => setVolBubble(false), 900);
  };
  const handleVolumeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!setVolume || !volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const raw = 1 - ((e.clientY - rect.top) / rect.height);
    const p = Math.max(0, Math.min(1, raw));
    // rubber band: past the ends the bars follow the finger with resistance
    const over = raw > 1 ? raw - 1 : raw < 0 ? raw : 0;
    setVolPull(Math.max(-14, Math.min(14, -over * rect.height * 0.35)));
    const newVol = Math.round(p * 20) * 5;
    if (newVol !== volume) { setVolume(newVol); flashVolBubble(); }
  };
  const VolIcon = (volume || 0) === 0 ? VolumeX : (volume || 0) < 50 ? Volume1 : Volume2;

  const [lyricsResult, setLyricsResult] = useState<LyricsResult | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (!track) {
      setLyricsResult(null);
      return;
    }

    setLoadingLyrics(true);
    const durationSec = Math.floor((track.duration || 0) / 1000);
    const artistName = track.artist || album?.artist || '';

    fetchTrackLyrics(track.title, artistName, album?.title, durationSec)
      .then((res) => {
        if (!isCancelled) {
          setLyricsResult(res);
          setLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyricsResult(null);
          setLoadingLyrics(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [track?.id, track?.title, track?.artist, album?.title]);

  const activeLyrics = lyricsResult?.lines || (track.title === "Somewhere I Belong" ? somewhereIBelongLyrics : null);

  const durationSecs = Math.floor((track?.duration || 0) / 1000);
  const currentSecs = progress * durationSecs;

  let activeIndex = -1;
  if (activeLyrics && activeLyrics.length > 0) {
    for (let i = 0; i < activeLyrics.length; i++) {
      if (currentSecs >= activeLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  useEffect(() => {
    if (currentTab === 'letra') return;
    // the new tab's content mounts right after the old one leaves: reset now and once more when it is there
    const reset = () => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    reset();
    const t = setTimeout(reset, 320);
    return () => clearTimeout(t);
  }, [currentTab]);
  const lyricsAlignedRef = useRef(false);
  useEffect(() => {
    if (currentTab !== 'letra') { lyricsAlignedRef.current = false; return; }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const align = () => {
      // The tab's scroller is rightScrollRef (the lyrics wrapper itself doesn't scroll)
      const scroller = rightScrollRef.current;
      if (!scroller) return;
      const active = scroller.querySelector<HTMLElement>('[data-active-lyric="true"]');
      if (activeIndex === -1) { scroller.scrollTo({ top: 0, behavior: lyricsAlignedRef.current ? 'smooth' : 'auto' }); return; }
      if (!active) {
        // the lyrics appear after the tab's switch animation: try again shortly
        if (tries++ < 30) timer = setTimeout(align, 50);
        return;
      }
      const sc = scroller.getBoundingClientRect();
      const el = active.getBoundingClientRect();
      // Center active line at ~36% from top like Apple Music
      const targetTop = scroller.scrollTop + (el.top - sc.top) - (sc.height * 0.36) + (el.height / 2);
      scroller.scrollTo({
        top: Math.max(0, targetTop),
        // first alignment after opening the tab is instant; the following ones glide
        behavior: lyricsAlignedRef.current ? 'smooth' : 'auto'
      });
      lyricsAlignedRef.current = true;
    };
    align();
    return () => { if (timer) clearTimeout(timer); };
  }, [activeIndex, currentTab]);



  const { isFavorite, toggleFavorite, isLicensed, isDownloaded, downloadTrack } = useDownloads();
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [rowMenu, setRowMenu] = useState<{ track: Track; album: Album; inQueue: boolean; anchor: { x: number; y: number; x2?: number } } | null>(null);

  const handleRowDownload = async (t: Track, from: Album) => {
    if (isDownloaded(t.id) || downloadingIds.includes(t.id)) return;
    setDownloadingIds(prev => [...prev, t.id]);
    await downloadTrack(t, String(from.id).startsWith('playlist:') ? undefined : from);
    setDownloadingIds(prev => prev.filter(id => id !== t.id));
  };

  const openRowMenu = (e: React.MouseEvent, t: Track, from: Album, inQueue: boolean, atCursor: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRowMenu({ track: t, album: from, inQueue, anchor: atCursor ? { x: e.clientX, y: e.clientY } : { x: rect.left, y: rect.bottom + 6, x2: rect.right } });
  };

  // Download + more, revealed on row hover (right side)
  const renderRowActions = (t: Track, from: Album, inQueue: boolean) => {
    const downloaded = isDownloaded(t.id);
    const downloading = downloadingIds.includes(t.id);
    const menuOpen = rowMenu?.track.id === t.id;
    return (
      <div className={`flex items-center gap-1 md:gap-2 ml-3 shrink-0 origin-right transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] [@media(hover:none)]:opacity-100 [@media(hover:none)]:scale-100 ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 focus-within:opacity-100 focus-within:scale-100'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleRowDownload(t, from); }}
          disabled={downloaded || downloading}
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer disabled:cursor-default"
          title={downloading ? 'Descargando...' : downloaded ? 'Canción descargada' : `Descargar ${t.title}`}
          aria-label={downloading ? 'Descargando canción' : downloaded ? 'Canción descargada' : `Descargar ${t.title}`}
        >
          {downloading ? <Loader2 className="w-5 h-5 animate-spin text-[#a855f7]" aria-hidden="true" />
            : downloaded ? <CheckCircle className="w-5 h-5 text-[#a855f7]" strokeWidth={2.5} aria-hidden="true" />
            : <Download className="w-5 h-5" aria-hidden="true" />}
        </button>
        <button
          onClick={(e) => openRowMenu(e, t, from, inQueue, false)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          title="Más opciones"
          aria-label={`Más opciones para ${t.title}`}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    );
  };
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const coverRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ startY: number; dy: number } | null>(null);
  const queueGroupRef = useRef<HTMLUListElement>(null);
  // Pull-to-dismiss feedback: nudge and dim the player's content (not its opaque backdrop),
  // capped so the page behind never shows through
  const pullFeedback = (root: HTMLElement, dy: number) => {
    const eased = Math.min(dy, 220) * 0.35;
    Array.from(root.children).forEach((child, i) => {
      if (i === 0) return; // album ambience stays put
      const c = child as HTMLElement;
      if (c.dataset.sheet !== undefined) return;
      c.style.transition = dy ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.35s';
      c.style.transform = dy ? `translateY(${eased}px)` : '';
      c.style.opacity = dy ? String(Math.max(0.6, 1 - dy / 500)) : '';
    });
  };
  const isMobile = useIsMobile();
  // Phones: the tabs/list live in a bottom sheet (YT Music style) instead of scrolling the page
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetDrag = useRef<{ startY: number; dy: number; moved: boolean } | null>(null);
  useEffect(() => { if (!isExpanded) setSheetOpen(false); }, [isExpanded]);
  const SHEET_PEEK = 30;
  const sheetTransform = (open: boolean, extra = 0) =>
    open ? `translateY(${Math.max(0, extra)}px)` : `translateY(calc(100% - ${SHEET_PEEK}px + ${Math.min(0, extra)}px))`;
  const onSheetHandleDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sheetDrag.current = { startY: e.clientY, dy: 0, moved: false };
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };
  const onSheetHandleMove = (e: React.PointerEvent) => {
    const d = sheetDrag.current;
    if (!d || !sheetRef.current) return;
    d.dy = e.clientY - d.startY;
    if (Math.abs(d.dy) > 6) d.moved = true;
    sheetRef.current.style.transform = sheetTransform(sheetOpen, d.dy);
  };
  const onSheetHandleUp = () => {
    const d = sheetDrag.current;
    sheetDrag.current = null;
    if (!sheetRef.current) return;
    sheetRef.current.style.transition = '';
    sheetRef.current.style.transform = '';
    if (!d) return;
    if (!d.moved) setSheetOpen(o => !o);
    else if (sheetOpen && d.dy > 80) setSheetOpen(false);
    else if (!sheetOpen && d.dy < -60) setSheetOpen(true);
  };
  useEffect(() => {
    if (!isExpanded) return;
    const dest = coverRef.current;
    if (!dest || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const coverUrl = track.albumCover || album.coverUrl;
    const albumImg = document.querySelector<HTMLImageElement>('img[data-cover-source="album"]');
    const source = albumImg && albumImg.getAttribute('src') === coverUrl && albumImg.getBoundingClientRect().width > 0
      ? albumImg
      : document.querySelector<HTMLElement>('[data-cover-source="mini"]');
    if (!source) return;
    const from = source.getBoundingClientRect();
    const to = dest.getBoundingClientRect();
    if (!from.width || !to.width) return;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    dest.getAnimations().forEach((a) => a.cancel());
    dest.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` }, { transform: 'none' }],
      { duration: 600, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }
    );
  }, [isExpanded]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded, onClose]);

  // Waveform pattern
  const formatTime = (ms?: number) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const wave = [15, 30, 50, 80, 60, 40, 70, 100, 85, 60, 30, 45, 90, 75, 50, 35, 65, 85, 100, 80, 50, 35, 20, 15];
  const activeBars = Math.floor(progress * wave.length);



  // Inmersión toggle: in the tabs row (desktop, track list showing) or in the top-right corner (phones, immersion mode).
  // `compact` = icon only below xl, so it fits next to the tabs on medium screens.
  const immersionToggle = (compact: boolean) => (
    <button
      onClick={() => handleTabSelect(currentTab === 'inmersion' ? 'pistas' : 'inmersion')}
      className={`group flex items-center h-10 md:h-11 rounded-full ${compact ? 'w-11 justify-center xl:w-auto xl:px-4' : 'px-3.5 md:px-4'} backdrop-blur-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer select-none gap-2 ${
        currentTab === 'inmersion'
          ? 'bg-purple-600/35 border-purple-400/80 text-white shadow-[0_0_24px_rgba(168,85,247,0.4)]'
          : 'bg-white/10 hover:bg-white/15 active:bg-white/20 border-white/20 hover:border-white/30 text-white/90 hover:text-white'
      }`}
      title={currentTab === 'inmersion' ? "Salir de modo inmersión" : "Modo inmersión visual"}
      aria-label="Modo inmersión"
      aria-pressed={currentTab === 'inmersion'}
    >
      <Sparkles className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 shrink-0 ${currentTab === 'inmersion' ? 'text-purple-300' : 'text-white/90'}`} strokeWidth={2.2} aria-hidden="true" />
      <span className={`text-xs md:text-sm font-medium tracking-wide whitespace-nowrap ${compact ? 'hidden xl:inline' : ''}`}>
        Inmersión
      </span>
    </button>
  );

  return createPortal(
    <>
      {/* Backdrop (though the modal is fullscreen, keeping this for transition) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] ${
          isExpanded ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      />

      {/* Fullscreen Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        // Swipe down from the top to dismiss (phones), like iOS sheets
        onTouchStart={(e) => {
          const el = e.currentTarget;
          const onControl = sheetOpen || (e.target as HTMLElement).closest('[role="slider"], .touch-none, [data-sheet]');
          swipeRef.current = el.scrollTop <= 0 && !onControl ? { startY: e.touches[0].clientY, dy: 0 } : null;
        }}
        onTouchMove={(e) => {
          const sw = swipeRef.current;
          if (!sw) return;
          sw.dy = Math.max(0, e.touches[0].clientY - sw.startY);
          pullFeedback(e.currentTarget, sw.dy);
        }}
        onTouchEnd={(e) => {
          const sw = swipeRef.current;
          const el = e.currentTarget;
          pullFeedback(el, 0);
          if (sw && sw.dy > 120) onClose();
          swipeRef.current = null;
        }}
        className={`fixed z-[100] inset-0 w-full h-full overflow-hidden overscroll-contain bg-[#050505] flex flex-col md:flex-row transition-[opacity,visibility] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isExpanded ? 'opacity-100 pointer-events-auto visible duration-500' : 'opacity-0 pointer-events-none invisible duration-300'
        }`}
      >

        {/* Album ambience: same blurred cover as the album page, a touch darker */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-black/55 z-10" />
           <AnimatePresence>
             {coverSource && (
               <motion.div
                 key={coverSource}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.9 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.8, ease: 'easeInOut' }}
                 className={`absolute inset-0 bg-cover bg-center blur-[120px] saturate-150 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'scale-125' : 'scale-150'}`}
                 style={{ backgroundImage: `url(${coverSource})` }}
               />
             )}
           </AnimatePresence>
        </div>

        {/* Botón Minimizar estilo circular Liquid Glass con expansión suave a texto en hover */}
        <div className="absolute top-3 md:top-8 xl:top-10 left-3 md:left-8 xl:left-10 z-50">
          <button
            onClick={onClose}
            className="group flex items-center h-10 md:h-11 w-10 md:w-11 hover:w-[114px] md:hover:w-[124px] rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-2xl border border-white/20 hover:border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white/90 hover:text-white transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden select-none"
            title="Minimizar reproductor (F o Esc)"
            aria-label="Minimizar reproductor"
          >
            <div className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center shrink-0">
              <ChevronDown className="md:hidden w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2.2} aria-hidden="true" />
              <Minimize2 className="hidden md:block w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-90" strokeWidth={2.2} aria-hidden="true" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 text-sm font-medium tracking-wide pr-3.5 whitespace-nowrap">
              Minimizar
            </span>
          </button>
        </div>

        {/* Botón Inmersión y Ajustes en la parte superior derecha */}
        <div className="absolute top-3 md:top-8 xl:top-10 right-3 md:right-8 xl:right-10 z-50 flex items-center gap-2 md:gap-2.5">
          {currentTab === 'inmersion' && (
            <button
              onClick={() => setIsCavaSettingsOpen(true)}
              className="group flex items-center h-10 md:h-11 w-10 md:w-11 hover:w-[184px] md:hover:w-[196px] rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-2xl border border-white/20 hover:border-white/35 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white/90 hover:text-white transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden select-none"
              title="Ajustes de inmersión"
              aria-label="Ajustes de inmersión"
            >
              <div className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:rotate-90 text-purple-300" strokeWidth={2.2} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 text-xs md:text-sm font-medium tracking-wide pr-4 whitespace-nowrap shrink-0">
                Ajustes inmersión
              </span>
            </button>
          )}

          {(isMobile || currentTab === 'inmersion') && immersionToggle(false)}
        </div>

        {/* 1. LEFT: Unified Cover, Info & Controls */}
        <div className={`${currentTab === 'inmersion' ? 'hidden' : 'flex'} w-full md:w-[52%] h-[100dvh] md:h-full shrink-0 relative flex-col justify-center items-center group px-6 md:px-12 md:pl-32 xl:pl-40 pt-14 pb-[44px] md:pt-20 md:pb-10 md:overflow-y-auto scrollbar-hide transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'transform-none duration-700' : 'translate-y-6 scale-[0.97] duration-300'}`}>
           {/* Vertical Volume Control (Always visible, aligned with minimize button) */}
           <div className="hidden md:flex absolute left-6 md:left-8 xl:left-10 top-1/2 -translate-y-1/2 z-50 w-11 md:w-12 flex-col items-center gap-2 opacity-100 transition-all duration-300">
             <button
               onClick={() => { setVolume && setVolume(100); flashVolBubble(); }}
               className="mb-2 p-2 hover:bg-white/10 rounded-full cursor-pointer group/icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 pop-press"
               title="Volumen al máximo (100%)"
               aria-label="Subir volumen al máximo"
             >
               <PopSwap className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover/icon:text-white transition-colors" items={[
                 { id: 'mute', on: (volume || 0) === 0, node: <VolumeX className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> },
                 { id: 'low', on: (volume || 0) > 0 && (volume || 0) < 50, node: <Volume1 className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> },
                 { id: 'high', on: (volume || 0) >= 50, node: <Volume2 className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> },
               ]} />
             </button>
             <div
               ref={volumeRef}
               data-no-pressfx
               className="relative flex flex-col gap-[3px] py-1 touch-none"
               style={{ transform: `scaleY(${1 + Math.abs(volPull) / 160}) translateY(${volPull * 0.4}px)`, transformOrigin: volPull >= 0 ? 'bottom' : 'top', transition: volDragging ? 'transform 60ms linear' : 'transform 520ms cubic-bezier(0.34,1.56,0.64,1)' }}
               onPointerDown={(e) => {
                 isDraggingVol.current = true;
                 setVolDragging(true);
                 handleVolumeDrag(e);
                 e.currentTarget.setPointerCapture(e.pointerId);
               }}
               onPointerMove={(e) => {
                 if (isDraggingVol.current) handleVolumeDrag(e);
               }}
               onPointerUp={(e) => {
                 isDraggingVol.current = false;
                 setVolDragging(false);
                 setVolPull(0);
                 e.currentTarget.releasePointerCapture(e.pointerId);
                 flashVolBubble();
               }}
               onPointerCancel={(e) => {
                 isDraggingVol.current = false;
                 setVolDragging(false);
                 setVolPull(0);
                 e.currentTarget.releasePointerCapture(e.pointerId);
               }}
               onWheel={(e) => {
                 e.stopPropagation();
                 if (!setVolume) return;
                 const delta = e.deltaY;
                 const currentVol = volume || 0;
                 let newVol = currentVol;
                 if (delta > 0) newVol = Math.max(0, currentVol - 5);
                 if (delta < 0) newVol = Math.min(100, currentVol + 5);
                 if (newVol !== currentVol) {
                   setVolume(newVol);
                   flashVolBubble();
                 }
               }}
             >
               {/* value bubble: pops next to the level while you drag or change the volume */}
               <div
                 aria-hidden="true"
                 className={`absolute left-full ml-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xl text-xs font-semibold text-white tabular-nums pointer-events-none transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${volBubble || volDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                 style={{ top: `calc(${(1 - (volume || 0) / 100) * 100}% - 12px)`, transition: 'top 90ms linear, opacity 200ms, transform 200ms cubic-bezier(0.34,1.56,0.64,1)' }}
               >
                 {Math.round(volume || 0)}%
               </div>
               {Array.from({ length: 20 }).map((_, i) => {
                 const level = (20 - i) * 5;
                 const isActive = (volume || 0) >= level;
                 return (
                   <button
                     key={level}
                     onClick={(e) => { e.stopPropagation(); setVolume && setVolume(level); }}
                     className="py-[2px] px-1 flex items-center justify-center group/line cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 rounded-sm"
                     title={`Ajustar volumen al ${level}%`}
                     aria-label={`Volumen ${level}%`}
                   >
                     {/* bars near the current level swell while you hold the control, like a wave under the finger */}
                     <div
                       className={`w-6 h-1 rounded-full transition-[background-color,box-shadow,transform] duration-150 ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/20 group-hover/line:bg-white/60 group-hover/line:scale-y-150'}`}
                       style={volDragging ? { transform: `scale(${1 + 0.55 * Math.exp(-Math.abs(level - (volume || 0)) / 12)}, ${1 + 0.9 * Math.exp(-Math.abs(level - (volume || 0)) / 12)})` } : undefined}
                     />
                   </button>
                 );
               })}
             </div>
             <button
               onClick={() => { setVolume && setVolume(0); flashVolBubble(); }}
               className="mt-2 p-2 hover:bg-white/10 rounded-full cursor-pointer group/icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 pop-press"
               title="Silenciar reproductor"
               aria-label="Silenciar reproductor"
             >
               <VolumeX className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${(volume || 0) === 0 ? 'text-white' : 'text-white/50 group-hover/icon:text-white'}`} aria-hidden="true" />
             </button>
           </div>

           {/* Floating Content: Album Title -> Square -> Artist -> Player Controls */}
           <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-2xl">
              {/* Phones: song title sits above the cover */}
              <h2 className="md:hidden w-full flex justify-center text-center font-inter font-bold text-white text-[26px] leading-normal tracking-tight mb-4 px-2 py-1">
                <AnimatedSongTitle title={track.title} trackId={track.id} />
              </h2>
              {/* Cover + vinyl + reactions dock: the album page's left column, carried into the player */}
              <div className="relative md:mr-[min(11vw,190px)]">
                {/* Vinyl peeking out (desktop), spinning only while playing */}
                <div aria-hidden="true" className="hidden md:block absolute top-[5%] bottom-[5%] right-[5%] aspect-square translate-x-[48%]">
                  <div
                    className="relative w-full h-full rounded-full animate-[spin_6s_linear_infinite] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    style={{
                      animationPlayState: isPlaying ? 'running' : 'paused',
                      background: 'radial-gradient(circle, transparent 0 31%, rgba(255,255,255,0.05) 31.5% 32%, transparent 32.5%), repeating-radial-gradient(circle, #0c0c0e 0 2px, #17171a 2.5px 3.5px), #111',
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,0.10)_40deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.07)_220deg,transparent_260deg)]" />
                    <img src={coverSource} alt="" className="absolute inset-[34%] w-[32%] h-[32%] rounded-full object-cover ring-2 ring-black/60" />
                    <div className="absolute left-1/2 top-1/2 w-[3%] h-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a]" />
                  </div>
                </div>

                {/* Shadow tinted with the album color */}
                <div className="absolute inset-4 translate-y-8 rounded-[22px] blur-3xl opacity-70 pointer-events-none z-0" style={{ background: dominantColor }} aria-hidden="true" />

                <div ref={coverRef} className="relative z-10 w-[min(calc(100vw-48px),46dvh)] h-[min(calc(100vw-48px),46dvh)] md:w-[clamp(140px,min(28vw,540px,calc(100dvh-440px)),540px)] md:h-[clamp(140px,min(28vw,540px,calc(100dvh-440px)),540px)] aspect-square rounded-2xl md:rounded-[22px] overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)] shrink-0">
                  <img
                    src={coverSource}
                    alt={album.title}
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.08)_22%,transparent_40%,transparent_70%,rgba(255,255,255,0.10)_100%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none" />
                </div>

                {/* Reactions dock for the song (desktop), identical white/light pill and frosted blur as the album page */}
                <div className="hidden md:flex absolute -bottom-4 -right-2 z-20 items-center justify-center gap-1.5 p-1.5 rounded-full bg-white/[0.18] hover:bg-white/[0.22] backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_16px_40px_rgba(0,0,0,0.35)] transition-all">
                  <button
                    onClick={() => toggleFavorite(track, album)}
                    className={`group/favbtn w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isFavorite(track.id) ? 'text-[#c084fc] hover:text-[#d8b4fe]' : 'text-white/75 hover:text-white'}`}
                    title={isFavorite(track.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
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
                  <button
                    onClick={() => handleRowDownload(track, album)}
                    disabled={isDownloaded(track.id) || downloadingIds.includes(track.id)}
                    className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 text-white/75 hover:text-white transition-colors disabled:hover:bg-transparent disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                    title={downloadingIds.includes(track.id) ? 'Descargando...' : isDownloaded(track.id) ? 'Canción descargada' : `Descargar ${track.title}`}
                    aria-label={downloadingIds.includes(track.id) ? 'Descargando canción' : isDownloaded(track.id) ? 'Canción descargada' : `Descargar ${track.title}`}
                  >
                    {downloadingIds.includes(track.id) ? <Loader2 className="w-5 h-5 animate-spin text-[#c084fc]" aria-hidden="true" />
                      : isDownloaded(track.id) ? <CheckCircle className="w-5 h-5 text-[#c084fc]" strokeWidth={2.5} aria-hidden="true" />
                      : <Download className="w-5 h-5" aria-hidden="true" />}
                  </button>
                  <div className="relative z-50">
                    <button
                      onClick={(e) => openRowMenu(e, track, album, true, false)}
                      className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 text-white/75 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                      title="Más opciones"
                      aria-label={`Más opciones para ${track.title}`}
                    >
                      <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title + meta, laid out like the album page */}
              <div className="flex flex-col items-center text-center mt-6 md:mt-[clamp(24px,5.5dvh,76px)] mb-3 md:mb-[clamp(8px,2dvh,32px)] w-full md:w-[min(40vw,680px)] min-w-0 px-0 md:px-4">
                <h2 className="hidden md:flex justify-center font-inter font-bold text-white text-2xl md:text-4xl xl:text-5xl leading-normal tracking-tight max-w-full py-1.5 px-2">
                  <AnimatedSongTitle title={track.title} trackId={track.id} />
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-0 md:mt-2 text-[15px] md:text-base xl:text-lg text-white/70 font-medium [&>span]:whitespace-nowrap">
                  <button
                    onClick={() => playback.goToArtist(playback.nowPlayingOrigin ?? album)}
                    className="text-white font-semibold uppercase tracking-wide hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                    title="Ir al artista"
                  >
                    {track.artist || album.artist}
                  </button>
                  <span aria-hidden="true">•</span>
                  <button
                    onClick={() => playback.goToAlbum(playback.nowPlayingOrigin ?? album)}
                    className="hover:text-white hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                    title="Ir al álbum"
                  >
                    {track.albumTitle || playback.nowPlayingOrigin?.title || album.title}
                  </button>
                </div>
              </div>

              {/* Controls (Below Artist, More Compact) */}
              <div className="max-md:order-last w-full md:w-auto flex items-center justify-between md:justify-center gap-3 md:gap-12 mt-5 md:mt-0 mb-0 md:mb-6">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleShuffle?.(); }}
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${isShuffle ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"} pop-press`}
                  title={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-label={isShuffle ? "Desactivar modo aleatorio" : "Activar modo aleatorio"}
                  aria-pressed={isShuffle}
                >
                  <Shuffle className="w-6 h-6" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.25)] text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer pop-press"
                  title="Canción anterior"
                  aria-label="Reproducir canción anterior"
                >
                  <SkipBack className="w-6 h-6 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-[76px] h-[76px] md:w-24 md:h-24 flex items-center justify-center rounded-full text-white transition-all border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] group relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 cursor-pointer shrink-0"
                  title={isPlaying ? "Pausar reproducción" : "Iniciar reproducción"}
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
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition-colors group-hover:bg-white/30" />

                  {/* Vinyl Grooves Details */}
                  <div className="absolute inset-1 rounded-full border border-white/30 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-2.5 md:inset-3 rounded-full border border-white/20 mix-blend-overlay pointer-events-none" />

                  {/* Vinyl Center Label */}
                  <div className="absolute w-7 h-7 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-xl border border-black/10 shadow-[0_0_15px_8px_rgba(0,0,0,0.35)] pointer-events-none" />
                  <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/10 shadow-inner pointer-events-none" />

                  {/* Loading ring while the song's audio loads; it turns into pause by itself once it plays */}
                  <span
                    className={`absolute inset-0 z-20 rounded-full flex items-center justify-center bg-black/35 transition-opacity duration-200 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    role={isLoading ? 'status' : undefined}
                    aria-label={isLoading ? 'Cargando canción' : undefined}
                  >
                    <span className="absolute inset-1 rounded-full border-[3px] border-white/20 border-t-white animate-spin" aria-hidden="true" />
                  </span>

                  {/* Play/Pause Icon: pops between the two */}
                  <PopSwap className="relative z-10 w-6 h-6 md:w-9 md:h-9 drop-shadow-md" items={[
                    { id: 'play', on: !isLoading && !isPlaying, node: <Play className="w-6 h-6 md:w-9 md:h-9 ml-1" fill="currentColor" aria-hidden="true" /> },
                    { id: 'pause', on: !isLoading && isPlaying, node: <Pause className="w-6 h-6 md:w-9 md:h-9" fill="currentColor" aria-hidden="true" /> },
                  ]} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.25)] text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer pop-press"
                  title="Siguiente canción"
                  aria-label="Reproducir siguiente canción"
                >
                  <SkipForward className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" fill="currentColor" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleRepeat?.(); }}
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${repeatMode !== 'off' ? "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"} pop-press`}
                  title={repeatMode === 'one' ? "Repetir una canción" : repeatMode === 'all' ? "Repetir todo" : "Activar repetición"}
                  aria-label={`Modo de repetición: ${repeatMode === 'one' ? 'una canción' : repeatMode === 'all' ? 'todas' : 'desactivado'}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" aria-hidden="true" /> : <Repeat className="w-6 h-6" aria-hidden="true" />}
                </button>
              </div>

              {/* Squiggly Timeline Progress Bar (More Compact) */}
              <div className="w-full md:w-[min(42vw,760px)] flex items-center gap-2.5 md:gap-4 font-bold text-white/50 tracking-wider tabular-nums text-xs md:text-base">
                 <span className="text-right w-9 md:w-12">{formatTime((scrubProgress !== null ? scrubProgress : progress) * track.duration)}</span>

                 <div
                   role="slider"
                   aria-label="Progreso de la canción"
                   aria-valuemin={0}
                   aria-valuemax={100}
                   aria-valuenow={Math.round((scrubProgress !== null ? scrubProgress : progress) * 100)}
                   data-no-pressfx
                   className="flex-1 h-9 md:h-8 flex items-center relative cursor-pointer group touch-none py-2"
                   onPointerDown={handleTimelinePointerDown}
                   onPointerMove={handleTimelinePointerMove}
                   onPointerUp={handleTimelinePointerUp}
                   onPointerCancel={handleTimelinePointerUp}
                 >
                    {/* Unified seekbar line: wavy played curves, straight unplayed track and handle dot in one seamless SVG */}
                    <WavyProgress progress={scrubProgress !== null ? scrubProgress : progress} isPlaying={isPlaying} />
                 </div>

                 <span className="w-9 md:w-12">{formatTime(track.duration)}</span>
              </div>
           </div>
        </div>

        {/* Phones: tapping the player behind the open sheet tucks the sheet away */}
        {sheetOpen && (
          <div className="md:hidden fixed inset-0 z-[35]" onClick={(e) => { e.stopPropagation(); setSheetOpen(false); }} aria-hidden="true" />
        )}

        {/* 2. RIGHT: Tracklist, Lyrics & Queue Tabs */}
        <div
          ref={sheetRef}
          data-sheet
          style={isMobile ? { transform: sheetTransform(sheetOpen) } : undefined}
          className={`${currentTab === 'inmersion' ? 'hidden' : 'flex'} group/list max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:h-[88dvh] max-md:rounded-t-[28px] max-md:border-t max-md:border-white/10 max-md:bg-black/45 max-md:backdrop-blur-3xl max-md:backdrop-saturate-150 max-md:shadow-[0_-20px_60px_rgba(0,0,0,0.5)] max-md:transition-transform max-md:duration-500 w-full md:w-[48%] md:h-full shrink-0 relative overflow-hidden flex-col md:pt-[calc(19vh+14px)] pb-0 md:pb-[3vh] md:transition-transform md:ease-[cubic-bezier(0.32,0.72,0,1)] ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'md:translate-y-0 md:duration-700 md:delay-75' : 'md:translate-y-10 md:duration-300'}`}
        >
           {/* Phones: grab handle — tap or drag to open/close the sheet */}
           <div
             className="md:hidden shrink-0 flex flex-col items-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
             onPointerDown={onSheetHandleDown}
             onPointerMove={onSheetHandleMove}
             onPointerUp={onSheetHandleUp}
             onPointerCancel={onSheetHandleUp}
             role="button"
             aria-label={sheetOpen ? 'Ocultar lista' : 'Mostrar pistas, letra y cola'}
           >
             <span className="w-11 h-1.5 rounded-full bg-white/40" />
           </div>
           <ListScrollbar containerRef={rightScrollRef} onBounce={rightBounce} springY={rightSpringY} className="hidden md:flex right-8 xl:right-12 top-[calc(19vh+14px)] bottom-[3vh]" />
           <TrackMenu
             track={rowMenu?.track ?? null}
             album={rowMenu?.album ?? album}
             anchor={rowMenu?.anchor ?? null}
             onClose={() => setRowMenu(null)}
             trailingItems={rowMenu?.inQueue ? [{ label: 'Eliminar de la cola', icon: <ListX className="w-4 h-4" />, onSelect: () => playback.removeFromQueue(rowMenu.track.id), danger: true }] : []}
           />
           {/* Top Tabs (PISTAS / LETRA / COLA) - Left-aligned Liquid Glass Pill */}
           {/* a fixed 4.5rem above the list (which starts at 19vh), so the gap is the same on any screen height */}
           <div className="md:absolute md:top-[calc(19vh-4.5rem)] md:left-6 md:right-12 xl:left-4 xl:right-[8rem] w-full md:w-auto mb-6 md:mb-0 shrink-0 z-40 flex items-center justify-between gap-3 px-5 md:px-0">
              <div className="rounded-full p-1.5 w-[290px] sm:w-[330px] md:w-auto md:flex-1 md:min-w-0 md:max-w-[385px] bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300">
                <LiquidTabs
                  value={currentTab}
                  onChange={handleTabSelect}
                  tabs={[
                    { id: 'pistas', label: (album as any)?.isSongRadio ? 'Similares' : 'Pistas', title: (album as any)?.isSongRadio ? 'Mostrar canciones similares' : 'Mostrar pistas del álbum', icon: <ListMusic className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" /> },
                    { id: 'letra', label: 'Letra', title: 'Mostrar letra sincronizada', icon: <Mic2 className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" /> },
                    { id: 'cola', label: 'Cola', title: 'Mostrar cola de reproducción', icon: <ListOrdered className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" /> },
                  ]}
                />
              </div>
              {!isMobile && currentTab !== 'inmersion' && immersionToggle(true)}
           </div>

           {/* Tab Content: PISTAS, LETRA or COLA with Apple Rubber Band & Smooth Top-to-Bottom Cascade */}
           <div
             ref={rightScrollRef}
             {...rightScrollProps}
             onWheel={(e) => { const el = e.currentTarget; if (el.scrollHeight > el.clientHeight + 1) rightScrollProps.onWheel(e); }}
             onTouchMove={(e) => { const el = e.currentTarget; if (el.scrollHeight > el.clientHeight + 1) rightScrollProps.onTouchMove(e); }}
             className={`relative w-full flex-1 overflow-y-auto overscroll-y-contain flex flex-col justify-start px-5 md:pr-12 xl:pr-[8rem] pb-12 pt-0 scrollbar-hide ${currentTab === 'letra' ? 'md:-ml-3 md:pl-9 xl:pl-7' : 'md:pl-6 xl:pl-4'}`}
             style={{
               scrollbarWidth: 'none',
               maskImage: currentTab === 'letra'
                 ? 'linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%)'
                 : 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 24px), transparent 100%)',
               WebkitMaskImage: currentTab === 'letra'
                 ? 'linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%)'
                 : 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 24px), transparent 100%)'
             }}
           >
             <motion.div style={{ y: rightSpringY }} className={`w-full ${currentTab === 'pistas' ? '-mt-[10px]' : 'pt-3'}`}>
               <AnimatePresence mode="wait">
                 {currentTab === 'letra' && (
                   <motion.div
                     key="letra"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col justify-start"
                   >
                     {loadingLyrics && (!activeLyrics || activeLyrics.length === 0) ? (
                       <div className="flex flex-col gap-10 pt-16 md:pt-24 animate-pulse px-2">
                         <div className="h-10 sm:h-12 bg-white/10 rounded-2xl w-3/4 blur-sm" />
                         <div className="h-12 sm:h-14 bg-white/20 rounded-2xl w-1/2 blur-none" />
                         <div className="h-10 sm:h-12 bg-white/10 rounded-2xl w-5/6 blur-sm" />
                         <div className="h-10 sm:h-12 bg-white/10 rounded-2xl w-2/3 blur-sm" />
                       </div>
                     ) : activeLyrics && activeLyrics.length > 0 ? (
                       <div
                         ref={lyricsContainerRef}
                         className="relative w-full h-full pt-16 md:pt-24 pb-[45dvh] flex flex-col gap-8 md:gap-11 lg:gap-14"
                       >
                         {activeLyrics.map((line, i) => {
                           const isActive = i === activeIndex;
                           const isPast = i < activeIndex;
                           return (
                             <motion.div
                               key={`${line.time}-${i}`}
                               data-active-lyric={isActive ? 'true' : undefined}
                               onClick={() => {
                                 if (onSeek && durationSecs > 0) {
                                   onSeek(Math.min(1, Math.max(0, line.time / durationSecs)));
                                 }
                               }}
                               className={`text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer transform origin-left ${
                                 isActive
                                   ? 'text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] leading-[1.25] tracking-tight scale-[1.03] opacity-100 blur-none drop-shadow-[0_2px_14px_rgba(255,255,255,0.38)]'
                                   : 'text-white/35 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] leading-[1.25] tracking-tight scale-[0.98] blur-[1.2px] md:blur-[1.6px] hover:text-white/75 hover:blur-none hover:scale-[1.0]'
                               }`}
                             >
                               {line.text}
                             </motion.div>
                           );
                         })}
                       </div>
                     ) : (
                       <motion.div variants={cascadedItemVariants} className="flex flex-col items-center justify-center py-28 text-center px-4">
                         <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4 shadow-xl">
                           <Mic2 className="w-8 h-8" />
                         </div>
                         <p className="text-white/80 text-xl font-bold tracking-tight">Letra no disponible</p>
                         <p className="text-white/40 text-sm mt-1.5 max-w-sm">No encontramos la letra sincronizada para esta canción.</p>
                       </motion.div>
                     )}
                   </motion.div>
                 )}

                 {currentTab === 'pistas' && (
                   <motion.div
                     key="pistas"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col"
                   >
                     {album.tracks?.map((t, i) => {
                       const isActive = track.id === t.id;
                       return (
                         <motion.div
                           key={t.id}
                           variants={cascadedItemVariants}
                           onClick={() => playback.playAlbum(album, t)}
                           onContextMenu={(e) => openRowMenu(e, t, album, false, true)}
                           className={`group py-1.5 md:py-2.5 text-lg md:text-3xl xl:text-4xl font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                             isActive
                               ? 'text-white translate-x-4'
                               : 'text-white/50 hover:text-white/80'
                           }`}
                         >
                           <div className="flex items-center gap-4 md:gap-6">
                             <div className="flex items-center relative min-w-[2.75rem] md:min-w-[3.5rem] shrink-0">
                               <button
                                 onClick={(e) => { e.stopPropagation(); toggleFavorite(t, album); }}
                                 className={`group/favbtn absolute left-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-1 cursor-pointer ${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100'}`}
                                 title={isFavorite(t.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                 aria-label={isFavorite(t.id) ? `Quitar ${t.title} de favoritos` : `Añadir ${t.title} a favoritos`}
                               >
                                 <span key={String(isFavorite(t.id))} className="pop-in inline-flex">
                                 {isFavorite(t.id) ? (
                                   <>
                                     <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                                     <HeartOff className="w-4 h-4 md:w-5 md:h-5 text-[#b066f8] hidden group-hover/favbtn:block" aria-hidden="true" />
                                   </>
                                 ) : (
                                   <Heart className="w-4 h-4 md:w-5 md:h-5 text-white/40 hover:text-white transition-colors" fill="none" aria-hidden="true" />
                                 )}
                                 </span>
                               </button>
                               <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 ${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} ${isActive ? 'text-[#e9d5ff]' : 'text-white/40'}`}>
                                 {(t.trackNumber || i + 1).toString().padStart(2, '0')}
                               </span>
                             </div>
                             <div className="flex flex-col flex-1 min-w-0">
                               <div className="flex items-center min-w-0">
                                 {isLicensed(t.id) && <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2 shrink-0" fill="currentColor" />}
                                 <MarqueeTitle text={t.title} slideOnHover />
                               </div>
                               {((album as any)?.isSongRadio || (t.artist && t.artist !== album.artist)) && (
                                 <span className={`text-xs md:text-sm font-medium tracking-wide truncate transition-colors ${isActive ? 'text-[#ebd5ff]/80' : 'text-white/40 group-hover:text-white/70'}`}>
                                   {t.artist}
                                 </span>
                               )}
                             </div>
                             {isActive && (
                               <NowPlayingToggle isPlaying={isPlaying} isLoading={isLoading} onToggle={togglePlay} className="ml-1 md:ml-2" />
                             )}
                             {renderRowActions(t, album, false)}
                           </div>
                         </motion.div>
                       );
                     })}
                   </motion.div>
                 )}

                 {currentTab === 'cola' && (
                   <motion.div
                     key="cola"
                     variants={tabListVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     className="w-full flex flex-col gap-6"
                   >
                     {/* Queue: one ordered list (played songs stay, the current one is highlighted) */}
                     <div className="flex flex-col gap-1">
                       <motion.div variants={cascadedItemVariants} className="flex items-center justify-between mb-2">
                         <span className="text-xs md:text-sm font-bold tracking-[0.22em] uppercase text-white">Tu cola</span>
                         <button
                           onClick={() => createPlaylist(playback.queueList.map(e => withAlbumInfo(e.track, e.album)))}
                           className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide text-white bg-white/[0.12] hover:bg-white/[0.2] backdrop-blur-2xl border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                           title="Crear una lista con toda la cola"
                         >
                           <ListPlus className="w-3.5 h-3.5" aria-hidden="true" />
                           Guardar como lista
                         </button>
                       </motion.div>
                       <Reorder.Group ref={queueGroupRef} axis="y" values={playback.queueList} onReorder={playback.reorderQueue} className="relative flex flex-col">
                       {playback.queueList.map((entry, idx) => {
                         const { track: t, album: from } = entry;
                         const isCurrent = idx === playback.queueIndex;
                         const isPlayed = idx < playback.queueIndex;
                         return (
                         <QueueReorderItem key={t.id} value={entry} constraintsRef={queueGroupRef}>{(controls) => (
                         <div
                           onClick={() => (isCurrent ? togglePlay() : playback.jumpTo(t.id))}
                           onContextMenu={(e) => openRowMenu(e, t, from, true, true)}
                           className={`group py-1.5 md:py-2.5 px-2 -mx-2 rounded-xl text-lg md:text-3xl xl:text-4xl font-bold cursor-pointer transition-colors duration-300 shrink-0 ${
                             isCurrent ? 'text-white bg-white/[0.06]' : isPlayed ? 'text-white/30 hover:text-white/70' : 'text-white/50 hover:text-white/80'
                           }`}
                         >
                           <div className="flex items-center gap-4 md:gap-6">
                             <div className="flex items-center relative min-w-[2.75rem] md:min-w-[3.5rem] shrink-0">
                               <button
                                 onClick={(e) => { e.stopPropagation(); toggleFavorite(t, from); }}
                                 className={`group/favbtn absolute left-0 transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full p-1 cursor-pointer ${isFavorite(t.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                                 title={isFavorite(t.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                 aria-label={isFavorite(t.id) ? `Quitar ${t.title} de favoritos` : `Añadir ${t.title} a favoritos`}
                               >
                                 {isFavorite(t.id) ? (
                                   <>
                                     <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7] block group-hover/favbtn:hidden" fill="currentColor" aria-hidden="true" />
                                     <HeartOff className="w-4 h-4 md:w-5 md:h-5 text-[#b066f8] hidden group-hover/favbtn:block" aria-hidden="true" />
                                   </>
                                 ) : (
                                   <Heart className="w-4 h-4 md:w-5 md:h-5 text-white/40 hover:text-white transition-colors" fill="none" aria-hidden="true" />
                                 )}
                               </button>
                               <span className={`text-base md:text-lg xl:text-xl font-medium tracking-widest transition-all duration-300 ${isFavorite(t.id) ? 'pl-8' : 'pl-0 group-hover:pl-8'} ${isCurrent ? 'text-[#e9d5ff]' : 'text-white/40'}`}>
                                 {(idx + 1).toString().padStart(2, '0')}
                               </span>
                             </div>
                             <div className="flex items-center flex-1 min-w-0">
                               {isLicensed(t.id) && <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2 shrink-0" fill="currentColor" />}
                               <MarqueeTitle text={t.title} slideOnHover />
                             </div>
                             {isCurrent && (
                               <NowPlayingToggle isPlaying={isPlaying} isLoading={isLoading} onToggle={togglePlay} />
                             )}
                             {renderRowActions(t, from, true)}
                             <button
                               onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); controls.start(e); }}
                               onClick={(e) => e.stopPropagation()}
                               className="w-9 h-9 -mr-1 flex items-center justify-center rounded-full text-white/40 hover:text-white touch-none cursor-grab active:cursor-grabbing shrink-0"
                               aria-label={`Arrastrar para mover ${t.title}`}
                               title="Arrastrar para cambiar el orden"
                             >
                               <GripVertical className="w-5 h-5" aria-hidden="true" />
                             </button>
                           </div>
                         </div>
                         )}</QueueReorderItem>
                       ); })}
                       </Reorder.Group>
                     </div>

                     {/* Autoplay suggestions: separate from the queue (YT Music style) */}
                     {playback.recommendations.length > 0 && (
                       <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
                         <motion.span variants={cascadedItemVariants} className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/40 mb-2">
                           Reproducción automática
                         </motion.span>
                         {playback.recommendations.map(({ track: t, album: from }) => (
                           <motion.div
                             key={`rec-${t.id}`}
                             variants={cascadedItemVariants}
                             onClick={() => playback.jumpTo(t.id)}
                             onContextMenu={(e) => openRowMenu(e, t, from, false, true)}
                             className="group flex items-center gap-4 py-2 px-2 -mx-2 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.05]"
                           >
                             <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-md overflow-hidden shrink-0 bg-white/5">
                               <img src={t.albumCover || from.coverUrl} alt="" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Play className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true" />
                               </div>
                             </div>
                             <div className="flex flex-col flex-1 min-w-0">
                               <span className="text-white/80 group-hover:text-white text-base md:text-lg font-semibold truncate transition-colors">{t.title}</span>
                               <span className="text-white/45 text-sm truncate">{t.artist}</span>
                             </div>
                             {renderRowActions(t, from, false)}
                             <span className="text-white/40 text-sm tabular-nums shrink-0 w-10 text-right">{formatTime(t.duration)}</span>
                           </motion.div>
                         ))}
                       </div>
                     )}
                   </motion.div>
                 )}

               </AnimatePresence>
             </motion.div>
           </div>
        </div>

        {/* 3. FULL IMMERSION CAVA STAGE */}
        {currentTab === 'inmersion' && (
          <div className={`absolute inset-0 z-40 flex flex-col justify-between overflow-hidden pt-5 md:pt-8 pb-0 select-none ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Top Area: Clean Song Title with Prev/Next buttons on Left and Right, and Artist */}
            <div className={`flex flex-col items-center justify-center text-center mt-1 md:mt-2 z-20 max-w-5xl mx-auto w-full px-4 md:px-8 ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              {/* Title row flanked by Prev and Next buttons */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-4xl">
                <button
                  onClick={onPrev}
                  className="p-3 md:p-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white backdrop-blur-2xl border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  title="Canción anterior"
                  aria-label="Canción anterior"
                >
                  <SkipBack className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                </button>

                <div className="flex-1 min-w-0 flex justify-center">
                  <AnimatedSongTitle
                    title={track.title}
                    trackId={track.id}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] text-center leading-[1.1] max-w-full"
                  />
                </div>

                <button
                  onClick={onNext}
                  className="p-3 md:p-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white backdrop-blur-2xl border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  title="Siguiente canción"
                  aria-label="Siguiente canción"
                >
                  <SkipForward className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                </button>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-white/75 font-semibold mt-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 flex-wrap">
                <span className="text-white uppercase tracking-wide">{track.artist || album.artist}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{track.albumTitle || playback.nowPlayingOrigin?.title || album.title}</span>
              </p>
            </div>

            {/* Center Area: Full Screen CAVA Bars Visualizer - click anywhere to play/pause */}
            <div
              className={`w-full flex-1 flex items-end justify-center relative min-h-[220px] md:min-h-[380px] pb-3 md:pb-4 select-none group/stage ${isExpanded ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
              onClick={isExpanded ? togglePlay : undefined}
              title={isExpanded ? (isPlaying ? "Clic para pausar" : "Clic para reproducir") : undefined}
              aria-label={isExpanded ? (isPlaying ? "Pausar música" : "Reproducir música") : undefined}
            >
              <CavaVisualizer
                audioElement={audioElement ?? null}
                isPlaying={isPlaying}
                settings={cavaSettings}
                dominantColor={dominantColor}
              />
            </div>

            {/* Bottom: Thick Full-Width Timeline stuck to the very bottom */}
            <div className={`w-full relative z-30 select-none group/timeline ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              {/* Time Indicators above timeline */}
              <div className="flex justify-between items-center px-4 md:px-8 pb-1.5 text-xs font-mono font-medium text-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="tracking-wider">{formatTime((scrubProgress !== null ? scrubProgress : progress) * track.duration)}</span>
                <span className="tracking-wider text-white/40">{formatTime(track.duration)}</span>
              </div>

              {/* Thick full-width timeline bar with instant, ultra-fluid pointer capture */}
              <div
                className="relative w-full h-8 flex items-end cursor-pointer touch-none group/scrub"
                onPointerDown={handleTimelinePointerDown}
                onPointerMove={handleTimelinePointerMove}
                onPointerUp={handleTimelinePointerUp}
                onPointerCancel={handleTimelinePointerUp}
                title="Línea de tiempo"
                aria-label="Buscar en la canción"
              >
                <div className="w-full h-3 md:h-3.5 bg-white/15 group-hover/scrub:bg-white/25 transition-colors relative overflow-hidden">
                  <div
                    className="h-full bg-white relative shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                    style={{
                      width: `${Math.min(100, Math.max(0, (scrubProgress !== null ? scrubProgress : progress) * 100))}%`,
                      transition: scrubProgress !== null ? 'none' : 'width 0.1s linear',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAVA Settings Modal */}
        <CavaSettingsModal
          isOpen={isCavaSettingsOpen}
          onClose={() => setIsCavaSettingsOpen(false)}
          settings={cavaSettings}
          onUpdateSettings={handleUpdateCavaSettings}
          onReset={handleResetCavaSettings}
        />

      </div>
    </>,
    document.body
  );
};