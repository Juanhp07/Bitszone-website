import { ArtistView } from "./ArtistView";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MiniPlayer } from './MiniPlayer';
import { CatalogView } from './CatalogView';
import { AlbumView } from './AlbumView';
import { DownloadsView } from './DownloadsView';
import { LibraryView } from './LibraryView';
import { ImmersivePlayer } from './ImmersivePlayer';
import { LyricsSidebar } from './LyricsSidebar';
import { ToastContainer } from './ToastContainer';
import { useCatalog } from './useCatalog';
import type { Album, Track } from './types';
import { DownloadsProvider } from './DownloadsContext';
import { Heart } from 'lucide-react';

export const MainApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {

  const [currentView, setCurrentView] = useState<string>("catalog");
  const [selectedArtist, setSelectedArtist] = useState<{name: string, img: string, type?: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const consecutivePlaysRef = useRef<{ trackId: number | string | null, count: number }>({ trackId: null, count: 0 });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  
  const { albums, loading, fetchAlbumDetails } = useCatalog(supabaseUrl, supabaseAnonKey);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumFull, setSelectedAlbumFull] = useState<Album | null>(null);
  
  const [nowPlayingTrack, setNowPlayingTrack] = useState<Track | null>(null);
  const [nowPlayingAlbum, setNowPlayingAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestIdRef = useRef(0);

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 100);
      if (audioRef.current) audioRef.current.volume = (prevVolume > 0 ? prevVolume : 100) / 100;
    }
  };


  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
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
      
      if (isShuffle && nowPlayingAlbum && nowPlayingAlbum.tracks && nowPlayingAlbum.tracks.length > 1) {
        let randomIndex = Math.floor(Math.random() * nowPlayingAlbum.tracks.length);
        const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack?.id);
        while (randomIndex === currentIndex) {
          randomIndex = Math.floor(Math.random() * nowPlayingAlbum.tracks.length);
        }
        const nextTrack = nowPlayingAlbum.tracks[randomIndex];
        setNowPlayingTrack(nextTrack);
        if (audioRef.current) {
          audioRef.current.src = nextTrack.previewUrl.replace('localhost:54321', '127.0.0.1:54321');
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
        return;
      }

      if (nowPlayingAlbum && nowPlayingTrack) {
        const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;
        if (currentIndex !== -1) {
          if (currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {
            const nextTrack = nowPlayingAlbum.tracks![currentIndex + 1];
            setNowPlayingTrack(nextTrack);
            if (audioRef.current) {
              audioRef.current.src = nextTrack.previewUrl.replace('localhost:54321', '127.0.0.1:54321');
              audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
          } else if (repeatMode === 'all') {
            // Loop back to the first track
            const firstTrack = nowPlayingAlbum.tracks![0];
            setNowPlayingTrack(firstTrack);
            if (audioRef.current) {
              audioRef.current.src = firstTrack.previewUrl.replace('localhost:54321', '127.0.0.1:54321');
              audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
          }
        }
      }
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

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayRef.current?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevRef.current?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextRef.current?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(100, v + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 5));
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLyricsOpen(prev => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          setIsShortcutsOpen(false);
          setIsConfigOpen(false);
          break;
        case 'KeyF':
          e.preventDefault();
          setIsPlayerExpanded(prev => !prev);
          break;
        case 'KeyR':
        case 'Keyr':
          e.preventDefault();
          setRepeatMode(m => m === 'off' ? 'all' : m === 'all' ? 'one' : 'off');
          break;
        case 'KeyA':
        case 'Keya':
          e.preventDefault();
          setIsShuffle(prev => !prev);
          break;
        case 'KeyS':
        case 'Keys':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('toggle-favorite-current'));
          break;
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

  const handleSelectAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('album');
    const fullAlbum = await fetchAlbumDetails(album.id);
    setSelectedAlbumFull(fullAlbum);
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

      const handlePlayTrack = async (track: Track, album: Album) => {
    playRequestIdRef.current += 1;
    const currentRequestId = playRequestIdRef.current;

    setNowPlayingTrack(track);
    setNowPlayingAlbum(album);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      const workingUrl = await findWorkingUrl(track, album);
      
      // Abort if user clicked another track while we were finding the URL
      if (currentRequestId !== playRequestIdRef.current) {
         return;
      }
      
      if (!workingUrl) {
        console.warn("Track unplayable, skipping:", track.title);
        audioRef.current.removeAttribute('src'); // Clear the src so we don't accidentally play the previous track
        audioRef.current.load();
        
        const currentIndex = album.tracks?.findIndex(t => t.id === track.id) ?? -1;
        if (currentIndex !== -1 && currentIndex < (album.tracks?.length || 0) - 1) {
          // Play next track automatically only if we haven't switched tracks
          setTimeout(() => {
            if (currentRequestId === playRequestIdRef.current) {
              handlePlayTrack(album.tracks![currentIndex + 1], album);
            }
          }, 500);
        }
        return;
      }
      
      if (audioRef.current.src !== workingUrl) {
        audioRef.current.src = workingUrl;
      }
      audioRef.current.play().then(() => {
         if (currentRequestId === playRequestIdRef.current) setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleNextTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    if (isShuffle && nowPlayingAlbum.tracks && nowPlayingAlbum.tracks.length > 1) {
      let randomIndex = Math.floor(Math.random() * nowPlayingAlbum.tracks.length);
      const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack?.id);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * nowPlayingAlbum.tracks.length);
      }
      handlePlayTrack(nowPlayingAlbum.tracks[randomIndex], nowPlayingAlbum);
      return;
    }

    const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;
    if (currentIndex !== -1) {
      if (currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {
        handlePlayTrack(nowPlayingAlbum.tracks![currentIndex + 1], nowPlayingAlbum);
      } else if (repeatMode === 'all') {
        handlePlayTrack(nowPlayingAlbum.tracks![0], nowPlayingAlbum);
      }
    }
  };

  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // Rule: If playing for more than 5 seconds, restart song. If less than 5 seconds, go to previous track.
    if (audioRef.current && audioRef.current.currentTime >= 5) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }

    const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;
    if (currentIndex > 0) {
      handlePlayTrack(nowPlayingAlbum.tracks![currentIndex - 1], nowPlayingAlbum);
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !nowPlayingTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const sidebarW = isSidebarOpen ? 256 : 0;
  const cornerR = isSidebarOpen ? 24 : 0.01;

  return (
    <DownloadsProvider>
      <ToastContainer />
    <div className="w-full h-screen bg-[#050505] text-white font-inter overflow-hidden flex flex-col relative">
      {/* Unified Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#050505] to-blue-900/20 pointer-events-none z-0"></div>
      <div className={`absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#a855f7]/15 to-transparent pointer-events-none z-0 transition-opacity duration-700 ${['album', 'downloads', 'library', 'artist'].includes(currentView) ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Dynamic Album Background Glow (Expanded to entire web page) */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? 'opacity-50' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center blur-[150px] scale-110 opacity-70" style={{ backgroundImage: currentView === 'album' && (selectedAlbumFull || selectedAlbum) ? `url(${(selectedAlbumFull || selectedAlbum)?.coverUrl})` : 'none' }}></div>
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

      {/* SEAMLESS GLOBAL GLASS LAYER using a single blurred pane and a vector clip-path */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* The single glass pane with a vector clip-path to perfectly cut out the L-shape and rounded corner without ANY masking artifacts */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-300"
          style={{
            clipPath: `path('M 0 0 L 4000 0 L 4000 80 L ${sidebarW + cornerR} 80 A ${cornerR} ${cornerR} 0 0 0 ${sidebarW} ${80 + cornerR} L ${sidebarW} 4000 L 0 4000 Z')`,
            WebkitClipPath: `path('M 0 0 L 4000 0 L 4000 80 L ${sidebarW + cornerR} 80 A ${cornerR} ${cornerR} 0 0 0 ${sidebarW} ${80 + cornerR} L ${sidebarW} 4000 L 0 4000 Z')`
          }}
        ></div>

        {/* The precise borders (drawn completely separate from the glass to guarantee sub-pixel alignment) */}
        
        {/* Vertical Line */}
        <div 
          className="absolute bottom-0 w-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: `${sidebarW}px`, top: `${80 + cornerR}px`, opacity: isSidebarOpen ? 1 : 0 }}
        ></div>
        
        {/* Horizontal Line */}
        <div 
          className="absolute top-[80px] right-0 h-[1px] bg-white/10 transition-all duration-300" 
          style={{ left: `${sidebarW + cornerR}px` }}
        ></div>
        
        {/* Curved Corner SVG */}
        <div 
          className="absolute top-[80px] transition-all duration-300" 
          style={{ left: `${sidebarW}px`, width: `${cornerR}px`, height: `${cornerR}px`, opacity: isSidebarOpen ? 1 : 0 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="none">
             {/* Use sweep-flag 1 (clockwise) to curve INWARD (concave glass) so it perfectly hugs the Main Content */}
             <path d="M 0.5 24 A 23.5 23.5 0 0 1 24 0.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 z-50">
        <TopNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Main Container - Sidebar Flush, Body Floating */}
      <div className="w-full h-full flex overflow-hidden relative">
        
        {/* Sidebar Flush Left with toggle transition */}
        <div className={`h-full shrink-0 relative z-30 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className="w-64 h-full">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} isShortcutsOpen={isShortcutsOpen} onToggleShortcuts={() => setIsShortcutsOpen(!isShortcutsOpen)} onToggleConfig={() => setIsConfigOpen(!isConfigOpen)} />
          </div>
        </div>

        {/* Full-bleed Main Content container */}
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">
            {/* Split area for main scrollable content + right sidebar */}
            <div className="flex-1 relative flex min-h-0 z-10">
              {/* Actual scrollable content */}
              <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">
              
              
              <main id="main-scroll-container" className="flex-1 overflow-y-auto relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                <div className="pt-20 pb-0 min-h-full flex flex-col">
                  {currentView === 'catalog' && (
                    <CatalogView 
                      albums={albums} 
                      loading={loading} 
                      onSelectAlbum={handleSelectAlbum} 
                      onPlayTrack={handlePlayTrack}
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
                      onViewChange={setCurrentView}
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
                </div>
              </main>

              {/* Fade-out gradients applied to the scrollable area bounds */}
              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20"></div>
              {/* Right side gradient */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-20"></div>
              </div>

              {/* Right Lyrics Sidebar */}
              <div className={`h-full pt-20 shrink-0 relative z-20 transition-all duration-300 overflow-hidden ${isLyricsOpen ? 'w-80' : 'w-0'}`}>
                <div className="w-80 h-full">
                  <LyricsSidebar track={nowPlayingTrack} album={nowPlayingAlbum} progress={progress} />
                </div>
              </div>
            </div>

            {/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
            {nowPlayingTrack && nowPlayingAlbum && (
              <div className="shrink-0 z-30 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
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
                  onExpand={() => setIsPlayerExpanded(true)}
                  isLyricsOpen={isLyricsOpen}
                  onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
                  onNext={handleNextTrack}
                  onPrev={handlePrevTrack}
                  onSeek={(p) => {
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = p * audioRef.current.duration;
                    }
                  }}
                  onVolumeChange={(v) => {
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v / 100;
                  }}
                  onToggleMute={toggleMute}
                  onSelectAlbum={() => handleSelectAlbum(nowPlayingAlbum)}
                  onSelectArtist={() => {
                    setSelectedArtist({ name: nowPlayingAlbum.artist, img: nowPlayingAlbum.coverUrl, type: nowPlayingAlbum.artist.includes('Combo') || nowPlayingAlbum.artist.includes('Orquesta') ? 'Grupo Musical' : 'Artista' });
                    setCurrentView('artist');
                  }}
                />
              </div>
            )}
        </div>
      </div>

      <ImmersivePlayer 
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setRepeatMode(m => m === "off" ? "all" : m === "all" ? "one" : "off")}
        activeTab={isLyricsOpen ? "letra" : "portada"}
        onTabChange={(tab) => setIsLyricsOpen(tab === "letra")}
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
        onSeek={(p) => {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = p * audioRef.current.duration;
          }
        }}
      />

      {/* Modals */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsConfigOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 450, damping: 30 } }}
              exit={{ opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.1, ease: "easeOut" } }}
              className="w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 flex flex-col overflow-hidden"
            >
              {/* Config Header */}
              <div className="p-8 pb-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
                <h2 className="text-3xl font-bold text-white tracking-wide">Configuración</h2>
                <button 
                  onClick={() => setIsConfigOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              {/* Config Body */}
              <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center">
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                  <p className="text-white/40 text-lg font-medium tracking-wide">La configuración está actualmente vacía.</p>
                  <p className="text-white/20 text-sm">Las opciones del sistema aparecerán aquí.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isShortcutsOpen && (
          <motion.div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0" onClick={() => setIsShortcutsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-[270px] bottom-[105px] w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
            >
            <h3 className="text-white text-[11px] font-bold mb-4 uppercase tracking-[0.15em]">Atajos de teclado</h3>
            <div className="flex flex-col gap-3 text-xs text-white/60">
               <div className="flex justify-between items-center">
                 <span>Reproducir / Pausar</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">Espacio</kbd>
               </div>
               <div className="flex justify-between items-center">
                 <span>Anterior / Siguiente</span>
                 <div className="flex gap-1">
                   <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">←</kbd>
                   <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">→</kbd>
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <span>Subir / Bajar volumen</span>
                 <div className="flex gap-1">
                   <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">↑</kbd>
                   <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">↓</kbd>
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <span>Expandir reproductor</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">F</kbd>
               </div>
               <div className="flex justify-between items-center">
                 <span>Mostrar letra</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">L</kbd>
               </div>
               <div className="flex justify-between items-center">
                 <span>Modo repetir</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">R</kbd>
               </div>
               <div className="flex justify-between items-center">
                 <span>Modo aleatorio</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">A</kbd>
               </div>
               <div className="flex justify-between items-center">
                 <span>Agregar a favoritos</span>
                 <kbd className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono text-[10px]">S</kbd>
               </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </DownloadsProvider>
  );
};
