import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRubberBand } from '../ui/useRubberBand';
import { ListScrollbar } from '../ui/ListScrollbar';
import { createPortal } from 'react-dom';
import { LiquidTabs } from '../ui/LiquidTabs';
import { PopoverMenu } from '../ui/PopoverMenu';
import { BackButton } from '../ui/BackButton';
import { SectionHero, SectionEmpty } from '../ui/SectionHero';
import { NowPlayingToggle } from '../ui/NowPlayingToggle';
import { TrackMenu } from './TrackMenu';
import { SelectableCard } from '../ui/SelectableCard';
import { SelectionBar } from '../ui/SelectionBar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { userStorage } from '../../lib/userStorage';
import { Star, StarOff, DownloadCloud, Play, Heart, HeartOff, Clock, X, Trash2, Search, Loader2, Check, AlertCircle, Music2, Disc3, HardDrive, ListMusic, ChevronDown, MoreHorizontal, ListChecks } from 'lucide-react';
import FuseButton from '../ui/FuseButton';
import HoldButton from '../ui/HoldButton';
import { useDownloads } from './DownloadsContext';
import { usePlayback } from './PlaybackContext';
import { DownloadProgressPill } from './DownloadProgressPill';
import type { Track, Album } from './types';
import { cardStyle, titleStyle } from '../auth/authUi';

