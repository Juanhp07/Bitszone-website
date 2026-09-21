import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Home, Compass, Library, Play, Pause, 
  SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, 
  Menu, Cast, MoreVertical, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { SpecularText } from './ui/SpecularText';
import { createClient } from '@supabase/supabase-js';

const CATEGORIES = ["Podcasts", "Actívate", "Entrenamiento", "Relajación", "Para sentirte bien", "Viaje diario", "Romance", "Fiesta", "Triste", "Sueño", "Concentración"];

export const PlayerApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  // Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch from Supabase
  useEffect(() => {
    const fetchTracks = async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        setLoading(false);
        return;
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.from('tracks').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setTracks(data);
      }
      setLoading(false);
    };
    fetchTracks();
  }, [supabaseUrl, supabaseAnonKey]);

  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    
    const handleEnded = () => handleNext();

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(e => console.log("Audio play failed:", e));
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Controls
  const togglePlay = () => {
    if (!audioRef.current || tracks.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  // Progress Bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  // Volume Bar click
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
    setIsMuted(percent === 0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Visual array to fill the UI grids even if we only have 1 song uploaded right now
  const displayTracks = tracks.length > 0 ? [...tracks, ...tracks, ...tracks, ...tracks, ...tracks, ...tracks].slice(0, 12) : [];

  return (
    <div className="flex flex-col h-screen w-full bg-[#030303] text-white overflow-hidden font-inter">
      {/* Hidden Audio Element */}
      {currentTrack && <audio ref={audioRef} src={currentTrack.audio_url} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-[#030303] flex flex-col h-full flex-shrink-0 z-10 pt-4">
          <div className="flex items-center gap-4 px-6 pb-6">
            <Menu className="w-6 h-6 text-white cursor-pointer" />
            <SpecularText
              text="Bitszone"
              className="text-[20px] tracking-normal leading-none"
              style={{ fontFamily: '"DM Serif Display", serif', fontStyle: "italic" }}
              specularColor="#a855f7"
              baseStrokeColor="transparent"
              strokeWidth={1}
              glowSize={30}
            />
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <a href="#" className="flex items-center gap-4 px-4 py-3 text-white bg-white/10 rounded-lg transition-colors text-[15px] font-medium">
              <Home className="w-5 h-5 fill-current" /> Principal
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 text-[#aaaaaa] hover:text-white transition-colors text-[15px] font-medium">
              <Compass className="w-5 h-5" /> Explorar
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 text-[#aaaaaa] hover:text-white transition-colors text-[15px] font-medium">
              <Library className="w-5 h-5" /> Biblioteca
            </a>

            <div className="mt-8 px-4 border-t border-white/10 pt-6">
              <button className="flex items-center justify-center bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform w-max">
                Acceder
              </button>
              <p className="text-[#aaaaaa] text-xs mt-4 leading-relaxed">
                Accede a tu cuenta para crear y compartir playlists, obtener recomendaciones personalizadas y mucho más.
              </p>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto bg-[#030303] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative">
          
          {/* Top Bar */}
          <div className="sticky top-0 z-50 bg-[#030303] flex items-center justify-between px-8 py-4">
            <div className="relative w-full max-w-[480px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa]" />
              <input 
                type="text" 
                placeholder="Buscar canciones, álbumes, artistas o podcasts" 
                className="w-full bg-white/10 border border-transparent rounded-lg py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:bg-white/20 transition-colors placeholder:text-[#aaaaaa] text-white"
              />
            </div>
            <div className="flex items-center gap-6 text-white ml-4">
              <Cast className="w-6 h-6 cursor-pointer hover:text-[#a855f7] transition-colors" />
              <MoreVertical className="w-6 h-6 cursor-pointer" />
              <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                Acceder
              </button>
            </div>
          </div>

          <div className="px-8 pb-32 max-w-[1800px] mx-auto mt-4">
            
            {/* Chips / Categories */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {CATEGORIES.map((cat, i) => (
                <button key={i} className="whitespace-nowrap px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors snap-start">
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#aaaaaa]">Cargando canciones desde Supabase...</p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#aaaaaa]">No hay canciones disponibles. ¡Agrega más en Supabase!</p>
              </div>
            ) : (
              <>
                {/* Quick Picks / Selección rápida */}
                <div className="mb-12">
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-3xl font-sora font-bold">Selección rápida</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                    {displayTracks.map((track, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer group transition-colors"
                        onClick={() => handlePlayTrack(i % tracks.length)}
                      >
                        <div className="relative w-12 h-12 rounded flex-shrink-0 overflow-hidden">
                          <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-black/50 items-center justify-center ${(currentTrackIndex === (i % tracks.length)) && isPlaying ? 'flex' : 'hidden group-hover:flex'}`}>
                            {(currentTrackIndex === (i % tracks.length)) && isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-current ml-1" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold truncate ${(currentTrackIndex === (i % tracks.length)) ? 'text-[#a855f7]' : 'text-white'}`}>{track.title}</h3>
                          <p className="text-[13px] text-[#aaaaaa] truncate">{track.artist} • 1M reproducciones</p>
                        </div>
                        <MoreVertical className="w-5 h-5 text-[#aaaaaa] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relaxing Melodies (Square Cards) */}
                <div className="mb-12">
                  <h2 className="text-3xl font-sora font-bold mb-6">Tus Favoritos</h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {displayTracks.slice(0, 6).map((track, i) => (
                      <div 
                        key={i} 
                        className="min-w-[200px] w-[200px] flex-shrink-0 cursor-pointer group"
                        onClick={() => handlePlayTrack((i + 2) % tracks.length)}
                      >
                        <div className="w-full aspect-square rounded-md overflow-hidden relative mb-3">
                          <img src={track.image_url} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 text-white fill-current ml-1" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-[15px] font-semibold text-white truncate group-hover:underline">{track.title}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* Bottom Sticky Player Bar (YT Music Style) */}
      <div className="bg-[#212121] h-[72px] flex items-center justify-between px-4 relative z-50">
        
        {/* Progress Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-white/20 cursor-pointer group/progress"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-[#a855f7] relative group-hover/progress:h-[4px] transition-all -translate-y-[1px] group-hover/progress:-translate-y-[2px]" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#a855f7] rounded-full opacity-0 group-hover/progress:opacity-100 translate-x-1/2 shadow-lg"></div>
          </div>
        </div>

        {/* Left: Now Playing */}
        <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
          {currentTrack ? (
            <>
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                <img src={currentTrack.image_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-[15px] font-medium text-white truncate">{currentTrack.title}</h4>
                <div className="flex items-center gap-1 text-[13px] text-[#aaaaaa]">
                  <span className="truncate hover:underline cursor-pointer">{currentTrack.artist}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 text-[#aaaaaa]">
                <ThumbsDown className="w-5 h-5 cursor-pointer hover:text-white" />
                <ThumbsUp className="w-5 h-5 cursor-pointer hover:text-white" />
              </div>
            </>
          ) : (
             <div className="text-[#aaaaaa] text-sm">Selecciona una canción</div>
          )}
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center justify-center w-[40%]">
          <div className="flex items-center gap-6">
            <button className="text-[#aaaaaa] hover:text-white transition-colors">
              <Shuffle className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-[#a855f7] transition-colors" onClick={handlePrev}>
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>
            <button className="text-white hover:text-[#a855f7] transition-colors" onClick={handleNext}>
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            <button className="text-[#aaaaaa] hover:text-white transition-colors">
              <Repeat className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#aaaaaa] mt-1 font-medium w-full justify-center">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center justify-end gap-3 w-[30%] min-w-[150px] pr-2">
          <button 
            className="text-[#aaaaaa] hover:text-white transition-colors"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div 
            className="w-24 h-1 bg-white/20 rounded-full cursor-pointer group/volume relative"
            ref={volumeRef}
            onClick={handleVolumeClick}
          >
            <div 
              className="h-full bg-white rounded-full relative group-hover/volume:bg-[#a855f7] transition-colors"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/volume:opacity-100 translate-x-1/2 shadow-lg"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
