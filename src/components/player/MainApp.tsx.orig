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

export const MainApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  const [currentView, setCurrentView] = useState<'catalog' | 'album' | 'downloads'>('catalog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  
  const { albums, loading, fetchAlbumDetails } = useCatalog(supabaseUrl, supabaseAnonKey);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumFull, setSelectedAlbumFull] = useState<Album | null>(null);
  
  const [nowPlayingTrack, setNowPlayingTrack] = useState<Track | null>(null);
  const [nowPlayingAlbum, setNowPlayingAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);
        if (currentIndex < nowPlayingAlbum.tracks.length - 1) {
          const nextTrack = nowPlayingAlbum.tracks[currentIndex + 1];
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

  const handlePlayTrack = (track: Track, album: Album) => {
    setNowPlayingTrack(track);
    setNowPlayingAlbum(album);
    if (audioRef.current) {
      if (audioRef.current.src !== track.previewUrl) {
        audioRef.current.src = track.previewUrl;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);
    if (currentIndex < nowPlayingAlbum.tracks.length - 1) {
      handlePlayTrack(nowPlayingAlbum.tracks[currentIndex + 1], nowPlayingAlbum);
    }
  };

  const handlePrevTrack = () => {
    if (!nowPlayingAlbum || !nowPlayingTrack) return;
    const currentIndex = nowPlayingAlbum.tracks.findIndex(t => t.id === nowPlayingTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(nowPlayingAlbum.tracks[currentIndex - 1], nowPlayingAlbum);
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

  return (
    <div className="w-full h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative">
      <div className="relative z-20 shrink-0">
        <TopNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Container - Sidebar Flush, Body Floating */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar Flush Left with toggle transition */}
        <div className={`h-full shrink-0 relative z-10 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className="w-64 h-full">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* Floating Main Content (Body) wrapper - provides the gap */}
        <div className="flex-1 relative flex flex-col min-w-0 p-4 pl-4 pr-4 pb-4">
          
          {/* Main Body container that fully clips its background layers */}
          <div className="flex-1 relative flex flex-col min-w-0 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] overflow-hidden">
            
            {/* The colored orbs are now CONFINED inside this container so they don't bleed into the padding */}
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#a855f7]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
            
            {/* The glass layer that blurs the confined orbs */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-[100px] border border-white/[0.08] pointer-events-none z-0 rounded-2xl"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0"></div>

            {/* Actual scrollable content on top of the glass */}
            <div className="flex-1 relative flex flex-col min-h-0 z-10">
              {/* Top gradient inside main content */}
              <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none z-0"></div>
              
              <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                <div className="pb-12 h-full">
                  {currentView === 'catalog' && (
                    <CatalogView 
                      albums={albums} 
                      loading={loading} 
                      onSelectAlbum={handleSelectAlbum} 
                      onPlayTrack={handlePlayTrack}
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
                  {currentView === 'downloads' && <DownloadsView />}
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
              <div className="shrink-0 z-30 border-t border-white/5 bg-black/95 backdrop-blur-3xl">
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
                />
              </div>
            )}
          </div>
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
        setVolume={setVolume}
        progress={progress}
      />
    </div>
  );
};
