import { ArtistView } from "./ArtistView";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from './Sidebar';
import { MiniPlayer } from './MiniPlayer';
import { CatalogView, resetCatalogSection } from './CatalogView';
import { AlbumView } from './AlbumView';
import { DownloadsView } from './DownloadsView';
import { LibraryView } from './LibraryView';
import { ImmersivePlayer } from './ImmersivePlayer';
import { LyricsSidebar } from './LyricsSidebar';
import { ToastContainer } from './ToastContainer';
import { useCatalog } from './useCatalog';
import { Onboarding } from './Onboarding';
import { AdminDashboard } from '../admin/AdminDashboard';
import { AdminEditProvider } from '../admin/AdminEditContext';
import { AdminEditModal } from '../admin/AdminEditModal';
import { AdminEditFloatingBar } from '../admin/AdminEditWidgets';
import { useProfile } from '../../lib/useProfile';
import { recordListen } from '../../lib/listenHistory';
import { ProfileDialog } from './ProfileDialog';
import { signOutUser } from '../../lib/userStorage';
import { genreScore } from '../../lib/genres';
import type { Album, Track } from './types';
import { DownloadsProvider } from './DownloadsContext';
import { PlaylistsProvider, isPlaylistAlbum } from './PlaylistsContext';
import { buildSongRadio, isSongRadioAlbum } from './songRadio';
import { PlaybackContext, type QueueEntry } from './PlaybackContext';
import { PlayerLoadingScreen } from './PlayerLoadingScreen';
import { Heart, Pencil } from 'lucide-react';
import { MobileTabBar } from './MobileTabBar';
import { useIsMobile, useIsCompact } from './useIsMobile';
import { useRubberBand } from '../ui/useRubberBand';
import { audioVisualizer } from './audioVisualizer';
import { GeneralSettingsModal, type SettingsTabId } from './GeneralSettingsModal';
import {
  loadGeneralSettings,
  saveGeneralSettings,
  applyGeneralSettingsToDOM,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_SHORTCUTS,
  formatKeyName,
  getAvailableStorageGB,
  type GeneralSettings,
} from './generalSettingsTypes';
import { cardStyle, titleStyle } from '../auth/authUi';

