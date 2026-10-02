import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DownloadCloud, Play, Heart, Clock, X, Trash2, Search, Loader2 } from 'lucide-react';
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
  albums
}: { 
  type?: 'downloads' | 'favorites', 
  title?: string, 
  icon?: any,
  onPlayTrack?: (t: Track, a: Album) => void,
  onSelectAlbum?: (a: Album) => void,
  albums?: Album[]
}) => {
  const { downloadedTracks, favoriteTracks, removeDownload, toggleFavorite, toggleFavoriteAlbum, isFavorite, isDownloaded, clearNewDownloads, totalBytes, clearDownloads, clearFavorites, removeAlbumFromDownloads, removeAlbumFromFavorites, downloadingAlbums, cancelAlbumDownload } = useDownloads();
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [albumToRemove, setAlbumToRemove] = useState<{ id: string, title: string } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [viewMode, setViewMode] = useState<'canciones' | 'albumes'>('canciones');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'recent' | 'alpha' | 'size_desc' | 'size_asc'>('default');
  const [showSort, setShowSort] = useState(false);

  const tracks = type === 'downloads' ? downloadedTracks : favoriteTracks;
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
        title: title,
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
        className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_150px_100px_100px_40px]' : 'grid-cols-[50px_1fr_150px_100px_40px]'} gap-4 px-4 py-2 items-center rounded-xl cursor-pointer group hover:bg-white/5 transition-colors`}
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
        
        <div className="flex items-center justify-end gap-4">
          <div className="w-10 text-right text-white/50 text-sm">
            {formatDuration(track.duration)}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button 
            onClick={(e) => handleRemove(e, track)}
            className={`${type === 'downloads' ? 'text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-[#a855f7] hover:text-[#b066f8] opacity-100'} transition-all p-2`}
            title={type === 'downloads' ? "Eliminar descarga" : "Quitar de favoritos"}
          >
            {type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <Heart className="w-4 h-4" fill="currentColor" />}
          </button>
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

  if (tracks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative z-10 px-8 text-center pt-24">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Tu lista está vacía</h2>
        <p className="text-white/50 max-w-md">
          {type === 'downloads' 
            ? 'Las canciones que descargues aparecerán aquí para que puedas escucharlas sin conexión a internet.'
            : 'Las canciones a las que les des "Me gusta" aparecerán aquí.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Hero Section */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between relative z-10 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className={`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center ${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}`}>
            <Icon className="w-16 h-16 text-white" />
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-white/70 text-sm font-semibold tracking-widest uppercase mt-2">Playlist</span>
            <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>
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
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all font-semibold text-xs"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar todo
            </button>
          </div>
        )}
      </div>

      {/* Action Bar (Search & Tabs) */}
      <div className="px-8 py-4 flex items-center justify-between sticky top-0 bg-transparent backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <button 
            onClick={() => { setViewMode('canciones'); setSelectedAlbumId(null); }} 
            className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'canciones' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'text-white/50 hover:text-white'}`}
          >
            Canciones
          </button>
          <button 
            onClick={() => { setViewMode('albumes'); setSelectedAlbumId(null); }} 
            className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'albumes' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'text-white/50 hover:text-white'}`}
          >
            Álbumes
          </button>
        </div>

        <div className="relative z-50">
          <button 
            onClick={() => setShowSort(!showSort)} 
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium group relative z-50"
          >
            <span className="text-white/30 mr-1">Ordenar:</span> {sortBy === 'default' ? 'Por defecto' : sortBy === 'recent' ? 'Añadidos recientemente' : sortBy === 'alpha' ? 'Alfabéticamente' : sortBy === 'size_desc' ? 'Más pesados' : 'Menos pesados'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-px"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showSort && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50">
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
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${sortBy === opt.id ? 'text-[#a855f7] font-semibold bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            </>
          )}
        </div>
        
        <div className="relative max-w-sm w-full ml-4">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text"
            placeholder={type === 'downloads' ? "Buscar en descargas..." : "Buscar en favoritos..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(sug);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                >
                  {sug}
                </button>
              ))}
            </div>
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
                  <button 
                    onClick={() => setAlbumToRemove(groupedTracks[selectedAlbumId])}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 text-white transition-all font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_150px_100px_100px_40px]' : 'grid-cols-[50px_1fr_150px_100px_40px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-2`}>
              <div className="text-center">#</div>
              <div>TÍTULO</div>
              <div>AÑADIDO</div>
              {type === 'downloads' && <div>TAMAÑO</div>}
              <div className="flex justify-end pr-6"><Clock className="w-4 h-4" /></div>
              <div></div>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onPlayTrack && onPlayTrack(group.tracks[0], group as any)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 flex items-center justify-center text-white transition-all border border-white/5">
                      <Play className="w-5 h-5 ml-1" fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => setAlbumToRemove(group)}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 hover:text-red-400 text-white/40 transition-colors"
                      title="Eliminar lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className={`grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_150px_100px_100px_40px]' : 'grid-cols-[50px_1fr_150px_100px_40px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase border-b border-white/5 mb-1`}>
                  <div className="text-center">#</div>
                  <div>TÍTULO</div>
                  <div>AÑADIDO</div>
                  {type === 'downloads' && <div>TAMAÑO</div>}
                  <div className="flex justify-end pr-4"><Clock className="w-4 h-4" /></div>
                  <div></div>
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        className="w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
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
                         className={`shrink-0 p-1 -mt-0.5 -mr-1 rounded-full transition-colors hover:scale-110 ${isEntireAlbumFavorited ? 'text-[#a855f7]' : 'text-white/30 hover:text-white'}`}
                      >
                         <Heart className="w-4 h-4" fill={isEntireAlbumFavorited ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    
                    {(() => {
                      const isDownloading = downloadingAlbums?.includes(String(album.id));
                      if (isDownloading) {
                        return (
                          <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm">
                            <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              Descargando...
                            </span>
                          </div>
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

      {albumToRemove && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setAlbumToRemove(null)}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">¿Vaciar lista?</h3>
            </div>
            <p className="text-white/70 mb-6">
              ¿Estás seguro de que deseas eliminar todas las canciones de <strong>{albumToRemove.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setAlbumToRemove(null)} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (type === 'downloads') {
                    removeAlbumFromDownloads(albumToRemove.id);
                  } else {
                    removeAlbumFromFavorites(albumToRemove.id);
                  }
                  setAlbumToRemove(null);
                }} 
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Vaciar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {trackToRemove && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setTrackToRemove(null)}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                {type === 'downloads' ? <Trash2 className="w-6 h-6 text-red-500" /> : <X className="w-6 h-6 text-red-500" />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {type === 'downloads' ? '¿Eliminar descarga?' : '¿Quitar de favoritos?'}
              </h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              ¿Estás seguro que deseas {type === 'downloads' ? 'eliminar' : 'quitar'} <strong>{trackToRemove.title}</strong> de tu lista?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setTrackToRemove(null)} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (type === 'downloads') {
                    removeDownload(trackToRemove.id);
                  } else {
                    toggleFavorite(trackToRemove);
                  }
                  setTrackToRemove(null);
                }} 
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              >
                {type === 'downloads' ? 'Eliminar' : 'Quitar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {showClearConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => { setShowClearConfirm(false); setConfirmText(''); }}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {type === 'downloads' ? '¿Vaciar todas las descargas?' : '¿Vaciar todos los favoritos?'}
              </h3>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">
              Esta acción no se puede deshacer. Se eliminarán las <strong>{tracks.length}</strong> canciones de tu lista.
              Para confirmar, escribe <strong className="text-red-400">CONFIRMAR</strong> a continuación:
            </p>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              autoFocus
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/20 mb-6 transition-colors"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowClearConfirm(false);
                  setConfirmText("");
                }} 
                className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmText.toUpperCase() === 'CONFIRMAR') {
                    if (type === 'downloads') {
                      clearDownloads();
                    } else {
                      clearFavorites();
                    }
                    setShowClearConfirm(false);
                    setConfirmText("");
                  }
                }}
                disabled={confirmText.toUpperCase() !== 'CONFIRMAR'}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
              >
                Eliminar todo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