const FadeScroll = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { containerRef, springValue, scrollProps, triggerBounce } = useRubberBand({ axis: 'y' });
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const update = () => {
    const el = containerRef.current;
    if (!el) return;
    setEdges({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 });
  };
  useEffect(() => {
    update();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  const mask = `linear-gradient(to bottom, ${edges.top ? 'transparent 0, black 40px' : 'black 0'}, ${edges.bottom ? 'black calc(100% - 40px), transparent 100%' : 'black 100%'})`;
  return (
    <div className="relative">
      <ListScrollbar containerRef={containerRef} onBounce={triggerBounce} springY={springValue} className="-right-5 top-2 bottom-2" />
      <div
        ref={containerRef}
        {...scrollProps}
        onScroll={() => { scrollProps.onScroll(); update(); }}
        onWheel={(e) => {
          scrollProps.onWheel(e);
          // the page stays still while the list itself scrolls
          const el = e.currentTarget;
          if (el.scrollHeight > el.clientHeight + 1) e.stopPropagation();
        }}
        className={`overflow-y-auto overscroll-contain scrollbar-hide ${className}`}
        style={{ scrollbarWidth: 'none', maskImage: mask, WebkitMaskImage: mask }}
      >
        <motion.div style={{ y: springValue }}>{children}</motion.div>
      </div>
    </div>
  );
};

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
  const { downloadedTracks, licensedTracks, favoriteTracks, clearLicenses, removeAlbumFromLicenses, removeDownload, toggleFavorite, removeLicensedTrack, isLicensed, toggleFavoriteAlbum, isFavorite, isDownloaded, clearNewDownloads, totalBytes, clearDownloads, clearFavorites, removeAlbumFromDownloads, removeAlbumFromFavorites, downloadingAlbums, cancelAlbumDownload } = useDownloads();
  const playback = usePlayback();
  const { containerRef: listScrollRef, springValue: listSpringY, scrollProps: listScrollProps } = useRubberBand({ axis: 'y' });
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
  const [sortBy, setSortBy] = useState<'default' | 'recent' | 'alpha' | 'size_desc' | 'size_asc' | 'manual'>('default');
  // edit mode (like the iOS home screen): select albums with checks, delete them, or drag them into your own order
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const orderKey = `bz_album_order_${type}`;
  const [manualOrder, setManualOrder] = useState<string[]>(() => {
    try { return JSON.parse(userStorage.getItem(orderKey) || '[]'); } catch { return []; }
  });
  const [showSort, setShowSort] = useState(false);
  const [rowMenu, setRowMenu] = useState<{ track: Track; anchor: { x: number; y: number; x2?: number } } | null>(null);
  const [sortPos, setSortPos] = useState({ top: 0, left: 0, right: 0 });
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


  const tracks = type === 'downloads' ? downloadedTracks : type === 'favorites' ? favoriteTracks : type === 'licenses' ? licensedTracks : [];
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
  const getDaysLeft = (addedAt?: string) => {
    if (!addedAt) return '-';
    const daysPassed = (Date.now() - new Date(addedAt).getTime()) / (1000 * 60 * 60 * 24);
    const remaining = Math.floor(30 - daysPassed);
    if (remaining < 0) return 'expirado';
    if (remaining === 0) return 'último día';
    if (remaining === 1) return '1 día';
    return `${remaining} días`;
  };

  const getExpirationDate = (addedAt?: string) => {
    if (!addedAt) return '-';
    const d = new Date(addedAt);
    d.setDate(d.getDate() + 30);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${year}-${month}-${day}`;
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

  // the album a song belongs to, for the song menu (queue, playlists, go to album / artist)
  const albumFor = (t: Track): Album =>
    albums?.find((a) => String(a.id) === String(t.albumId)) ??
    ({ id: t.albumId ?? 0, title: t.albumTitle || '', artist: t.artist, coverUrl: t.albumCover || '', year: '', genre: '', trackCount: 0 } as Album);

  const rowMenuItems = (t: Track) => [
    { label: 'Reproducir', icon: <Play className="w-4 h-4" />, onSelect: () => handlePlay(t) },
    type === 'favorites'
      ? { label: 'Quitar de favoritos', icon: <HeartOff className="w-4 h-4" />, onSelect: () => toggleFavorite(t), danger: true }
      : { label: isFavorite(t.id) ? 'Quitar de favoritos' : 'Agregar a favoritos', icon: <Heart className="w-4 h-4" />, onSelect: () => toggleFavorite(t) },
    ...(type === 'downloads' ? [{ label: 'Eliminar descarga', icon: <Trash2 className="w-4 h-4" />, onSelect: () => removeDownload(t.id), danger: true }] : []),
    ...(type === 'licenses' ? [{ label: 'Quitar licencia', icon: <StarOff className="w-4 h-4" />, onSelect: () => setTrackToRemove(t), danger: true }] : []),
  ];

  const renderTrack = (track: Track, index: number, large = false) => {
    const isHovered = hoveredTrack === track.id;
    const isCurrent = playback.nowPlayingTrackId === track.id;
    const layer = 'absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
    return (
      <div
        key={track.id}
        onMouseEnter={() => setHoveredTrack(track.id)}
        onMouseLeave={() => setHoveredTrack(null)}
        onClick={() => handlePlay(track)}
        onContextMenu={(e) => { e.preventDefault(); setRowMenu({ track, anchor: { x: e.clientX, y: e.clientY } }); }}
        className={`grid grid-cols-[28px_minmax(0,1fr)_84px] ${type === 'downloads' ? 'lg:grid-cols-[50px_1fr_130px_90px_80px_100px]' : type === 'licenses' ? 'lg:grid-cols-[50px_1fr_130px_90px_90px_80px_100px]' : 'lg:grid-cols-[50px_1fr_130px_80px_100px]'} gap-2 lg:gap-4 px-1 lg:px-4 ${large ? 'py-4' : 'py-2.5'} items-center rounded-2xl cursor-pointer group transition-colors duration-300 ${isCurrent ? 'bg-white/[0.09] backdrop-blur-xl' : 'hover:bg-white/[0.06]'}`}
      >
        <div className="relative h-9 flex items-center justify-center text-white/50 font-medium">
          {isCurrent ? (
            // the playing song: bars that become pause / play on hover
            <NowPlayingToggle isPlaying={playback.isPlaying} isLoading={playback.isLoading} onToggle={playback.togglePlay} className="-mx-1 lg:mx-0" />
          ) : (
            // number that pops into a play icon on hover
            <span className="relative w-6 h-6 flex items-center justify-center">
              <span className={`${layer} tabular-nums ${isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>{index + 1}</span>
              <span className={`${layer} text-white ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}><Play className="w-4 h-4" fill="currentColor" aria-hidden="true" /></span>
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1 lg:pr-4">
          <span className={`font-medium line-clamp-1 text-white ${large ? 'text-base lg:text-[17px]' : 'text-[15px] lg:text-sm'} flex items-center gap-1.5`}>
            {isLicensed(track.id) && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
            <span className="truncate">{track.title}</span>
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-white/50 text-[13px] ${large ? 'lg:text-[15px]' : 'lg:text-sm'} line-clamp-1 group-hover:text-white/80 transition-colors`}>{track.artist}</span>
            {type === 'licenses' && <span className="lg:hidden shrink-0 text-yellow-500/80 text-[11px] font-bold tracking-wide">· {getDaysLeft(track.addedAt)}</span>}
          </div>
        </div>
        
        <div className="hidden lg:flex text-white/50 text-xs font-medium truncate items-center justify-center">
          <TimeAgo dateStr={track.addedAt} />
        </div>
        
        {type === 'downloads' && (
          <div className="hidden lg:flex text-white/50 text-xs font-medium items-center justify-center">
            {formatSize(track.sizeMb, track.duration)}
          </div>
        )}
        
        {type === 'licenses' && (
          <>
            <div className="hidden lg:flex text-yellow-500/80 text-[11px] font-bold tracking-widest items-center justify-center">
              {getDaysLeft(track.addedAt)}
            </div>
            <div className="hidden lg:flex text-white/50 text-xs font-medium items-center justify-center">
              {getExpirationDate(track.addedAt)}
            </div>
          </>
        )}
        
        <div className="hidden lg:flex text-center text-white/50 text-sm items-center justify-center">
          {formatDuration(track.duration)}
        </div>

        <div className="flex items-center justify-end lg:justify-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              setRowMenu({ track, anchor: { x: r.left, y: r.bottom + 6, x2: r.right } });
            }}
            className="w-9 h-9 lg:w-8 lg:h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
            title="Más opciones"
            aria-label={`Más opciones para ${track.title}`}
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
          {type === 'downloads' ? (
            <FuseButton fuse="outline" commitOn="fuseEnd" radius={16} 
              
              label=""
              undoLabel=""
              doneLabel=""
              background="transparent"
              color="rgba(255,255,255,0.3)"
              fuseColor="#ef4444"
              undoWindow={2000}
              className="transition-all duration-300 !w-10 !h-10 !min-w-[40px] lg:!w-8 lg:!h-8 lg:!min-w-[32px] !px-0 rounded-full border border-transparent hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 data-[phase=armed]:!border-red-500/30 data-[phase=armed]:!bg-red-500/10 data-[phase=armed]:!text-red-400 group/fuse"
              icon={<Trash2 className="w-4 h-4" />}
              onCommit={() => removeDownload(track.id)}
            />
          ) : type === 'licenses' ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setTrackToRemove(track);
              }}
              aria-label={`Quitar licencia de ${track.title}`}
              title="Quitar licencia"
              className="group/favbtn w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center text-yellow-500 hover:text-yellow-400 opacity-100 transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-full cursor-pointer pop-press"
            >
              <Star className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
              <StarOff className="w-4 h-4 hidden group-hover/favbtn:block" />
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
              }}
              aria-label={`Quitar ${track.title} de favoritos`}
              title="Quitar de favoritos"
              className="group/favbtn w-11 h-11 lg:w-auto lg:h-auto flex items-center justify-center text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full cursor-pointer pop-press"
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
    if (sortBy === 'manual') {
      const rank = (g: any) => { const i = manualOrder.indexOf(String(g.id)); return i < 0 ? 1e9 : i; };
      return rank(a) - rank(b);
    }
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

  

  const exitEditing = () => { setEditing(false); setSelected(new Set()); setDragId(null); };
  const toggleSelected = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const moveAlbum = (fromId: string, toId: string) => {
    const ids = sortedGroups.map((g: any) => String(g.id));
    const from = ids.indexOf(fromId), to = ids.indexOf(toId);
    if (from < 0 || to < 0 || from === to) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setManualOrder(ids);
    userStorage.setItem(orderKey, JSON.stringify(ids));
    setSortBy('manual');
  };
  const deleteSelected = () => {
    selected.forEach((id) => {
      if (type === 'downloads') removeAlbumFromDownloads(id);
      else if (type === 'licenses') removeAlbumFromLicenses(id);
      else removeAlbumFromFavorites(id);
    });
    setConfirmDelete(false);
    exitEditing();
  };
  const where = type === 'downloads' ? 'tus descargas' : type === 'licenses' ? 'tus canciones con licencia' : 'tus favoritas';

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
      <SectionHero
        type={type}
        icon={Icon}
        kicker={type === 'downloads' ? 'Mis descargas' : 'Biblioteca'}
        title={title}
        stats={[
          { icon: <Music2 className="w-3.5 h-3.5" aria-hidden="true" />, text: `${tracks.length} ${tracks.length === 1 ? 'canción' : 'canciones'}` },
          { icon: <Disc3 className="w-3.5 h-3.5" aria-hidden="true" />, text: `${Object.keys(groupedTracks).length} ${Object.keys(groupedTracks).length === 1 ? 'álbum' : 'álbumes'}` },
          ...(type === 'downloads' ? [{ icon: <HardDrive className="w-3.5 h-3.5" aria-hidden="true" />, text: `${availableGB.toFixed(2)}GB libres de 5.00GB` }] : []),
        ]}
        actions={tracks.length > 0 ? (
          <button
            onClick={() => { if (editing) exitEditing(); else { setViewMode('albumes'); setSelectedAlbumId(null); setEditing(true); } }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer ${editing ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-white/[0.09] hover:bg-white/[0.17]'}`}
          >
            {editing ? <Check className="w-4 h-4" aria-hidden="true" /> : <ListChecks className="w-4 h-4" aria-hidden="true" />}
            {editing ? 'Listo' : 'Seleccionar'}
          </button>
        ) : undefined}
      />

      {/* Action Bar (Search & Tabs) */}
      <div className="px-4 md:px-8 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sticky top-0 bg-[#07050c]/60 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none z-30">
        {/* same glass dock as the player's tabs */}
        <div className="rounded-full p-1.5 w-[220px] md:w-[250px] bg-white/10 hover:bg-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300">
          <LiquidTabs
            value={viewMode}
            onChange={(id) => { setViewMode(id); setSelectedAlbumId(null); }}
            tabs={[
              { id: 'canciones' as const, label: 'Canciones', title: 'Ver por canciones' },
              { id: 'albumes' as const, label: 'Álbumes', title: 'Ver por álbumes' },
            ]}
          />
        </div>

        <div className="relative z-50">
          <button 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSortPos({ top: rect.bottom + 6, left: rect.left, right: rect.right });
              setShowSort(!showSort);
            }} 
            title="Opciones de ordenamiento"
            aria-label="Ordenar elementos"
            aria-expanded={showSort}
            className="flex items-center gap-1.5 min-h-[44px] md:min-h-0 whitespace-nowrap text-white/75 hover:text-white bg-white/[0.07] hover:bg-white/[0.13] backdrop-blur-xl transition-colors text-sm font-medium group relative z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full pl-4 pr-3 py-2 cursor-pointer"
          >
            <span className="hidden sm:inline text-white/40 mr-0.5">Ordenar:</span> {sortBy === 'default' ? 'Por defecto' : sortBy === 'recent' ? 'Añadidos recientemente' : sortBy === 'alpha' ? 'Alfabéticamente' : sortBy === 'size_desc' ? 'Más pesados' : sortBy === 'manual' ? 'Mi orden' : 'Menos pesados'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showSort ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <PopoverMenu
            open={showSort}
            anchor={showSort ? { x: sortPos.left, y: sortPos.top, x2: sortPos.right } : null}
            width={260}
            onClose={() => setShowSort(false)}
            items={[
              { id: 'default', label: 'Por defecto' },
              { id: 'recent', label: 'Añadidos recientemente' },
              { id: 'alpha', label: 'Alfabéticamente' },
              { id: 'size_desc', label: 'Más pesados' },
              { id: 'size_asc', label: 'Menos pesados' },
              ...(manualOrder.length ? [{ id: 'manual', label: 'Mi orden' }] : []),
            ].map((opt) => ({
              label: opt.label,
              active: sortBy === opt.id,
              icon: sortBy === opt.id ? <Check className="w-4 h-4" /> : undefined,
              onSelect: () => setSortBy(opt.id as any),
            }))}
          />
        </div>
        
        <div className="relative w-full md:max-w-sm md:ml-4 md:focus-within:max-w-md transition-[max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
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
            className="w-full bg-white/[0.07] backdrop-blur-xl rounded-full pl-11 pr-4 py-2.5 md:py-2.5 text-base md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:ring-1 focus:ring-white/25 transition-[background-color,box-shadow] duration-300"
          />
          {showSuggestions && suggestions.length > 0 && typeof document !== 'undefined' && createPortal(
            <div 
              style={{ top: searchPos.top, left: searchPos.left, width: searchPos.width }}
              className="fixed mt-3 rounded-3xl p-2 z-[9999] backdrop-blur-xl flex flex-col gap-0.5 font-sans bg-black/40 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)]">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(sug);
                    setShowSuggestions(false);
                  }}
                  title={`Buscar: ${sug}`}
                  aria-label={`Sugerencia de búsqueda: ${sug}`}
                  className="w-full text-left px-3.5 py-2.5 text-[14px] rounded-2xl transition-colors whitespace-nowrap overflow-hidden text-ellipsis focus-visible:outline-none focus-visible:bg-white/10 text-white/75 hover:text-white hover:bg-white/10"
                >
                  {sug}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>
      <div 
        ref={listScrollRef} 
        {...listScrollProps} 
        className="px-3 md:px-8 relative z-10 flex-1 pt-4 md:pt-6 overflow-y-auto pb-8 scrollbar-hide"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <motion.div style={{ y: listSpringY }}>
        {tracks.length === 0 && searchQuery === '' ? (
          <SectionEmpty
            type={type}
            icon={Icon}
            title={type === 'downloads' ? "Aún no tienes descargas" : type === 'favorites' ? "Todavía no tienes favoritas" : "No tienes canciones con licencia"}
            text={type === 'downloads' ? "Descarga canciones o álbumes con el botón de descarga y escúchalas aquí, sin conexión." : type === 'favorites' ? "Toca el corazón de cualquier canción para guardarla aquí." : "Las canciones con licencia aparecen aquí y duran 30 días."}
          />
        ) : filteredTracks.length === 0 && searchQuery !== '' ? (
           <div className="text-center pt-16 text-white/55">
             No se encontraron resultados para <span className="text-white/85 font-medium">"{searchQuery}"</span>
           </div>
        ) : selectedAlbumId && groupedTracks[selectedAlbumId] ? (
          (() => {
            const g = groupedTracks[selectedAlbumId];
            const favAlbum = g.tracks.length ? g.tracks.every((t: any) => isFavorite(t.id)) : false;
            const removeAll = () => {
              if (type === 'downloads') removeAlbumFromDownloads(g.id);
              else if (type === 'licenses') removeAlbumFromLicenses(g.id);
              else if (type === 'playlists') window.dispatchEvent(new CustomEvent('show-toast', { detail: `Lista de reproducción '${g.title}' eliminada` }));
              else removeAlbumFromFavorites(g.id);
            };
            return (
              <div className="px-1 md:px-8 w-full pb-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* like the album page: back button, cover with title and actions, and the list, all starting on the same line */}
                <div className="grid grid-cols-1 lg:grid-cols-[44px_minmax(240px,380px)_minmax(0,1fr)] gap-4 lg:gap-12 items-start">
                  <BackButton onClick={() => setSelectedAlbumId(null)} label="Volver a la lista de álbumes" text="Volver a álbumes" hoverWidth="" />
                  <div className="flex flex-col items-center lg:items-start gap-4 min-w-0">
                    <div className="relative w-[min(68vw,300px)] lg:w-full lg:max-w-[min(100%,calc(100dvh-520px))] aspect-square rounded-3xl overflow-hidden bg-white/5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
                      {g.coverUrl ? <img src={g.coverUrl} alt={g.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon className="w-16 h-16 text-white/20" /></div>}
                    </div>
                    <div className="flex flex-col gap-1.5 text-center lg:text-left min-w-0 w-full">
                      <span className="text-white/60 text-xs font-semibold tracking-[0.25em] uppercase">Álbum</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight break-words">{g.title}</h2>
                      <p className="text-white/60 text-sm md:text-base">{g.tracks[0]?.artist || 'Artista'} • {g.tracks.length} {g.tracks.length === 1 ? 'canción' : 'canciones'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-full w-max" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(28px) saturate(1.15)', WebkitBackdropFilter: 'blur(28px) saturate(1.15)' }}>
                      <button
                        onClick={() => playback.playAlbum(g as any)}
                        title={`Reproducir todo ${g.title}`}
                        aria-label={`Reproducir todo ${g.title}`}
                        className="h-12 pl-4 pr-5 rounded-full flex items-center gap-2 bg-white/[0.14] hover:bg-white/[0.24] text-white text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                      >
                        <Play className="w-5 h-5" fill="currentColor" aria-hidden="true" />
                        Reproducir todo
                      </button>
                      <button
                        onClick={() => toggleFavoriteAlbum && toggleFavoriteAlbum(g as any)}
                        title={favAlbum ? 'Quitar álbum de favoritos' : 'Guardar álbum en favoritos'}
                        aria-label={favAlbum ? 'Quitar álbum de favoritos' : 'Guardar álbum en favoritos'}
                        aria-pressed={favAlbum}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                      >
                        <span key={String(favAlbum)} className="pop-in inline-flex">
                          <Heart className={`w-5 h-5 ${favAlbum ? 'text-[#a855f7]' : ''}`} fill={favAlbum ? 'currentColor' : 'none'} aria-hidden="true" />
                        </span>
                      </button>
                      <FuseButton fuse="outline" commitOn="fuseEnd" radius={20}
                        label=""
                        undoLabel=""
                        doneLabel=""
                        background="transparent"
                        color="rgba(255,255,255,0.8)"
                        fuseColor="#ef4444"
                        undoWindow={2000}
                        className="!w-12 !h-12 !min-w-[48px] !px-0 rounded-full border border-transparent transition-colors duration-300 hover:!bg-red-500/10 hover:!text-red-300 data-[phase=armed]:!bg-red-500/10 data-[phase=armed]:!text-red-300 group/fuse"
                        icon={<Trash2 className="w-5 h-5" />}
                        onCommit={removeAll}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className={`hidden lg:grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_130px_90px_80px_100px]' : type === 'licenses' ? 'grid-cols-[50px_1fr_130px_90px_90px_80px_100px]' : 'grid-cols-[50px_1fr_130px_80px_100px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase mb-2`}>
                      <div className="text-center">#</div>
                      <div>TÍTULO</div>
                      <div className="text-center">AÑADIDO</div>
                      {type === 'downloads' && <div className="text-center">TAMAÑO</div>}
                      {type === 'licenses' && <div className="text-center">EXPIRACIÓN</div>}
                      {type === 'licenses' && <div className="text-center">HASTA</div>}
                      <div className="text-center">TIEMPO</div>
                      <div className="text-center">{type === 'downloads' ? 'ELIMINAR' : type === 'licenses' ? 'LICENCIA' : 'FAVORITOS'}</div>
                    </div>
                    {/* about six big rows, then it scrolls inside */}
                    <FadeScroll className="lg:max-h-[min(calc(100dvh-400px),30rem)] -mx-2 px-2">
                      <div className="flex flex-col gap-0.5">
                        {g.tracks.map((track: any, index: number) => renderTrack(track, index, true))}
                      </div>
                    </FadeScroll>
                  </div>
                </div>
              </div>
            );
          })()
        ) : viewMode === 'canciones' ? (
          <div className="flex flex-col gap-8 md:gap-10">
            {sortedGroups.map((group: any) => (
              <div key={group.id} className="flex flex-col">
                <div className="flex items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4 px-1 md:px-4">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 cursor-pointer group/title" onClick={() => setSelectedAlbumId(group.id)}>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/title:scale-105">
                      {group.coverUrl ? (
                        <img src={group.coverUrl} alt={group.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base md:text-xl font-bold text-white tracking-tight group-hover/title:underline truncate">{group.title}</h2>
                      <p className="text-white/50 text-[13px] md:text-sm mt-0.5 truncate">{group.tracks[0]?.artist || 'Varios Artistas'}</p>
                      {downloadingAlbums?.includes(String(group.id)) && (
                        <DownloadProgressPill
                          downloadedCount={group.tracks?.filter((t: any) => isDownloaded(t.id)).length || 0}
                          totalCount={group.tracks?.length || 0}
                          onCancel={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: group.id, title: group.title }); }}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <button 
                      onClick={() => playback.playAlbum(group as any)} 
                      title={`Reproducir ${group.title}`}
                      aria-label={`Reproducir ${group.title}`}
                      className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur-xl flex items-center justify-center text-white transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                    >
                      <Play className="w-5 h-5 ml-1" fill="currentColor" />
                    </button>
                    <FuseButton fuse="outline" commitOn="fuseEnd" radius={20} 
              
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
                        } else if (type === 'licenses') {
                          removeAlbumFromLicenses(group.id);
                        } else if (type === 'playlists') {
                          window.dispatchEvent(new CustomEvent('show-toast', { detail: `Lista de reproducción '${group.title}' eliminada` }));
                        } else {
                          removeAlbumFromFavorites(group.id);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className={`hidden lg:grid ${type === 'downloads' ? 'grid-cols-[50px_1fr_130px_90px_80px_100px]' : type === 'licenses' ? 'grid-cols-[50px_1fr_130px_90px_90px_80px_100px]' : 'grid-cols-[50px_1fr_130px_80px_100px]'} gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1`}>
                  <div className="text-center">#</div>
                  <div>TÍTULO</div>
                  <div className="text-center">AÑADIDO</div>
                  {type === 'downloads' && <div className="text-center">TAMAÑO</div>}
                  {type === 'licenses' && <div className="text-center">EXPIRACIÓN</div>}
                  {type === 'licenses' && <div className="text-center">HASTA</div>}
                  <div className="text-center">TIEMPO</div>
                  <div className="text-center">{type === 'downloads' ? 'ELIMINAR' : type === 'licenses' ? 'LICENCIA' : 'FAVORITOS'}</div>
                </div>

                <div className="flex flex-col gap-0.5">
                  {group.tracks.map((track: any, index: number) => renderTrack(track, index))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 pb-12">
            {sortedGroups.map((album: any, albumIdx: number) => {
              const downloadedCount = album.tracks?.filter((t: any) => isDownloaded(t.id)).length || 0;
              const realAlbum = albums?.find(a => String(a.id) === String(album.id));
              const totalCount = realAlbum ? (realAlbum.tracks?.length || 0) : (album.tracks?.length || 0);
              const isComplete = downloadedCount > 0 && downloadedCount === totalCount;
              const isPartial = downloadedCount > 0 && downloadedCount < totalCount;
              const isEntireAlbumFavorited = album.tracks?.length ? album.tracks.every((t: any) => isFavorite(t.id)) : false;
              
              return (
                <SelectableCard
                  key={album.id}
                  id={String(album.id)}
                  index={albumIdx}
                  editing={editing}
                  selected={selected.has(String(album.id))}
                  dragging={dragId === String(album.id)}
                  label={album.title}
                  onToggle={toggleSelected}
                  onEnterEdit={(id) => { setEditing(true); setSelected(new Set([id])); }}
                  onDragStartId={setDragId}
                  onDragOverId={(id) => { if (dragId && dragId !== id) moveAlbum(dragId, id); }}
                  onDragEndId={() => setDragId(null)}
                >
                <div
                  className="shrink-0 flex flex-col gap-3 group cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1"
                  onClick={() => setSelectedAlbumId(album.id)}
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] bg-white/5">
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {downloadingAlbums?.includes(String(album.id)) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: album.id, title: album.title }); }}
                        className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 border border-emerald-500/35 hover:border-red-500/40 backdrop-blur-md flex items-center justify-center transition-all z-20 group/cancel shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        title="Cancelar descarga"
                        aria-label={`Cancelar descarga de ${album.title}`}
                      >
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400 group-hover/cancel:hidden" />
                        <X className="w-5 h-5 hidden group-hover/cancel:block text-red-400" />
                      </button>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button 
                        title={`Reproducir álbum ${album.title}`}
                        aria-label={`Reproducir álbum ${album.title}`}
                        className="w-14 h-14 text-white rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.4)] scale-75 group-hover:scale-100 transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (album.tracks && album.tracks.length > 0) {
                            playback.playAlbum(album as any);
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
                         title={isEntireAlbumFavorited ? `Quitar álbum ${album.title} de favoritos` : `Guardar álbum ${album.title} en favoritos`}
                         aria-label={isEntireAlbumFavorited ? `Quitar álbum ${album.title} de favoritos` : `Guardar álbum ${album.title} en favoritos`}
                         aria-pressed={isEntireAlbumFavorited}
                         className={`group/favbtn shrink-0 p-1 -mt-0.5 -mr-1 rounded-full transition-colors hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${isEntireAlbumFavorited ? 'text-[#a855f7] hover:text-[#b066f8]' : 'text-white/30 hover:text-white'}`}
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
                          <DownloadProgressPill
                            downloadedCount={downloadedCount}
                            totalCount={totalCount}
                            onCancel={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: album.id, title: album.title }); }}
                          />
                        );
                      }
                      
                      if (isComplete || isPartial) {
                        return (
                          <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-white/[0.16] backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.25)] flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                              {isComplete ? 'Descarga Completa' : 'Descarga Parcial'}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                </SelectableCard>
              );
            })}
          </div>
        )}
        </motion.div>
      </div>
      
      {/* Keep Modals... */}

      
      
      
    <AnimatePresence>
      {editing && (
        <SelectionBar
          count={selected.size}
          total={sortedGroups.length}
          noun="álbumes"
          onSelectAll={() => setSelected(new Set(sortedGroups.map((g: any) => String(g.id))))}
          onClearSelection={() => setSelected(new Set())}
          onDelete={() => setConfirmDelete(true)}
          onDone={exitEditing}
        />
      )}
    </AnimatePresence>
    <ConfirmDialog
      open={confirmDelete}
      title={`¿Eliminar ${selected.size} ${selected.size === 1 ? 'álbum' : 'álbumes'}?`}
      text={`Se quitarán de ${where}. Esto no se puede deshacer.`}
      confirmLabel="Sí, eliminar"
      onConfirm={deleteSelected}
      onCancel={() => setConfirmDelete(false)}
    />

    <TrackMenu
      track={rowMenu?.track ?? null}
      album={rowMenu ? albumFor(rowMenu.track) : ({ id: 0, title: '', artist: '', coverUrl: '', year: '', genre: '', trackCount: 0 } as Album)}
      anchor={rowMenu?.anchor ?? null}
      onClose={() => setRowMenu(null)}
      leadingItems={rowMenu ? rowMenuItems(rowMenu.track) : []}
    />

    {trackToRemove && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setTrackToRemove(null)}>
          <div className="relative rounded-3xl p-8 sm:p-9 max-w-md w-full shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ ...cardStyle, border: 'none', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.65)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg">
                <AlertCircle className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>¿Quitar licencia?</h3>
            </div>
            <p className="text-white/80 mb-7 text-base leading-relaxed relative z-10">
              Se eliminará <span className="text-white font-medium">"{trackToRemove.title}"</span> de tus canciones con licencia.
            </p>
            <div className="flex justify-end gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => setTrackToRemove(null)} 
                title="Cancelar y mantener licencia"
                aria-label="Cancelar y mantener licencia"
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => { removeLicensedTrack(trackToRemove.id); setTrackToRemove(null); }} 
                title="Confirmar y quitar licencia"
                aria-label="Confirmar y quitar licencia"
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 transition-all cursor-pointer active:scale-95"
              >
                Sí, quitar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    {showCancelConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setShowCancelConfirm(null)}>
          <div className="relative rounded-3xl p-8 sm:p-9 max-w-md w-full shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ ...cardStyle, border: 'none', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.65)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg">
                <AlertCircle className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>¿Cancelar descarga?</h3>
            </div>
            <p className="text-white/80 mb-7 text-base leading-relaxed relative z-10">
              Se detendrá la descarga de <span className="text-white font-medium">"{showCancelConfirm.title}"</span>. Se mantendrán las canciones ya descargadas.
            </p>
            <div className="flex justify-end gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => setShowCancelConfirm(null)} 
                title="Continuar con la descarga"
                aria-label="Continuar con la descarga"
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
              >
                Continuar
              </button>
              <button 
                type="button"
                onClick={() => { cancelAlbumDownload(String(showCancelConfirm.id)); setShowCancelConfirm(null); }} 
                title="Confirmar cancelación de descarga"
                aria-label="Confirmar cancelación de descarga"
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
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