export const MainApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  const { containerRef: mainScrollRef, springValue: springMainY, scrollProps: mainScrollProps } = useRubberBand({ axis: 'y' });

  const [currentView, setCurrentView] = useState<string>("catalog");
  const [selectedArtist, setSelectedArtist] = useState<{name: string, img: string, type?: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();   // phone layout (header, mini player, lyrics)
  const isCompact = useIsCompact(); // phones + tablets: the sidebar is an overlay drawer
  const [drawerReady, setDrawerReady] = useState(false);
  useEffect(() => {
    if (!isSidebarOpen) { setDrawerReady(false); return; }
    const t = setTimeout(() => setDrawerReady(true), 450);
    return () => clearTimeout(t);
  }, [isSidebarOpen]);

  // Phones and tablets start with the drawer closed; desktop keeps the sidebar open.
  React.useLayoutEffect(() => {
    setIsSidebarOpen(!isCompact);
  }, [isCompact]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [immersiveTab, setImmersiveTab] = useState<"pistas" | "letra" | "cola" | "inmersion">("pistas");
  const consecutivePlaysRef = useRef<{ trackId: number | string | null, count: number }>({ trackId: null, count: 0 });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabId>('appearance');
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(loadGeneralSettings);
  const generalSettingsRef = useRef(generalSettings);
  useEffect(() => {
    generalSettingsRef.current = generalSettings;
  }, [generalSettings]);

  useEffect(() => {
    applyGeneralSettingsToDOM(generalSettings);
  }, []);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const { albums, loading, fetchAlbumDetails } = useCatalog(supabaseUrl, supabaseAnonKey);

  // account: the profile card opens right after the first sign-in, and the tastes it collects reorder the home
  const { user, profile, isAdmin, ready: profileReady, reload: reloadProfile } = useProfile();
  const [onboarding, setOnboarding] = useState(false);
  const [pickedGenres, setPickedGenres] = useState<string[] | null>(null);
  const likedGenres: string[] = pickedGenres ?? (user?.user_metadata?.genres as string[] | undefined) ?? [];
  const personalized = likedGenres.length > 0;
  const orderedAlbums = useMemo(
    () => (personalized ? [...albums].sort((a, b) => genreScore(b.genres, likedGenres) - genreScore(a.genres, likedGenres)) : albums),
    [albums, personalized, likedGenres.join(',')]
  );
  useEffect(() => { if (profileReady && user && profile && !profile.username) setOnboarding(true); }, [profileReady, user, profile]);
  useEffect(() => { if (!user) setPickedGenres(null); }, [user]);
  // dev only: /player?onboarding=preview shows the card without an account or saving anything
  const [previewOnboarding, setPreviewOnboarding] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('onboarding') === 'preview') {
      setPreviewOnboarding(true);
      setOnboarding(true);
    }
  }, []);
  const account = user
    ? { name: profile?.username ?? user.email?.split('@')[0] ?? 'Tú', avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null }
    : null;
  const [hasEntered, setHasEntered] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !hasEntered) {
      const timer = setTimeout(() => {
        setHasEntered(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, hasEntered]);

  // Lock background scroll (both vertical and horizontal) when Config modal is open
  useEffect(() => {
    if (isConfigOpen) {
      const mainContainer = document.getElementById('main-scroll-container');
      const originalOverflow = mainContainer ? mainContainer.style.overflow : '';
      const originalOverflowX = mainContainer ? mainContainer.style.overflowX : '';
      const originalOverflowY = mainContainer ? mainContainer.style.overflowY : '';
      if (mainContainer) {
        mainContainer.style.overflow = 'hidden';
        mainContainer.style.overflowX = 'hidden';
        mainContainer.style.overflowY = 'hidden';
      }
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyOverflowX = document.body.style.overflowX;
      const originalBodyOverflowY = document.body.style.overflowY;
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'hidden';

      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalHtmlOverflowX = document.documentElement.style.overflowX;
      const originalHtmlOverflowY = document.documentElement.style.overflowY;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'hidden';

      // Also freeze all horizontal carousels while modal is open
      const scrollableElements = document.querySelectorAll('.overflow-x-auto');
      const originalListStyles: Array<{ el: HTMLElement; overflowX: string }> = [];
      scrollableElements.forEach((node) => {
        const el = node as HTMLElement;
        originalListStyles.push({ el, overflowX: el.style.overflowX });
        el.style.overflowX = 'hidden';
      });

      // Intercept wheel and touchmove events outside the modal card or horizontal events inside it
      const handleGlobalWheel = (e: WheelEvent) => {
        const modalCard = document.getElementById('config-modal-card');
        if (!modalCard || !modalCard.contains(e.target as Node)) {
          // Outside modal: completely prevent wheel scroll
          e.preventDefault();
        } else {
          // Inside modal: prevent any horizontal trackpad swipe or Shift-wheel
          if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
            e.preventDefault();
          }
        }
      };

      const handleGlobalTouchMove = (e: TouchEvent) => {
        const modalCard = document.getElementById('config-modal-card');
        if (!modalCard || !modalCard.contains(e.target as Node)) {
          e.preventDefault();
        }
      };

      window.addEventListener('wheel', handleGlobalWheel, { passive: false });
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

      return () => {
        if (mainContainer) {
          mainContainer.style.overflow = originalOverflow;
          mainContainer.style.overflowX = originalOverflowX;
          mainContainer.style.overflowY = originalOverflowY;
        }
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.overflowX = originalBodyOverflowX;
        document.body.style.overflowY = originalBodyOverflowY;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.documentElement.style.overflowX = originalHtmlOverflowX;
        document.documentElement.style.overflowY = originalHtmlOverflowY;

        originalListStyles.forEach(({ el, overflowX }) => {
          el.style.overflowX = overflowX;
        });

        window.removeEventListener('wheel', handleGlobalWheel);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
      };
    }
  }, [isConfigOpen]);

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumFull, setSelectedAlbumFull] = useState<Album | null>(null);

  const [nowPlayingTrack, setNowPlayingTrack] = useState<Track | null>(null);
  const [nowPlayingAlbum, setNowPlayingAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestIdRef = useRef(0);
  const volumeFadeRef = useRef<{ cancel: () => void } | null>(null);
  const seekFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);

  /**
   * Fades audio volume smoothly to targetNormalized [0..1] over durationMs.
   * Modulates both Web Audio hardware GainNode and HTMLAudioElement.volume.
   */
  const fadeAudioVolume = (targetNormalized: number, durationMs: number = 180): Promise<void> => {
    return new Promise((resolve) => {
      if (volumeFadeRef.current) {
        volumeFadeRef.current.cancel();
        volumeFadeRef.current = null;
      }

      const audio = audioRef.current;
      const masterVol = volume / 100;
      const targetVol = Math.max(0, Math.min(1, targetNormalized * masterVol));

      audioVisualizer.fadeGain(targetNormalized, durationMs / 1000);

      if (!audio || durationMs <= 10 || Math.abs(audio.volume - targetVol) < 0.01) {
        if (audio) audio.volume = targetVol;
        resolve();
        return;
      }

      const startVol = audio.volume;
      const startTime = performance.now();
      let isCancelled = false;

      volumeFadeRef.current = {
        cancel: () => {
          isCancelled = true;
        }
      };

      const step = (now: number) => {
        if (isCancelled) {
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / durationMs);
        const eased = 0.5 - 0.5 * Math.cos(p * Math.PI);
        audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * eased));

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          audio.volume = targetVol;
          volumeFadeRef.current = null;
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  };

  /**
   * Safe seek with micro-ducking fade to eliminate pops, clicks, and buffer cuts across all players.
   */
  const handleSeek = (p: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const targetTime = Math.max(0, Math.min(audio.duration, p * audio.duration));

    // Duck volume to near silence (35ms) on scrub start to eliminate any pops
    if (!isSeekingRef.current) {
      isSeekingRef.current = true;
      fadeAudioVolume(0.04, 35);
    }

    audio.currentTime = targetTime;
    setProgress(p);

    if (seekFadeTimeoutRef.current) {
      clearTimeout(seekFadeTimeoutRef.current);
    }

    // Settle timer: smoothly fade back up to full master volume
    seekFadeTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      fadeAudioVolume(1.0, 95);
    }, 65);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      fadeAudioVolume(0, 80);
    } else {
      const restored = prevVolume > 0 ? prevVolume : 100;
      setVolume(restored);
      fadeAudioVolume(1.0, 100);
    }
  };

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (nowPlayingTrack) {
      const artist = nowPlayingAlbum?.artist || selectedAlbum?.artist || 'Bitszone';
      if (isPlaying || isAudioLoading) {
        document.title = `▶ ${nowPlayingTrack.title} • ${artist}`;
      } else {
        document.title = `⏸ Canción pausada: ${nowPlayingTrack.title} • ${artist}`;
      }
      return;
    }

    if (isConfigOpen) {
      document.title = "Configuración • Bitszone";
      return;
    }

    switch (currentView) {
      case 'catalog':
        document.title = "Catálogo • Bitszone Web Player";
        break;
      case 'album': {
        const albumName = selectedAlbumFull?.title || selectedAlbum?.title;
        document.title = albumName ? `${albumName} — Álbum • Bitszone` : "Álbum • Bitszone";
        break;
      }
      case 'artist': {
        const artistName = selectedArtist?.name;
        document.title = artistName ? `${artistName} — Artista • Bitszone` : "Artista • Bitszone";
        break;
      }
      case 'downloads':
        document.title = "Mis Descargas • Bitszone";
        break;
      case 'library-playlists':
        document.title = "Playlists • Tu Biblioteca • Bitszone";
        break;
      case 'library-favorites':
        document.title = "Canciones Favoritas • Tu Biblioteca • Bitszone";
        break;
      case 'library-albums':
        document.title = "Álbumes guardados • Tu Biblioteca • Bitszone";
        break;
      case 'library-artists':
        document.title = "Artistas seguidos • Tu Biblioteca • Bitszone";
        break;
      default:
        if (currentView.startsWith('library')) {
          document.title = "Tu Biblioteca • Bitszone";
        } else {
          document.title = "Bitszone Web Player";
        }
        break;
    }
  }, [nowPlayingTrack, isPlaying, nowPlayingAlbum, selectedAlbum, selectedAlbumFull, selectedArtist, currentView, isConfigOpen]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);

      // Track consecutive plays for License caching
      const trackId = nowPlayingTrack?.id;
      if (trackId) {
        if (consecutivePlaysRef.current.trackId === trackId) {
          consecutivePlaysRef.current.count += 1;
        } else {
          consecutivePlaysRef.current = { trackId, count: 1 };
        }

        if (consecutivePlaysRef.current.count === 5) {
          window.dispatchEvent(new CustomEvent('add-license', { detail: { track: nowPlayingTrack, album: nowPlayingAlbum } }));
        }
      }


      if (repeatMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
        return;
      }

      handleNextRef.current?.();
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [nowPlayingAlbum, nowPlayingTrack, isShuffle, repeatMode]);

  // Ultra-fluid progress updates during playback (eliminates choppy jumps)
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let lastTime = 0;
    const smoothTick = (now: number) => {
      if (now - lastTime >= 40) {
        lastTime = now;
        if (audioRef.current && !audioRef.current.paused && audioRef.current.duration) {
          const curr = audioRef.current.currentTime;
          const dur = audioRef.current.duration;
          setProgress(curr / dur);

          // Smooth fade-out in final 1.8 seconds of song
          const remaining = dur - curr;
          if (remaining <= 1.8 && remaining > 0.05 && !isSeekingRef.current) {
            const endRatio = Math.max(0, Math.min(1, remaining / 1.8));
            fadeAudioVolume(endRatio, 60);
          }
        }
      }
      raf = requestAnimationFrame(smoothTick);
    };
    raf = requestAnimationFrame(smoothTick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);


  // Keyboard Shortcuts Refs
  const togglePlayRef = useRef<(() => void) | null>(null);
  const handlePrevRef = useRef<(() => void) | null>(null);
  const handleNextRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    togglePlayRef.current = togglePlay;
    handlePrevRef.current = handlePrevTrack;
    handleNextRef.current = handleNextTrack;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or using browser shortcuts (Ctrl/Cmd/Alt)
      if (
        (e.target instanceof HTMLInputElement && e.target.type !== 'range') ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }

      // If Config modal is open, only allow Escape to close it
      if (isConfigOpen) {
        if (e.code === 'Escape') {
          e.preventDefault();
          setIsConfigOpen(false);
        }
        return;
      }

      const sc = generalSettingsRef.current.shortcuts;

      if (e.code === 'Escape') {
        e.preventDefault();
        setIsShortcutsOpen(false);
        setIsConfigOpen(false);
        return;
      }

      if (e.code === sc.togglePlay) {
        e.preventDefault();
        togglePlayRef.current?.();
        return;
      }
      if (e.code === sc.prevTrack) {
        e.preventDefault();
        handlePrevRef.current?.();
        return;
      }
      if (e.code === sc.nextTrack) {
        e.preventDefault();
        handleNextRef.current?.();
        return;
      }
      if (e.code === sc.volumeUp) {
        e.preventDefault();
        setVolume(v => Math.min(100, v + 5));
        return;
      }
      if (e.code === sc.volumeDown) {
        e.preventDefault();
        setVolume(v => Math.max(0, v - 5));
        return;
      }
      if (e.code === sc.toggleLyrics) {
        e.preventDefault();
        setIsLyricsOpen(prev => !prev);
        return;
      }
      if (e.code === sc.toggleExpand) {
        e.preventDefault();
        setIsPlayerExpanded(prev => {
          if (!prev) setImmersiveTab("pistas");
          return !prev;
        });
        return;
      }
      if (e.code === sc.toggleRepeat) {
        e.preventDefault();
        setRepeatMode(m => m === 'off' ? 'all' : m === 'all' ? 'one' : 'off');
        return;
      }
      if (e.code === sc.toggleShuffle) {
        e.preventDefault();
        setIsShuffle(prev => !prev);
        return;
      }
      if (e.code === sc.toggleFavorite) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-favorite-current'));
        return;
      }
      if (e.code === sc.toggleMute) {
        e.preventDefault();
        toggleMute();
        return;
      }
      if (e.code === sc.openConfig) {
        e.preventDefault();
        setSettingsInitialTab('shortcuts');
        setIsConfigOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Where the album page's back arrow returns to (library, artist, catalog...)
  const viewBeforeAlbumRef = useRef('catalog');
  // Section highlighted in the sidebar/tab bar: album and artist pages belong to wherever you came from
  const [navSection, setNavSection] = useState('catalog');
  useEffect(() => {
    if (currentView !== 'album') viewBeforeAlbumRef.current = currentView;
    if (currentView !== 'album' && currentView !== 'artist') setNavSection(currentView);
  }, [currentView]);

  const handleSelectAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('album');
    // Playlists and song radios are built locally; AlbumView reads their live contents
    if (isPlaylistAlbum(album) || isSongRadioAlbum(album)) { setSelectedAlbumFull(album); return; }
    const fullAlbum = await fetchAlbumDetails(album.id);
    setSelectedAlbumFull(fullAlbum);
  };

  const handleSelectSongRadio = (track: Track, originAlbum: Album) => {
    const radioAlbum = buildSongRadio(track, originAlbum, albums);
    setSelectedAlbum(radioAlbum);
    setSelectedAlbumFull(radioAlbum);
    setCurrentView('album');
  };

  const handlePlaySongRadio = (track: Track, originAlbum: Album) => {
    const radioAlbum = buildSongRadio(track, originAlbum, albums);
    playAlbum(radioAlbum, radioAlbum.tracks?.[0] ?? track);
  };

  const findWorkingUrl = async (track: Track, album: Album): Promise<string | null> => {
    const rawTitle = track.title;
    const noFeat = rawTitle.replace(/\s*[\(\[]feat\..*?[\)\]]/i, '');
    const cleanChars = rawTitle.replace(/[?¿!¡]/g, '');

    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

    const bases = [
      rawTitle, toTitleCase(rawTitle),
      noFeat, toTitleCase(noFeat),
      cleanChars,
      rawTitle.toUpperCase(), rawTitle.toLowerCase(),
      "What Do You Mean Remix", "Where Are U Now",
      rawTitle + " (Remastered)", rawTitle + " (2018 Remaster)", rawTitle + " (1987 Version)",
      rawTitle + " (2015 Remaster)", rawTitle + " (Remaster)",
      rawTitle + " (Avicii By Avicii)", rawTitle.replace(' (Avicii By Avicii)', ''), rawTitle.replace(' ?', ''), rawTitle.replace('?', '')
    ];

    const numStr = track.trackNumber ? track.trackNumber.toString().padStart(2, '0') : '01';
    const numStrRaw = track.trackNumber ? track.trackNumber.toString() : '1';

    const prefixes = [
      '',
      `${numStr} - `, `${numStr} `, `${numStr}. `,
      `${numStrRaw} - `, `${numStrRaw} `, `${numStrRaw}. `
    ];

    const urls = [];
    for (const b of bases) {
      for (const p of prefixes) {
        urls.push(`${p}${b}`);
      }
    }

    const unique = [...new Set(urls)];
    const baseUrl = track.previewUrl.substring(0, track.previewUrl.lastIndexOf('/') + 1);

    // First try the original
    try {
      const res = await fetch(track.previewUrl, { method: 'HEAD' });
      if (res.status === 200) return track.previewUrl;
    } catch(e) {}

    // Then try fallbacks concurrently in batches
    for (let i = 0; i < unique.length; i += 10) {
      const batch = unique.slice(i, i + 10);
      const batchUrls = batch.flatMap(u => [baseUrl + encodeURIComponent(u) + '.mp3', baseUrl + encodeURIComponent(u) + '.m4a']);

      const results = await Promise.all(batchUrls.map(async u => {
        try {
          const r = await fetch(u, { method: 'HEAD' });
          if (r.status === 200) return u;
        } catch(e) {}
        return null;
      }));

      const found = results.find(r => r !== null);
      if (found) return found;
    }

    return null; // Return null if all fail so we can skip
  };

  // The queue is one ordered list (YT Music style): songs already played stay in it, `queueIndex` marks
  // the one playing. Tapping a single song starts a list with just that song; "play album" loads the album.
  const [queueList, setQueueList] = useState<QueueEntry[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  // How many entries right after the current one were added by hand (they play before the album continues)
  const [manualCount, setManualCount] = useState(0);
  const upNext = queueList.slice(queueIndex + 1);
  const toast = (msg: string) => window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));

  /** Insert `entry` at `offset` places after the current song, dropping any other copy of it. */
  const insertAfterCurrent = (entry: QueueEntry, offset: number) => {
    const current = queueList[queueIndex];
    const others = queueList.filter((e, i) => i === queueIndex || e.track.id !== entry.track.id);
    const cur = current ? others.indexOf(current) : -1;
    const at = Math.min(cur + 1 + offset, others.length);
    setQueueList([...others.slice(0, at), entry, ...others.slice(at)]);
    setQueueIndex(Math.max(0, cur));
  };

  // Autoplay suggestions (kept apart from the queue): same artist first, then the rest of the catalog,
  // in a stable order per song so the list doesn't reshuffle on every render.
  const recommendations: QueueEntry[] = (() => {
    if (!nowPlayingTrack) return [];
    const taken = new Set([nowPlayingTrack.id, ...queueList.map(e => e.track.id)]);
    const seed = nowPlayingTrack.id;
    const score = (id: number) => ((id * 9301 + seed * 49297) % 233280) / 233280;
    const pool = albums.flatMap(a => (a.tracks ?? []).map(track => ({ track, album: a })))
      .filter(e => !taken.has(e.track.id));
    const artist = nowPlayingTrack.artist;
    const sameArtist = pool.filter(e => e.track.artist === artist && e.album.id !== nowPlayingAlbum?.id);
    const others = pool.filter(e => e.track.artist !== artist);
    const sortByScore = (list: QueueEntry[]) => [...list].sort((a, b) => score(a.track.id) - score(b.track.id));
    return [...sortByScore(sameArtist).slice(0, 3), ...sortByScore(others)].slice(0, 12);
  })();

  const goToArtist = (album: Album) => {
    setIsPlayerExpanded(false);
    setSelectedArtist({ name: album.artist, img: album.coverUrl, type: album.artist.includes('Combo') || album.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista' });
    setCurrentView('artist');
  };

  type PlayOptions = { mode?: 'single' | 'context'; keepQueue?: boolean };

  const handlePlayTrack = async (track: Track, album: Album, opts: PlayOptions = {}) => {
    if (!opts.keepQueue) {
      if (opts.mode === 'context') {
        const tracks = album.tracks ?? [];
        setQueueList(tracks.map(t => ({ track: t, album })));
        setQueueIndex(Math.max(0, tracks.findIndex(t => t.id === track.id)));
      } else {
        setQueueList([{ track, album }]);
        setQueueIndex(0);
      }
      setManualCount(0);
    }
    playRequestIdRef.current += 1;
    const currentRequestId = playRequestIdRef.current;

    setIsAudioLoading(true);
    setNowPlayingTrack(track);
    setNowPlayingAlbum(album);
    if (user) recordListen(track, album);

    if (audioRef.current) {
      if (isPlaying) {
        await fadeAudioVolume(0, 200);
      }
      audioRef.current.pause();
      setIsPlaying(false);

      const workingUrl = await findWorkingUrl(track, album);

      // Abort if user clicked another track while we were finding the URL
      if (currentRequestId !== playRequestIdRef.current) {
         return;
      }

      if (!workingUrl) {
        setIsAudioLoading(false);
        console.warn("Track unplayable, skipping:", track.title);
        audioRef.current.removeAttribute('src'); // Clear the src so we don't accidentally play the previous track
        audioRef.current.load();
        // Skip to whatever is next (queue or autoplay) unless the user already picked another track
        setTimeout(() => {
          if (currentRequestId === playRequestIdRef.current) handleNextRef.current?.();
        }, 500);
        return;
      }

      if (audioRef.current.src !== workingUrl) {
        audioRef.current.src = workingUrl;
      }

      // Start new track silently and fade in smoothly
      audioRef.current.volume = 0;
      audioVisualizer.setGainInstant(0);

      audioRef.current.play().then(() => {
         if (currentRequestId === playRequestIdRef.current) {
           setIsPlaying(true);
           setIsAudioLoading(false);
           fadeAudioVolume(1.0, 320); // 320ms smooth crossfade in
         }
      }).catch((err) => {
         console.error(err);
         if (currentRequestId === playRequestIdRef.current) setIsAudioLoading(false);
      });
    }
  };

  const playAlbum = (album: Album, startTrack?: Track) => {
    const first = startTrack ?? album.tracks?.[0];
    if (first) handlePlayTrack(first, album, { mode: 'context' });
  };

  /** Play the entry at `index` of `list`, keeping the list as the queue. */
  const playAt = (list: QueueEntry[], index: number) => {
    const entry = list[index];
    if (!entry) return;
    setQueueList(list);
    setQueueIndex(index);
    handlePlayTrack(entry.track, entry.album, { keepQueue: true });
  };

  const handleNextTrack = () => {
    if (!nowPlayingTrack) return;
    const remaining = queueList.length - queueIndex - 1;

    // Shuffle picks any song of the queue (other than the current one); with a single song it repeats it
    if (isShuffle && queueList.length > 0) {
      if (queueList.length === 1) { playAt(queueList, 0); return; }
      let pick = Math.floor(Math.random() * (queueList.length - 1));
      if (pick >= queueIndex) pick += 1;
      playAt(queueList, pick);
      return;
    }

    if (remaining > 0) {
      playAt(queueList, queueIndex + 1);
      setManualCount(Math.max(0, manualCount - 1));
      return;
    }
    if (repeatMode === 'all' && queueList.length > 1) {
      playAt(queueList, 0);
      return;
    }
    // Queue finished: keep the music going with the first suggestion (it joins the queue)
    const auto = recommendations[0];
    if (auto) playAt([...queueList, auto], queueList.length);
  };

  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;

    // Rule: If playing for more than 5 seconds, restart song. If less than 5 seconds, go to previous track.
    if (audioRef.current && audioRef.current.currentTime >= 5) {
      fadeAudioVolume(0, 140).then(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setProgress(0);
          if (!isPlaying) {
            audioRef.current.volume = 0;
            audioVisualizer.setGainInstant(0);
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              fadeAudioVolume(1.0, 260);
            }).catch(console.error);
          } else {
            fadeAudioVolume(1.0, 260);
          }
        }
      });
      return;
    }

    if (queueIndex > 0) {
      playAt(queueList, queueIndex - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const nowPlayingOrigin: Album | null = (() => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return null;
    if (!isPlaylistAlbum(nowPlayingAlbum) && !isSongRadioAlbum(nowPlayingAlbum)) return nowPlayingAlbum;
    const found = albums.find(a => String(a.id) === String(nowPlayingTrack.albumId) || a.title === nowPlayingTrack.albumTitle);
    if (found) return found;
    return {
      id: (nowPlayingTrack.albumId ?? nowPlayingTrack.albumTitle ?? 'unknown') as any,
      title: nowPlayingTrack.albumTitle || nowPlayingTrack.title || '',
      artist: nowPlayingTrack.artist,
      coverUrl: nowPlayingTrack.albumCover || '',
      year: nowPlayingTrack.albumYear || '',
      genre: '',
      trackCount: 0
    };
  })();

  const currentViewingAlbum = selectedAlbumFull || selectedAlbum;
  const albumBackgroundCover = (() => {
    if (!currentViewingAlbum) return '';
    const isSongRadio = isSongRadioAlbum(currentViewingAlbum);
    if (isSongRadio) {
      // same rule as AlbumView: follow the playing song only while this radio is what's playing
      const radioIsPlaying = queueList[queueIndex]?.album?.id === currentViewingAlbum.id;
      const activeTrack = (radioIsPlaying && currentViewingAlbum.tracks?.find(t => t.id === nowPlayingTrack?.id))
        || currentViewingAlbum.tracks?.[0];
      return activeTrack?.albumCover || currentViewingAlbum.coverUrl || '';
    }
    return currentViewingAlbum.coverUrl || '';
  })();

  const playback = {
    nowPlayingTrackId: nowPlayingTrack?.id,
    progress,
    nowPlayingOrigin,
    upNext,
    recommendations,
    playAlbum,
    queueList,
    queueIndex,
    playNext: (track: Track, album: Album) => {
      if (!nowPlayingTrack) { handlePlayTrack(track, album); return; }
      if (track.id === nowPlayingTrack.id) return;
      insertAfterCurrent({ track, album }, 0);
      setManualCount(c => c + 1);
      toast(`'${track.title}' sonará a continuación`);
    },
    addToQueue: (track: Track, album: Album) => {
      if (!nowPlayingTrack) { handlePlayTrack(track, album); return; }
      if (track.id === nowPlayingTrack.id) return;
      // Always goes to the very end of the queue ("Reproducir a continuación" is the one that plays next)
      insertAfterCurrent({ track, album }, Number.MAX_SAFE_INTEGER);
      toast(`'${track.title}' añadida al final de la cola`);
    },
    removeFromQueue: (trackId: number) => {
      const pos = queueList.findIndex(e => e.track.id === trackId);
      if (pos < 0) return;
      const list = queueList.filter((_, i) => i !== pos);
      if (pos > queueIndex && pos <= queueIndex + manualCount) setManualCount(c => Math.max(0, c - 1));
      if (pos < queueIndex) { setQueueList(list); setQueueIndex(queueIndex - 1); }
      else if (pos > queueIndex) setQueueList(list);
      // Removing the song that's playing moves on to the next one
      else if (list[queueIndex]) playAt(list, queueIndex);
      else if (list.length) playAt(list, list.length - 1);
    },
    reorderQueue: (entries: QueueEntry[]) => {
      setQueueList(entries);
      const cur = entries.findIndex(e => e.track.id === nowPlayingTrack?.id);
      if (cur >= 0) setQueueIndex(cur);
    },
    jumpTo: (trackId: number) => {
      const pos = queueList.findIndex(e => e.track.id === trackId);
      if (pos >= 0) {
        if (pos > queueIndex) setManualCount(Math.max(0, manualCount - (pos - queueIndex)));
        playAt(queueList, pos);
        return;
      }
      // An autoplay suggestion joins the queue right after the current song
      const rec = recommendations.find(e => e.track.id === trackId);
      if (rec) {
        const list = [...queueList.slice(0, queueIndex + 1), rec, ...queueList.slice(queueIndex + 1)];
        playAt(list, queueIndex + 1);
      }
    },
    goToAlbum: (album: Album) => { setIsPlayerExpanded(false); handleSelectAlbum(album); },
    goToArtist,
  };

  const togglePlay = async () => {
    if (!audioRef.current || !nowPlayingTrack) return;
    if (isPlaying) {
      await fadeAudioVolume(0, 140);
      audioRef.current.pause();
      setIsPlaying(false);
      setIsAudioLoading(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.volume = 0;
      audioVisualizer.setGainInstant(0);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsAudioLoading(false);
        fadeAudioVolume(1.0, 220);
      }).catch((e) => {
        console.error(e);
        setIsAudioLoading(false);
      });
    }
  };

  // On phones the sidebar is an overlay drawer, so the glass frame never reserves room for it.
  // On desktop, the sidebar is either expanded (256px) or compact (72px).
  const sidebarInFlow = !isCompact;
  const sidebarW = isCompact ? 0 : (isSidebarOpen ? 256 : 72);
  const cornerR = sidebarInFlow ? 24 : 0.01;
  const headerH = 56;

  const navigate = (view: string) => {
    if (view === 'catalog') resetCatalogSection();
    setCurrentView(view);
    if (isCompact) setIsSidebarOpen(false);
  };

  return (
    <AdminEditProvider isAdmin={isAdmin} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
    <DownloadsProvider>
    <PlaylistsProvider>
    <PlaybackContext.Provider value={playback}>
      <ToastContainer />
      <AdminEditModal />
      <AnimatePresence>
        {loading && <PlayerLoadingScreen />}
      </AnimatePresence>
      <div id="player-app-root" className="w-full app-viewport-height bg-[#050505] text-white font-inter overflow-clip flex flex-col relative [-webkit-tap-highlight-color:transparent] scrollbar-hide">
      {/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className={`absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0 transition-opacity duration-700 ${['album', 'downloads', 'library', 'artist'].includes(currentView) ? 'opacity-0' : 'opacity-100'}`}></div>

      {/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'album' && currentViewingAlbum ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-black/45 z-10"></div>
        <AnimatePresence>
          {albumBackgroundCover && (
            <motion.div
              key={albumBackgroundCover}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center blur-[120px] scale-125 saturate-150"
              style={{ backgroundImage: `url(${albumBackgroundCover})` }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Artist Background Glow */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'artist' && selectedArtist ? 'opacity-50' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'artist' && selectedArtist ? `url(${selectedArtist.img})` : 'none' }}></div>
      </div>

      {/* Downloads View Background Glow */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'downloads' ? 'opacity-40' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-[#a855f7] to-[#3b82f6]"></div>
      </div>

      {/* Library Views Background Glows */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'library' || currentView === 'library-favorites' ? 'opacity-40' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-pink-500 to-purple-600"></div>
      </div>
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'library-playlists' ? 'opacity-40' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-green-400 to-emerald-500"></div>
      </div>
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'library-licenses' ? 'opacity-40' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-yellow-400 to-amber-500"></div>
      </div>

      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

      {/* SEAMLESS GLASS LAYER for Sidebar */}
      <div
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden transition-opacity duration-700"
        style={{ opacity: loading ? 0 : 1 }}
      >
        {!isCompact && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-black/30 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${sidebarW}px` }}
          />
        )}
      </div>

      <AnimatePresence>
        {hasEntered && onboarding && (user || previewOnboarding) && (
          <Onboarding
            key="onboarding"
            userId={user?.id ?? 'preview'}
            userMeta={user?.user_metadata}
            preview={!user}
            isAdmin={isAdmin}
            onDone={(r) => { setPickedGenres(r.genres); setOnboarding(false); reloadProfile(); }}
          />
        )}
      </AnimatePresence>

      {/* Main Container - Sidebar Flush, Body Floating */}
      <div className="w-full h-full flex overflow-hidden relative">
        {/* Phones and tablets: dimmed backdrop behind the drawer; tapping it closes the drawer */}
        {isCompact && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
            className={`fixed inset-0 z-[55] bg-black/60 transition-opacity duration-300 ${isSidebarOpen ? (drawerReady ? 'opacity-100' : 'opacity-100 pointer-events-none') : 'opacity-0 pointer-events-none'}`}
          />
        )}

        {/* Sidebar: flush left and pushing content on desktop; an overlay drawer on phones and tablets */}
        <div
          className={isCompact
            ? `fixed inset-y-0 z-[60] w-[min(82vw,300px)] bg-[#0b0712]/[0.97] border-white/10 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] right-0 border-l shadow-[-12px_0_32px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `h-full shrink-0 relative z-30 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-[72px]'}`}
          aria-hidden={isCompact && !isSidebarOpen ? true : undefined}
        >
          <motion.div
            initial={false}
            animate={{
              x: !hasEntered && loading ? -80 : 0,
              opacity: !hasEntered && loading ? 0 : 1
            }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full overflow-hidden"
          >
            {user && account && (
              <ProfileDialog
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                userId={user.id}
                email={user.email ?? ''}
                username={account.name}
                avatarUrl={account.avatarUrl}
                onSaved={reloadProfile}
                onSignOut={signOutUser}
              />
            )}
            <Sidebar
              currentView={navSection}
              onViewChange={navigate}
              onToggleShortcuts={() => setIsShortcutsOpen(!isShortcutsOpen)}
              onToggleConfig={() => {
                setSettingsInitialTab('appearance');
                setIsConfigOpen(!isConfigOpen);
                if (isCompact) setIsSidebarOpen(false);
              }}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isShortcutsOpen={isShortcutsOpen}
              isMobile={isCompact}
              isCollapsed={!isCompact && !isSidebarOpen}
              drawerOnRight={isCompact}
              account={account}
              onOpenProfile={() => { setProfileOpen(true); if (isCompact) setIsSidebarOpen(false); }}
              isAdmin={isAdmin}
            />
          </motion.div>
        </div>

        {/* Full-bleed Main Content container */}
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">
            {/* Split area for main scrollable content + right sidebar */}
            <div className="flex-1 relative flex min-h-0 z-10">
              {/* Actual scrollable content */}
              <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">


              <main
                id="main-scroll-container"
                ref={mainScrollRef}
                {...mainScrollProps}
                className="flex-1 overflow-y-auto overscroll-y-contain relative z-10 scrollbar-hide flex flex-col"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                <motion.div
                  style={{ y: springMainY }}
                  className={`min-h-full flex flex-col flex-auto shrink-0 ${(currentView === 'album' || currentView === 'artist') ? 'p-0' : 'pt-3 md:pt-4 pb-6 md:pb-0'}`}
                >
                  {currentView === 'catalog' && (
                    <CatalogView
                      albums={orderedAlbums}
                      personalized={personalized}
                      loading={loading}
                      isInitialEntrance={!hasEntered}
                      onSelectAlbum={handleSelectAlbum}
                      onSelectSong={handleSelectSongRadio}
                      onPlayTrack={handlePlayTrack}
                      onPlaySongRadio={handlePlaySongRadio}
                      onSelectArtist={(artist) => {
                        setSelectedArtist(artist);
                        setCurrentView('artist');
                      }}
                    />
                  )}
                  {currentView === 'album' && (
                    <AlbumView
                      album={selectedAlbumFull || selectedAlbum}
                      loading={!selectedAlbumFull}
                      onViewChange={(v) => setCurrentView(v === 'catalog' ? viewBeforeAlbumRef.current : v)}
                      onPlayTrack={handlePlayTrack}
                      nowPlayingTrackId={nowPlayingTrack?.id}
                      isPlaying={isPlaying}
                      togglePlay={togglePlay}
                    />
                  )}
                  {currentView === 'downloads' && <DownloadsView type="downloads" albums={albums} onPlayTrack={handlePlayTrack} onSelectAlbum={handleSelectAlbum} />}
                  {currentView.startsWith('library') && <LibraryView albums={albums} handlePlayTrack={handlePlayTrack} handleSelectAlbum={handleSelectAlbum} currentView={currentView} setCurrentView={setCurrentView} />}
                  {currentView === 'artist' && selectedArtist && (
                    <ArtistView
                      artist={selectedArtist}
                      albums={albums}
                      onBack={() => setCurrentView('catalog')}
                      onSelectAlbum={handleSelectAlbum}
                    />
                  )}
                  {currentView === 'dashboard' && (
                    <div className="flex-1 flex flex-col items-center justify-start py-4 px-3 md:px-6 w-full max-w-7xl mx-auto">
                      <AdminDashboard onBack={() => setCurrentView('catalog')} />
                    </div>
                  )}
                </motion.div>
              </main>

              {/* Fade-out gradients applied to the scrollable area bounds */}
              {/* Bottom gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20 ${(currentView === 'album' || currentView === 'artist' || currentView === 'dashboard') ? 'hidden' : ''}`}></div>
              {/* Right side gradient */}
              <div className={`hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-20 ${(currentView === 'album' || currentView === 'dashboard') ? '' : 'md:block'}`}></div>
              </div>

              {/* Right Lyrics Sidebar */}
              <div className={`hidden md:block h-full shrink-0 relative z-20 transition-all duration-300 overflow-hidden ${isLyricsOpen ? 'w-80' : 'w-0'}`}>
                <div className="w-80 h-full">
                  <LyricsSidebar track={nowPlayingTrack} album={nowPlayingAlbum} progress={progress} />
                </div>
              </div>
            </div>

            {/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
            <AnimatePresence>
              {nowPlayingTrack && nowPlayingAlbum && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: isPlayerExpanded ? 110 : 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 z-30 border-t border-white/5 bg-black/40 backdrop-blur-3xl"
                >
                  <MiniPlayer
                    isShuffle={isShuffle}
                    repeatMode={repeatMode}
                    onToggleShuffle={() => setIsShuffle(!isShuffle)}
                    onToggleRepeat={() => setRepeatMode(m => m === "off" ? "all" : m === "all" ? "one" : "off")}
                    track={nowPlayingTrack}
                    album={nowPlayingAlbum}
                    isPlaying={isPlaying}
                    togglePlay={togglePlay}
                    progress={progress}
                    volume={volume}
                    onExpand={() => {
                      setImmersiveTab("pistas");
                      setIsPlayerExpanded(true);
                    }}
                    isLyricsOpen={isLyricsOpen}
                    onToggleLyrics={() => {
                      if (isMobile) {
                        setImmersiveTab("letra");
                        setIsLyricsOpen(true);
                        setIsPlayerExpanded(true);
                      } else {
                        setIsLyricsOpen(!isLyricsOpen);
                      }
                    }}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                    onSeek={handleSeek}
                    onVolumeChange={(v) => {
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v / 100;
                    }}
                    onToggleMute={toggleMute}
                    onSelectAlbum={() => nowPlayingOrigin && handleSelectAlbum(nowPlayingOrigin)}
                    onSelectArtist={() => {
                      setSelectedArtist({ name: nowPlayingAlbum.artist, img: nowPlayingAlbum.coverUrl, type: nowPlayingAlbum.artist.includes('Combo') || nowPlayingAlbum.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista' });
                      setCurrentView('artist');
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <MobileTabBar currentView={navSection} onViewChange={navigate} onOpenMenu={() => setIsSidebarOpen(true)} menuOpen={isSidebarOpen} />
        </div>
      </div>

      <ImmersivePlayer
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setRepeatMode(m => m === "off" ? "all" : m === "all" ? "one" : "off")}
        activeTab={immersiveTab}
        onTabChange={(tab) => {
          setImmersiveTab(tab as any);
          setIsLyricsOpen(tab === "letra");
        }}
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        track={nowPlayingTrack}
        album={nowPlayingAlbum}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onPlayTrack={handlePlayTrack}
        volume={volume}
        progress={progress}
        setVolume={(v) => {
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v / 100;
        }}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onToggleMute={toggleMute}
        onSeek={handleSeek}
        audioElement={audioRef.current}
      />

      {/* Modals */}
      <AnimatePresence>
        <GeneralSettingsModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          initialTab={settingsInitialTab}
          settings={generalSettings}
          onUpdateSettings={(updater) => {
            setGeneralSettings(prev => {
              const next = updater(prev);
              saveGeneralSettings(next);
              applyGeneralSettingsToDOM(next);
              return next;
            });
          }}
          onResetAll={() => {
            setGeneralSettings(DEFAULT_GENERAL_SETTINGS);
            saveGeneralSettings(DEFAULT_GENERAL_SETTINGS);
            applyGeneralSettingsToDOM(DEFAULT_GENERAL_SETTINGS);
          }}
          onResetShortcuts={() => {
            setGeneralSettings(prev => {
              const next = { ...prev, shortcuts: DEFAULT_SHORTCUTS };
              saveGeneralSettings(next);
              return next;
            });
          }}
          availableGB={getAvailableStorageGB()}
          onClearCache={() => {
            try {
              sessionStorage.clear();
              if ('caches' in window) {
                caches.keys().then(names => names.forEach(n => caches.delete(n)));
              }
            } catch (_) {}
          }}
        />

        {isShortcutsOpen && (
          <motion.div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsShortcutsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                ...cardStyle,
                left: isCompact ? '16px' : isSidebarOpen ? '280px' : '96px',
              }}
              className="absolute bottom-[105px] w-[20.5rem] sm:w-[22rem] max-w-[calc(100vw-2rem)] rounded-3xl p-6 text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] transition-[left] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white" style={titleStyle}>
                    Atajos de teclado
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsShortcutsOpen(false);
                    setSettingsInitialTab('shortcuts');
                    setIsConfigOpen(true);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shrink-0"
                  title="Personalizar atajos en Configuración"
                  aria-label="Personalizar atajos en Configuración"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm text-white/75">
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Reproducir / Pausar</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.togglePlay)}</kbd>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Anterior / Siguiente</span>
                  <div className="flex gap-1.5 shrink-0">
                    <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm">{formatKeyName(generalSettings.shortcuts.prevTrack)}</kbd>
                    <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm">{formatKeyName(generalSettings.shortcuts.nextTrack)}</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Subir / Bajar volumen</span>
                  <div className="flex gap-1.5 shrink-0">
                    <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm">{formatKeyName(generalSettings.shortcuts.volumeUp)}</kbd>
                    <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm">{formatKeyName(generalSettings.shortcuts.volumeDown)}</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Expandir reproductor</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.toggleExpand)}</kbd>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Mostrar letra</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.toggleLyrics)}</kbd>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Modo repetir</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.toggleRepeat)}</kbd>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Modo aleatorio</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.toggleShuffle)}</kbd>
                </div>
                <div className="flex justify-between items-center gap-4 py-0.5">
                  <span className="font-medium text-white/90">Agregar a favoritos</span>
                  <kbd className="bg-white/10 text-white/95 px-2.5 py-1 rounded-lg font-mono text-xs border border-white/15 shadow-sm shrink-0">{formatKeyName(generalSettings.shortcuts.toggleFavorite)}</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PlaybackContext.Provider>
    </PlaylistsProvider>
    </DownloadsProvider>
    </AdminEditProvider>
  );
};
