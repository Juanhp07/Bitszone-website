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
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
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
    <div className="w-full h-screen bg-[#05050A] text-white font-sans overflow-hidden flex flex-col relative">
      {/* Background Orbs to make floating elements stand out */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#a855f7]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0"></div>

      <div className="relative z-20 shrink-0">
        <TopNav currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Floating Layout Container with gap and padding */}
      <div className="flex-1 flex overflow-hidden relative z-10 p-6 gap-6 pt-6">
        
        {/* Floating Sidebar */}
        <div className="w-64 h-full shrink-0 rounded-2xl overflow-hidden shadow-2xl relative">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Floating Main Content (Body) */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-white/[0.02] backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          
          <main className="flex-1 h-full overflow-y-auto relative z-0 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 h-full pb-32">
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

          {/* Fade-out gradient exactly the height of the player (90px) + some buffer */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20"></div>

          {/* Fusionado Player at the bottom of the body */}
          {nowPlayingTrack && nowPlayingAlbum && (
            <div className="absolute bottom-0 left-0 right-0 z-30">
              <MiniPlayer 
                track={nowPlayingTrack}
                album={nowPlayingAlbum}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                progress={progress}
                volume={volume}
                onExpand={() => setIsPlayerExpanded(true)} 
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
        setVolume={setVolume}
        progress={progress}
      />
    </div>
  );
};
