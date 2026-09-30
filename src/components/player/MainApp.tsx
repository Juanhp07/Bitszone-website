import { ArtistView } from "./ArtistView";
import React, { useState, useRef, useEffect } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MiniPlayer } from './MiniPlayer';
import { CatalogView } from './CatalogView';
import { AlbumView } from './AlbumView';
import { DownloadsView } from './DownloadsView';
import { ImmersivePlayer } from './ImmersivePlayer';
import { useCatalog } from './useCatalog';
import type { Album, Track } from './types';
import { DownloadsProvider } from './DownloadsContext';
import { Heart } from 'lucide-react';

export const MainApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {

  const [currentView, setCurrentView] = useState<"catalog" | "album" | "downloads" | "library" | "artist">("catalog");
  const [selectedArtist, setSelectedArtist] = useState<{name: string, img: string, type?: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  
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
      if (nowPlayingAlbum && nowPlayingTrack) {
        const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;
        if (currentIndex !== -1 && currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {
          const nextTrack = nowPlayingAlbum.tracks![currentIndex + 1];
          setNowPlayingTrack(nextTrack);
          if (audioRef.current) {
            audioRef.current.src = nextTrack.previewUrl;
            audioRef.current.play();
            setIsPlaying(true);
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
  }, [nowPlayingAlbum, nowPlayingTrack]);

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
    const currentIndex = nowPlayingAlbum.tracks?.findIndex(t => t.id === nowPlayingTrack.id) ?? -1;
    if (currentIndex !== -1 && currentIndex < (nowPlayingAlbum.tracks?.length || 0) - 1) {
      handlePlayTrack(nowPlayingAlbum.tracks![currentIndex + 1], nowPlayingAlbum);
    }
  };

  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    
    // Convert current audio progress to visual seconds
    const visualSecondsElapsed = progress * (nowPlayingTrack.duration / 1000);

    // Rule: If playing for more than 5 seconds, restart song. If less than 5 seconds, go to previous track.
    if (audioRef.current && visualSecondsElapsed >= 5) {
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

      {/* Library (Favorites) View Background Glow */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${currentView === 'library' ? 'opacity-40' : 'opacity-0'}`}
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 80%)' }}
      >
        <div className="absolute inset-0 blur-[150px] scale-110 opacity-70 bg-gradient-to-br from-pink-500 to-purple-600"></div>
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
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* Full-bleed Main Content container */}
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">
            {/* Actual scrollable content */}
            <div className="flex-1 relative flex flex-col min-h-0 z-10">
              
              
              <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
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
                  {currentView === 'downloads' && <DownloadsView type="downloads" onPlayTrack={handlePlayTrack} />}
                  {currentView === 'library' && <DownloadsView type="favorites" title="Canciones favoritas" icon={Heart} onPlayTrack={handlePlayTrack} />}
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

            {/* Fusionado Player at the bottom of the body - Sits structurally in flex flow */}
            {nowPlayingTrack && nowPlayingAlbum && (
              <div className="shrink-0 z-30 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                <MiniPlayer 
                  track={nowPlayingTrack}
                  album={nowPlayingAlbum}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  progress={progress}
                  volume={volume}
                  onExpand={() => setIsPlayerExpanded(true)}
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
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        track={nowPlayingTrack}
        album={nowPlayingAlbum}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onPlayTrack={handlePlayTrack}
        volume={volume}
        setVolume={(v) => {
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v / 100;
        }}
        progress={progress}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onToggleMute={toggleMute}
        onSeek={(p) => {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = p * audioRef.current.duration;
          }
        }}
      />
    </div>
    </DownloadsProvider>
  );
};
