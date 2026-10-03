import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DownloadCloud, Play, Heart, HeartOff, Clock, X, Trash2, Search, Loader2, Check, AlertCircle } from 'lucide-react';
import FuseButton from '../ui/FuseButton';
import HoldButton from '../ui/HoldButton';
import { useDownloads } from './DownloadsContext';
import type { Track, Album } from './types';

const TimeAgo = ({ dateStr }: { dateStr?: string }) => {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!dateStr) return <span title="Desconocido">-</span>;

  const d = new Date(dateStr);
  const diffSeconds = Math.floor((now - d.getTime()) / 1000);
  
  const exactDate = d.toLocaleString('es-ES', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).replace(',', '');

  let displayDate = '';
  if (diffSeconds < 60) {
    displayDate = `hace ${Math.max(0, diffSeconds)} segundos`;
  } else if (diffSeconds < 3600) {
    const m = Math.floor(diffSeconds / 60);
    displayDate = `hace ${m} minuto${m !== 1 ? 's' : ''}`;
  } else if (diffSeconds < 86400) {
    const h = Math.floor(diffSeconds / 3600);
    displayDate = `hace ${h} hora${h !== 1 ? 's' : ''}`;
  } else {
    displayDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return <span title={exactDate}>{displayDate}</span>;
};

