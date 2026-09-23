import React, { useState, useRef, useEffect } from 'react';
import { TopNav } from './TopNav';
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
  
  const { albums, loading, fetchAlbumDetails } = useCatalog();
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
    <div className="w-full h-screen bg-[#05050A] text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

      <TopNav currentView={currentView} onViewChange={setCurrentView} />

      <div className="w-full h-full relative z-10">
        {currentView === 'catalog' && (
          <CatalogView 
            albums={albums} 
            loading={loading} 
            onSelectAlbum={handleSelectAlbum} 
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

      {nowPlayingTrack && nowPlayingAlbum && (
        <MiniPlayer 
          track={nowPlayingTrack}
          album={nowPlayingAlbum}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          progress={progress}
          volume={volume}
          onExpand={() => setIsPlayerExpanded(true)} 
        />
      )}

      <ImmersivePlayer 
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        track={nowPlayingTrack}
        album={nowPlayingAlbum}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        volume={volume}
        setVolume={setVolume}
        progress={progress}
      />
    </div>
  );
};