export const DownloadsView = ({ 
  type = 'downloads', 
  title = "Canciones descargadas", 
  icon: Icon = DownloadCloud,
  onPlayTrack,
  onSelectAlbum,
  albums,
  gradientClass
}: { 
  type?: 'downloads' | 'favorites' | 'licenses' | 'playlists',
  gradientClass?: string, 
  title?: React.ReactNode, 
  icon?: any,
  onPlayTrack?: (t: Track, a: Album) => void,
  onSelectAlbum?: (a: Album) => void,
  albums?: Album[]
}) => {
  const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite, toggleFavoriteAlbum, isFavorite, isDownloaded, clearNewDownloads, totalBytes, clearDownloads, clearFavorites, removeAlbumFromDownloads, removeAlbumFromFavorites, downloadingAlbums, cancelAlbumDownload } = useDownloads();
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<any>(null);
  const [albumToRemove, setAlbumToRemove] = useState<{ id: string, title: string } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [viewMode, setViewMode] = useState<'canciones' | 'albumes'>('canciones');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'recent' | 'alpha' | 'size_desc' | 'size_asc'>('default');
  const [showSort, setShowSort] = useState(false);
  const [sortPos, setSortPos] = useState({ top: 0, left: 0 });
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0, width: 0 });
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSort(false); }; if (showSort) { document.addEventListener('keydown', handleKeyDown); } return () => document.removeEventListener('keydown', handleKeyDown); }, [showSort]);
  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const handleScroll = () => {
      setShowSort(false);
      setShowSuggestions(false);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);


  const tracks = type === 'downloads' ? downloadedTracks : type === 'favorites' ? favoriteTracks : [];
  const getSuggestions = () => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    
    if (viewMode === 'albumes') {
      const albumTitles = new Set<string>();
      tracks.forEach(t => {
        if (t.albumTitle && t.albumTitle.toLowerCase().includes(q)) {
          albumTitles.add(t.albumTitle);
        }
      });
      return Array.from(albumTitles).slice(0, 5);
    } else {
      const trackTitles = new Set<string>();
      tracks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          trackTitles.add(t.title);
        }
      });
      return Array.from(trackTitles).slice(0, 5);
    }
  };
  
  const suggestions = getSuggestions();


  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === 'Escape') {
        setShowSort(false);
        if (albumToRemove) setAlbumToRemove(null);
        if (trackToRemove) setTrackToRemove(null);
        if (showClearConfirm) {
          setShowClearConfirm(false);
          setConfirmText("");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [albumToRemove, trackToRemove, showClearConfirm]);

  const filteredTracks = tracks.filter(t => {
    const q = searchQuery.toLowerCase();
    if (viewMode === 'albumes') {
      return (t.albumTitle && t.albumTitle.toLowerCase().includes(q)) || 
             t.artist.toLowerCase().includes(q);
    }
    return t.title.toLowerCase().includes(q) || 
           t.artist.toLowerCase().includes(q) ||
           (t.albumTitle && t.albumTitle.toLowerCase().includes(q));
  });

  useEffect(() => {
    if (type === 'downloads') {
      clearNewDownloads();
    }
  }, [type, clearNewDownloads]);

  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');
  };
  const formatSize = (sizeMb?: number, duration?: number) => {
    const mb = sizeMb || ((duration || 0) / 1000 * 0.023);
    return mb.toFixed(1) + ' MB';
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRemove = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    setTrackToRemove(track);
  };

  const handlePlay = (track: Track) => {
    if (onPlayTrack) {
      const dummyAlbum: Album = {
        id: 999999, // 'playlist'
        title: String(title),
        artist: 'Varios Artistas',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',
        year: '2026',
        genre: 'Playlist',
        trackCount: tracks.length,
        tracks: tracks
      };
      onPlayTrack(track, dummyAlbum);
    }
  };

  // Start precisely at 5.00 GB available
  const baseAvailableGB = 5.00;
  const downloadedGB = totalBytes / (1024 * 1024 * 1024);
  const availableGB = Math.max(0, baseAvailableGB - downloadedGB);
  const totalUsedGB = 5.0 - availableGB;


  const groupedTracks = filteredTracks.reduce((acc, track) => {
    const albumKey = track.albumId ? String(track.albumId) : 'unknown';
    if (!acc[albumKey]) {
      acc[albumKey] = {
        id: albumKey,
        title: track.albumTitle || 'Canciones sueltas',
        coverUrl: track.albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',
        tracks: []
      };
    }
    acc[albumKey].tracks.push(track);
    return acc;
  }, {} as Record<string, { id: string, title: string, coverUrl: string, tracks: Track[] }>);

  const renderTrack = (track: Track, index: number) => {
    const isHovered = hoveredTrack === track.id;
    return (
      <div 
        key={track.id}
        onMouseEnter={() => setHoveredTrack(track.id)}
        onMouseLeave={() => setHoveredTrack(null)}
        onClick={() => handlePlay(track)}
        className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_130px_90px_80px_50px]' : 'grid-cols-[50px_1fr_130px_80px_50px]'} gap-4 px-4 py-2 items-center rounded-xl cursor-pointer group hover:bg-white/5 transition-colors`}
      >
        <div className="text-center text-white/50 font-medium">
          {isHovered ? (
            <Play className="w-4 h-4 text-white mx-auto" fill="currentColor" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
        
        <div className="flex flex-col pr-4">
          <span className="font-medium line-clamp-1 text-white text-sm">
            {track.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/50 text-sm line-clamp-1 group-hover:text-white/80 transition-colors">{track.artist}</span>
          </div>
        </div>
        
        <div className="text-white/50 text-xs font-medium truncate">
          <TimeAgo dateStr={track.addedAt} />
        </div>
        
        {type === 'downloads' && (
          <div className="text-white/50 text-xs font-medium">
            {formatSize(track.sizeMb, track.duration)}
          </div>
        )}
        
        <div className="text-left text-white/50 text-sm flex items-center justify-start">
          {formatDuration(track.duration)}
        </div>

        <div className="flex items-center justify-start">
          {type === 'downloads' ? (
            <FuseButton fuse="outline" commitOn="fuseEnd" 
              
              label=""
              undoLabel=""
              doneLabel=""
              background="transparent"
              color="rgba(255,255,255,0.3)"
              fuseColor="#ef4444"
              undoWindow={2000}
              className="transition-all duration-300 !w-8 !h-8 !min-w-[32px] !px-0 rounded-full border border-transparent hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 data-[phase=armed]:!border-red-500/30 data-[phase=armed]:!bg-red-500/10 data-[phase=armed]:!text-red-400 group/fuse"
              icon={<Trash2 className="w-4 h-4" />}
              onCommit={() => removeDownload(track.id)}
            />
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
              }}
              className="group/favbtn text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
              <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
            </button>
          )}
        </div>
      </div>
    );
  };


  const getGroupAddedAt = (group: any) => {
    return Math.max(...group.tracks.map((t: any) => new Date(t.addedAt || 0).getTime()));
  };

  const getGroupSize = (group: any) => {
    return group.tracks.reduce((sum: number, t: any) => sum + (t.sizeMb || ((t.duration || 0) / 1000 * 0.023)), 0);
  };

  const sortedGroups = Object.values(groupedTracks).sort((a: any, b: any) => {
    if (sortBy === 'recent' || sortBy === 'default') {
      return getGroupAddedAt(b) - getGroupAddedAt(a);
    } else if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'size_desc') {
      return getGroupSize(b) - getGroupSize(a);
    } else if (sortBy === 'size_asc') {
      return getGroupSize(a) - getGroupSize(b);
    }
    return 0;
  });

  sortedGroups.forEach((group: any) => {
    group.tracks.sort((a: any, b: any) => {
      if (sortBy === 'default') {
        return (a.trackNumber || 0) - (b.trackNumber || 0);
      } else if (sortBy === 'recent') {
        return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
      } else if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'size_desc') {
        const aSize = a.sizeMb || ((a.duration || 0) / 1000 * 0.023);
        const bSize = b.sizeMb || ((b.duration || 0) / 1000 * 0.023);
        return bSize - aSize;
      } else if (sortBy === 'size_asc') {
        const aSize = a.sizeMb || ((a.duration || 0) / 1000 * 0.023);
        const bSize = b.sizeMb || ((b.duration || 0) / 1000 * 0.023);
        return aSize - bSize;
      }
      return 0;
    });
  });

  

  return (
    <div className="h-full flex flex-col relative">
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); fill: transparent; }
          15% { transform: scale(1.25); fill: white; }
          30% { transform: scale(1.05); fill: white; }
          45% { transform: scale(1.25); fill: white; }
          60%, 80% { transform: scale(1); fill: transparent; }
        }
        .custom-icon-favorites {
          animation: heartBeat 2.5s ease-in-out infinite;
        }

        @keyframes starSpin {
          0% { transform: rotate(0deg) scale(1); fill: transparent; }
          15%, 35% { transform: rotate(144deg) scale(1.2); fill: white; }
          50%, 70% { transform: rotate(288deg) scale(1.2); fill: white; }
          85%, 100% { transform: rotate(360deg) scale(1); fill: transparent; }
        }
        .custom-icon-licenses {
          animation: starSpin 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        
          25%, 85% { transform: scale(1.15); }
        }
        @keyframes fluidScale {
          0%, 100% { transform: scale(1.0); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); }
        }
        @keyframes fluidLines {
          0%, 35% { stroke-dashoffset: 0; fill: white; }
          50% { stroke-dashoffset: 24; fill: transparent; }
          65%, 100% { stroke-dashoffset: 0; fill: white; }
        }
        @keyframes fluidNote {
          0%, 10% { stroke-dashoffset: 0; fill: white; }
          25% { stroke-dashoffset: 24; fill: transparent; }
          40%, 100% { stroke-dashoffset: 0; fill: white; }
        }
        .custom-icon-playlists {
          animation: fluidScale 3s ease-in-out infinite;
          transform-origin: center;
          overflow: visible;
        }
        .custom-icon-playlists *:nth-child(n+3) {
          stroke-dasharray: 24;
          animation: fluidLines 3s ease-in-out infinite;
        }
        .custom-icon-playlists *:nth-child(-n+2) {
          stroke-dasharray: 24;
          animation: fluidNote 3s ease-in-out infinite;
        }

        @keyframes arrowSwipeDown {
          0% { transform: translateY(-4px); opacity: 0; }
          20% { transform: translateY(0px); opacity: 1; }
          80% { transform: translateY(4px); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes cloudPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .custom-icon-downloads {
          fill: transparent !important;
          overflow: visible;
        }
        /* La nube siempre contiene arcos (A o a) en su path */
        .custom-icon-downloads path[d*="A"],
        .custom-icon-downloads path[d*="a"] {
          animation: cloudPulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        /* La flecha son lineas rectas, no contiene arcos */
        .custom-icon-downloads path:not([d*="A"]):not([d*="a"]),
        .custom-icon-downloads line,
        .custom-icon-downloads polyline {
          animation: arrowSwipeDown 1.8s ease-in-out infinite;
        }
      `}</style>
      {/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between relative z-40 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className={`w-40 h-40 shrink-0 rounded-2xl flex items-center justify-center ${type === 'licenses' ? 'bg-yellow-500' : type === 'playlists' ? 'bg-green-500' : type === 'downloads' ? 'bg-blue-500' : 'bg-[#a855f7]'}`}>
            <Icon className={`w-16 h-16 text-white custom-icon-${type}`} />
          </div>
          
          <div className="flex flex-col gap-2">
            {type === 'downloads' ? <span className="text-white/70 text-sm font-semibold tracking-widest uppercase mt-2">Mis descargas</span> : <span className="text-white/70 text-sm font-semibold tracking-widest uppercase mt-2">Biblioteca</span>}
            <div className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)', WebkitTextStroke: '1px currentColor' }}>{title}</div>
            <div className="flex items-center gap-2 mt-2 text-white/80 font-medium text-sm">
              <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
              <span className="text-white/30">•</span>
              <span>{Object.keys(groupedTracks).length} {Object.keys(groupedTracks).length === 1 ? 'álbum' : 'álbumes'}</span>
              {type === 'downloads' && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/60">
                    {availableGB.toFixed(2)}GB libres de 5.00GB
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {tracks.length > 0 && (
          <div>
            <HoldButton
              size="sm"
              radius={9999}
              glow={true}
              wave={true}
              holdTime={5000}
              backgroundColor="transparent"
              fillColor="#e11d48"
              textColor="rgba(255, 255, 255, 0.3)"
              fillTextColor="#ffffff"
              icon={<Trash2 className="w-4 h-4" />}
              doneIcon={<Check className="w-4 h-4" />}
              doneLabel="Eliminado"
              className="!border border-white/10 font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 data-[phase=holding]:!border-red-500/30 data-[phase=holding]:!bg-red-500/10 data-[phase=holding]:!text-red-400 transition-colors duration-300 group"
              onHold={() => {
                if (type === 'downloads') {
                  clearDownloads();
                } else {
                  clearFavorites();
                }
              }}
            >
              Mantener para eliminar
            </HoldButton>
          </div>
        )}
      </div>

      {/* Action Bar (Search & Tabs) */}
      <div className="px-8 py-4 flex items-center justify-between sticky top-0 bg-transparent backdrop-blur-md z-30 border-b border-white/5">
        <div className="relative flex bg-white/5 rounded-full p-1 border border-white/10">
          {/* Animated Background Pill */}
          <div 
            className={`absolute top-1 bottom-1 w-[110px] rounded-full transition-transform duration-300 ease-out border shadow-md ${
              viewMode === 'canciones' ? 'translate-x-0' : 'translate-x-full'
            } ${
              type === 'licenses' ? 'bg-yellow-500/20 border-yellow-500/30' : 
              type === 'playlists' ? 'bg-green-500/20 border-green-500/30' : 
              type === 'downloads' ? 'bg-blue-500/20 border-blue-500/30' : 
              'bg-[#a855f7]/20 border-[#a855f7]/30'
            }`}
          />
          
          <button 
            onClick={() => { setViewMode('canciones'); setSelectedAlbumId(null); }} 
            className={`relative z-10 w-[110px] py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
              viewMode === 'canciones' ? (
                type === 'licenses' ? 'text-yellow-400' : 
                type === 'playlists' ? 'text-green-400' : 
                type === 'downloads' ? 'text-blue-400' : 
                'text-[#c084fc]'
              ) : 'text-white/50 hover:text-white'
            }`}
          >
            Canciones
          </button>
          <button 
            onClick={() => { setViewMode('albumes'); setSelectedAlbumId(null); }} 
            className={`relative z-10 w-[110px] py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
              viewMode === 'albumes' ? (
                type === 'licenses' ? 'text-yellow-400' : 
                type === 'playlists' ? 'text-green-400' : 
                type === 'downloads' ? 'text-blue-400' : 
                'text-[#c084fc]'
              ) : 'text-white/50 hover:text-white'
            }`}
          >
            Álbumes
          </button>
        </div>

        <div className="relative z-50">
          <button 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSortPos({ top: rect.bottom, left: rect.right - 280 });
              setShowSort(!showSort);
            }} 
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium group relative z-50"
          >
            <span className="text-white/30 mr-1">Ordenar:</span> {sortBy === 'default' ? 'Por defecto' : sortBy === 'recent' ? 'Añadidos recientemente' : sortBy === 'alpha' ? 'Alfabéticamente' : sortBy === 'size_desc' ? 'Más pesados' : 'Menos pesados'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-px"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showSort && typeof document !== 'undefined' && createPortal(
            <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowSort(false)} />
            <div 
              style={{ top: sortPos.top, left: sortPos.left }}
              className={`fixed mt-4 w-[280px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 ${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : type === 'downloads' ? 'border-blue-500/20' : 'border-[#a855f7]/20'}`}>
              {[
                { id: 'default', label: 'Por defecto' },
                { id: 'recent', label: 'Añadidos recientemente' },
                { id: 'alpha', label: 'Alfabéticamente' },
                { id: 'size_desc', label: 'Más pesados' },
                { id: 'size_asc', label: 'Menos pesados' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id as any); setShowSort(false); }}
                  className={`w-full text-left px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap ${sortBy === opt.id ? 'bg-white/10 text-white font-medium' : `text-white/60 hover:text-white ${type === 'licenses' ? 'hover:bg-yellow-500/10' : type === 'playlists' ? 'hover:bg-green-500/10' : type === 'downloads' ? 'hover:bg-blue-500/10' : 'hover:bg-[#a855f7]/10'}`}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            </>,
            document.body
          )}
        </div>
        
        <div className="relative max-w-sm w-full ml-4">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text"
            placeholder={type === 'downloads' ? 'Buscar en descargas' : 'Buscar en biblioteca'}
            value={searchQuery}
            onChange={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSearchPos({ top: rect.bottom, left: rect.left, width: rect.width });
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSearchPos({ top: rect.bottom, left: rect.left, width: rect.width });
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
          />
          {showSuggestions && suggestions.length > 0 && typeof document !== 'undefined' && createPortal(
            <div 
              style={{ top: searchPos.top, left: searchPos.left, width: searchPos.width }}
              className={`fixed mt-4 border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 ${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : type === 'downloads' ? 'border-blue-500/20' : 'border-[#a855f7]/20'}`}>
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(sug);
                    setShowSuggestions(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-[15px] tracking-wide rounded-lg transition-colors whitespace-nowrap overflow-hidden text-ellipsis text-white/60 hover:text-white ${type === 'licenses' ? 'hover:bg-yellow-500/10' : type === 'playlists' ? 'hover:bg-green-500/10' : type === 'downloads' ? 'hover:bg-blue-500/10' : 'hover:bg-[#a855f7]/10'}`}
                >
                  {sug}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>

      <div className="px-8 relative z-10 flex-1 pt-6 overflow-y-auto pb-8">
        {filteredTracks.length === 0 && searchQuery !== '' ? (
           <div className="text-center pt-10 text-white/50">
             No se encontraron resultados para "{searchQuery}"
           </div>
        ) : selectedAlbumId && groupedTracks[selectedAlbumId] ? (
          <div className="px-8 max-w-[1200px] mx-auto w-full pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedAlbumId(null)}
              className="flex items-center gap-2 text-white/50 hover:text-white font-medium text-sm mb-6 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver a álbumes
            </button>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
                {groupedTracks[selectedAlbumId].coverUrl ? (
                  <img src={groupedTracks[selectedAlbumId].coverUrl} alt={groupedTracks[selectedAlbumId].title} className="w-full h-full object-cover" />
                ) : (
                  <Icon className="w-12 h-12 text-white/20" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/70 text-xs font-bold tracking-widest uppercase">Álbum</span>
                <h2 className="text-4xl font-bold text-white tracking-tight">{groupedTracks[selectedAlbumId].title}</h2>
                <p className="text-white/50 text-base">{groupedTracks[selectedAlbumId].tracks[0]?.artist || 'Artista'} • {groupedTracks[selectedAlbumId].tracks.length} {groupedTracks[selectedAlbumId].tracks.length === 1 ? 'canción' : 'canciones'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => onPlayTrack && onPlayTrack(groupedTracks[selectedAlbumId].tracks[0], groupedTracks[selectedAlbumId] as any)} className="px-6 py-2 rounded-full bg-white hover:bg-white/90 text-black font-bold flex items-center gap-2 transition-transform hover:scale-105">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Reproducir
                  </button>
                  <FuseButton fuse="outline" commitOn="fuseEnd" 
              
                      label="Eliminar"
                      undoLabel="Deshacer"
                      doneLabel="Eliminado"
                      background="transparent"
                      color="#ffffff"
                      fuseColor="#ef4444"
                      undoWindow={2000}
                      className="!h-10 rounded-full border border-white/20 font-medium text-sm transition-all duration-300 hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 data-[phase=armed]:!border-red-500/30 data-[phase=armed]:!bg-red-500/10 data-[phase=armed]:!text-red-400 group/fuse"
                      onCommit={() => {
                        if (type === 'downloads') {
                          removeAlbumFromDownloads(groupedTracks[selectedAlbumId].id);
                        } else {
                          removeAlbumFromFavorites(groupedTracks[selectedAlbumId].id);
                        }
                      }}
                    />
                </div>
              </div>
            </div>
            
            <div className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_130px_90px_80px_50px]' : 'grid-cols-[50px_1fr_130px_80px_50px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-2`}>
              <div className="text-center">#</div>
              <div>TÍTULO</div>
              <div>AÑADIDO</div>
              {type === 'downloads' && <div>TAMAÑO</div>}
              <div className="text-left">TIEMPO</div>
              <div className="text-left">{type === 'downloads' ? 'DEL' : 'FAV'}</div>
            </div>

            <div className="flex flex-col gap-0.5">
              {groupedTracks[selectedAlbumId].tracks.map((track, index) => renderTrack(track, index))}
            </div>
          </div>
        ) : viewMode === 'canciones' ? (
          <div className="flex flex-col gap-10">
            {sortedGroups.map((group: any) => (
              <div key={group.id} className="flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-4 px-4">
                  <div className="flex items-center gap-4 cursor-pointer group/title" onClick={() => setSelectedAlbumId(group.id)}>
                    <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-lg transition-transform group-hover/title:scale-105">
                      {group.coverUrl ? (
                        <img src={group.coverUrl} alt={group.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight group-hover/title:underline">{group.title}</h2>
                      <p className="text-white/50 text-sm mt-0.5">{group.tracks[0]?.artist || 'Varios Artistas'}</p>
                      {downloadingAlbums?.includes(String(group.id)) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: group.id, title: group.title }); }}
                          className="mt-1 w-max px-2.5 py-1 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm cursor-pointer group/dlpill"
                        >
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400 mr-1.5 group-hover/dlpill:hidden" />
                          <X className="w-3 h-3 text-red-400 mr-1.5 hidden group-hover/dlpill:block" />
                          <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase group-hover/dlpill:text-red-400">
                            Descargando...
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onPlayTrack && onPlayTrack(group.tracks[0], group as any)} className={`w-10 h-10 rounded-full bg-white/10 hover:scale-105 flex items-center justify-center text-white transition-all border border-white/5 ${type === 'licenses' ? 'hover:bg-yellow-500 hover:border-yellow-500' : type === 'playlists' ? 'hover:bg-green-500 hover:border-green-500' : type === 'downloads' ? 'hover:bg-blue-500 hover:border-blue-500' : 'hover:bg-[#a855f7] hover:border-[#a855f7]'}`}>
                      <Play className="w-5 h-5 ml-1" fill="currentColor" />
                    </button>
                    <FuseButton fuse="outline" commitOn="fuseEnd" 
              
                      label=""
                      undoLabel=""
                      doneLabel=""
                      background="transparent"
                      color="rgba(255,255,255,0.4)"
                      fuseColor="#ef4444"
                      undoWindow={2000}
                      className="!w-10 !h-10 !min-w-[40px] !px-0 rounded-full border border-transparent transition-colors duration-300 hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 data-[phase=armed]:!border-red-500/30 data-[phase=armed]:!bg-red-500/10 data-[phase=armed]:!text-red-400 group/fuse"
                      onCommit={() => {
                        if (type === 'downloads') {
                          removeAlbumFromDownloads(group.id);
                        } else {
                          removeAlbumFromFavorites(group.id);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_130px_90px_80px_50px]' : 'grid-cols-[50px_1fr_130px_80px_50px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-1`}>
                  <div className="text-center">#</div>
                  <div>TÍTULO</div>
                  <div>AÑADIDO</div>
                  {type === 'downloads' && <div>TAMAÑO</div>}
                  <div className="text-left">TIEMPO</div>
                  <div className="text-left">{type === 'downloads' ? 'DEL' : 'FAV'}</div>
                </div>

                <div className="flex flex-col gap-0.5">
                  {group.tracks.map((track: any, index: number) => renderTrack(track, index))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12">
            {sortedGroups.map((album: any) => {
              const downloadedCount = album.tracks?.filter((t: any) => isDownloaded(t.id)).length || 0;
              const realAlbum = albums?.find(a => String(a.id) === String(album.id));
              const totalCount = realAlbum ? (realAlbum.tracks?.length || 0) : (album.tracks?.length || 0);
              const isComplete = downloadedCount > 0 && downloadedCount === totalCount;
              const isPartial = downloadedCount > 0 && downloadedCount < totalCount;
              const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every((t: any) => isFavorite(t.id)) : false;
              
              return (
                <div 
                  key={album.id}
                  className="shrink-0 flex flex-col gap-3 group cursor-pointer"
                  onClick={() => setSelectedAlbumId(album.id)}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg bg-white/5">
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {downloadingAlbums?.includes(String(album.id)) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: album.id, title: album.title }); }}
                        className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center transition-all z-20 group/cancel shadow-lg"
                        title="Cancelar descarga"
                      >
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400 group-hover/cancel:hidden" />
                        <X className="w-5 h-5 hidden group-hover/cancel:block text-red-400" />
                      </button>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        className="${type === 'licenses' ? 'bg-yellow-500 hover:bg-yellow-400' : type === 'playlists' ? 'bg-green-500 hover:bg-green-400' : type === 'downloads' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-[#a855f7] hover:bg-[#b066f8]'} w-14 h-14 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (album.tracks && album.tracks.length > 0) {
                            onPlayTrack && onPlayTrack(album.tracks[0], album as any);
                          }
                        }}
                      >
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col mt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-white font-bold text-sm line-clamp-1">{album.title}</h3>
                        <span className="text-white/50 text-xs mt-0.5 truncate">{album.tracks[0]?.artist || 'Artista'}</span>
                      </div>
                      <button 
                         onClick={(e) => { e.stopPropagation(); toggleFavoriteAlbum && toggleFavoriteAlbum(album as any); }}
                         className={`group/favbtn shrink-0 p-1 -mt-0.5 -mr-1 rounded-full transition-colors hover:scale-110 ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}`}
                      >
                         {isEntireAlbumFavorited ? (
                           <>
                             <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
                             <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
                           </>
                         ) : (
                           <Heart className="w-4 h-4" fill="none" />
                         )}
                      </button>
                    </div>
                    
                    {(() => {
                      const isDownloading = downloadingAlbums?.includes(String(album.id));
                      if (isDownloading) {
                        return (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: album.id, title: album.title }); }}
                            className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm"
                          >
                            <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              Descargando...
                            </span>
                          </button>
                        );
                      }
                      
                      if (isComplete || isPartial) {
                        return (
                          <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/20 flex items-center justify-center shadow-sm">
                            <span className="text-[#c084fc] text-[9px] font-bold tracking-wider uppercase">
                              {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Keep Modals... */}

      
      
      
    {showCancelConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelConfirm(null)} />
          <div className="relative bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Cancelar descarga?</h3>
                <p className="text-sm text-white/60 mt-1">Se detendrá la descarga de "{showCancelConfirm.title}".</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                Continuar descarga
              </button>
              <button onClick={() => { cancelAlbumDownload(String(showCancelConfirm.id)); setShowCancelConfirm(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
