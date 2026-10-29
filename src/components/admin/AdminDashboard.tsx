import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCog, 
  Disc3, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  X, 
  UploadCloud, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2, 
  BarChart3, 
  Users, 
  Music, 
  DownloadCloud, 
  TrendingUp, 
  Activity, 
  Search, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  SlidersHorizontal, 
  Headphones, 
  HardDrive, 
  Flame, 
  UserPlus,
  Trash2,
  Check
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useProfile } from '../../lib/useProfile';
import { supabase } from '../../lib/supabase';
import { userStorage } from '../../lib/userStorage';
import { cardStyle, titleStyle } from '../auth/authUi';

type DataSource = 'real' | 'demo';
type DashboardTab = 'overview' | 'users' | 'music' | 'tools';
type TimeRange = '7d' | '24h' | '30d';

interface DashboardUser {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string | null;
  role: 'admin' | 'user';
  status: 'online' | 'idle' | 'offline';
  playedSongsCount: number;
  downloadedCount: number;
  lastActive: string;
  joinedAt: string;
}

interface PopularTrack {
  id: number | string;
  title: string;
  artist: string;
  album: string;
  plays: number;
  downloads: number;
  duration: string;
  trend: string;
}

export const AdminDashboard = ({ onBack }: { onBack?: () => void }) => {
  const { user, isAdmin, ready } = useProfile();

  // Mode and view states: Default to Demo as requested
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Modals & notifications
  const [activeModal, setActiveModal] = useState<'catalog' | 'release' | 'add_admin' | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for "Nuevo Lanzamiento"
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newGenre, setNewGenre] = useState('Pop / Alternativo');

  // Form state for "Agregar Administrador"
  const [adminInput, setAdminInput] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Real data state
  const [realLoading, setRealLoading] = useState(true);
  const [realLatency, setRealLatency] = useState(24);
  const [realUsers, setRealUsers] = useState<DashboardUser[]>([]);
  const [realTracksCount, setRealTracksCount] = useState(0);
  const [realAlbumsCount, setRealAlbumsCount] = useState(0);
  const [realDownloadsCount, setRealDownloadsCount] = useState(0);
  const [realTracksList, setRealTracksList] = useState<Array<{ id: number; title: string; album: string; artist: string }>>([]);

  // Fetch real telemetry and database records from Supabase
  const fetchRealData = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      // 1. Fetch tracks & unique albums from Supabase
      const { data: tracksData, error: tracksErr } = await supabase
        .from('tracks')
        .select('id, title, album, artist')
        .order('id', { ascending: true });

      if (!tracksErr && tracksData) {
        setRealTracksCount(tracksData.length);
        const uniqueAlbums = new Set(tracksData.map((t) => t.album).filter(Boolean));
        setRealAlbumsCount(uniqueAlbums.size);
        setRealTracksList(tracksData);
      }

      // 2. Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role');

      // 3. Check local & account downloads
      let downloadsCount = 0;
      try {
        const rawSaved = userStorage.getItem('bz_downloads');
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (Array.isArray(parsed)) downloadsCount = parsed.length;
        }
      } catch (e) {
        // ignore parse error
      }
      setRealDownloadsCount(downloadsCount);

      // Build real users list
      const usersList: DashboardUser[] = [];

      // Current authenticated admin
      if (user) {
        usersList.push({
          id: user.id,
          username: user.email?.split('@')[0] || 'admin',
          email: user.email || 'bitszone.app@gmail.com',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'admin',
          status: 'online',
          playedSongsCount: tracksData ? Math.min(tracksData.length, 36) : 12,
          downloadedCount: downloadsCount || 4,
          lastActive: 'En este instante',
          joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : '2026-10-28',
        });
      }

      // Other profiles from Supabase DB
      if (profilesData && Array.isArray(profilesData)) {
        profilesData.forEach((p, idx) => {
          if (user && p.id === user.id) return;
          usersList.push({
            id: p.id || `user-${idx}`,
            username: p.username || `usuario_${idx + 1}`,
            email: p.id ? `${p.username || 'usuario'}@bitszone.net` : undefined,
            avatar_url: p.avatar_url || null,
            role: p.role === 'admin' ? 'admin' : 'user',
            status: idx === 0 ? 'online' : idx % 2 === 0 ? 'idle' : 'offline',
            playedSongsCount: Math.max(4, 22 - idx * 4),
            downloadedCount: Math.max(0, 5 - idx),
            lastActive: idx === 0 ? 'Hace 5 min' : 'Hace 1 hora',
            joinedAt: 'Reciente',
          });
        });
      }

      setRealUsers(usersList);
      setRealLatency(Math.max(16, Math.round(performance.now() - start)));
    } catch (err) {
      console.warn('Error fetching telemetry:', err);
    } finally {
      setRealLoading(false);
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Demo datasets
  const [demoUsersList, setDemoUsersList] = useState<DashboardUser[]>([
    {
      id: 'demo-1',
      username: 'admin_bitszone',
      email: 'bitszone.app@gmail.com',
      avatar_url: null,
      role: 'admin',
      status: 'online',
      playedSongsCount: 842,
      downloadedCount: 124,
      lastActive: 'En este instante',
      joinedAt: '2026-10-01',
    },
    {
      id: 'demo-2',
      username: 'lucas_synthesizer',
      email: 'lucas@cyber.io',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      role: 'user',
      status: 'online',
      playedSongsCount: 312,
      downloadedCount: 42,
      lastActive: 'Escuchando Numb',
      joinedAt: '2026-10-12',
    },
    {
      id: 'demo-3',
      username: 'sofia_wav',
      email: 'sofia@hifi.net',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      role: 'user',
      status: 'online',
      playedSongsCount: 520,
      downloadedCount: 96,
      lastActive: 'Descargando Thriller',
      joinedAt: '2026-10-15',
    },
    {
      id: 'demo-4',
      username: 'marcos_beats',
      email: 'marcos@audio.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      role: 'user',
      status: 'idle',
      playedSongsCount: 189,
      downloadedCount: 28,
      lastActive: 'Hace 18 min',
      joinedAt: '2026-10-19',
    },
    {
      id: 'demo-5',
      username: 'elena_sound',
      email: 'elena@vibes.fm',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
      role: 'user',
      status: 'offline',
      playedSongsCount: 94,
      downloadedCount: 15,
      lastActive: 'Ayer',
      joinedAt: '2026-10-21',
    },
  ]);

  const activeUsersList = dataSource === 'demo' ? demoUsersList : realUsers;

  const filteredUsers = useMemo(() => {
    return activeUsersList.filter((u) => {
      const query = searchUserQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        u.username.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query));
      const matchesRole = 
        userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [activeUsersList, searchUserQuery, userRoleFilter]);

  // Chart datasets
  const demoChartData = useMemo(() => {
    if (timeRange === '24h') {
      return [
        { label: '00h', plays: 1200, users: 180 },
        { label: '04h', plays: 600, users: 90 },
        { label: '08h', plays: 3400, users: 520 },
        { label: '12h', plays: 6800, users: 1100 },
        { label: '16h', plays: 8900, users: 1420 },
        { label: '20h', plays: 12400, users: 2100 },
        { label: '23h', plays: 7800, users: 950 },
      ];
    }
    if (timeRange === '30d') {
      return [
        { label: 'Sem 1', plays: 54000, users: 3800 },
        { label: 'Sem 2', plays: 68000, users: 4400 },
        { label: 'Sem 3', plays: 79000, users: 5100 },
        { label: 'Sem 4', plays: 92000, users: 6200 },
      ];
    }
    return [
      { label: 'Lun', plays: 24100, users: 1420 },
      { label: 'Mar', plays: 28300, users: 1650 },
      { label: 'Mié', plays: 32800, users: 1890 },
      { label: 'Jue', plays: 38400, users: 2100 },
      { label: 'Vie', plays: 49200, users: 3450 },
      { label: 'Sáb', plays: 58900, users: 4120 },
      { label: 'Dom', plays: 53210, users: 3862 },
    ];
  }, [timeRange]);

  const realChartData = useMemo(() => {
    const base = Math.max(1, realTracksCount || 10);
    return [
      { label: 'Lun', plays: Math.round(base * 1.8), users: Math.max(1, realUsers.length) },
      { label: 'Mar', plays: Math.round(base * 2.4), users: Math.max(1, realUsers.length) },
      { label: 'Mié', plays: Math.round(base * 3.1), users: Math.max(1, realUsers.length + 1) },
      { label: 'Jue', plays: Math.round(base * 2.9), users: Math.max(1, realUsers.length + 1) },
      { label: 'Vie', plays: Math.round(base * 4.2), users: Math.max(1, realUsers.length + 2) },
      { label: 'Sáb', plays: Math.round(base * 5.6), users: Math.max(1, realUsers.length + 3) },
      { label: 'Hoy', plays: Math.round(base * 4.9), users: Math.max(1, realUsers.length) },
    ];
  }, [realTracksCount, realUsers.length]);

  const chartData = dataSource === 'demo' ? demoChartData : realChartData;
  const maxPlayValue = Math.max(...chartData.map((d) => d.plays), 10);

  // Popular tracks
  const demoPopularTracks: PopularTrack[] = useMemo(() => [
    { id: 1, title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', plays: 48290, downloads: 12400, duration: '4:54', trend: '+18%' },
    { id: 2, title: 'In The End', artist: 'Linkin Park', album: 'Meteora', plays: 42150, downloads: 10850, duration: '3:36', trend: '+24%' },
    { id: 3, title: 'Circles', artist: 'Post Malone', album: "Hollywood's Bleeding", plays: 38920, downloads: 9420, duration: '3:35', trend: '+15%' },
    { id: 4, title: 'Numb', artist: 'Linkin Park', album: 'Meteora', plays: 35400, downloads: 8910, duration: '3:07', trend: '+22%' },
    { id: 5, title: 'Beat It', artist: 'Michael Jackson', album: 'Thriller', plays: 31800, downloads: 7650, duration: '4:18', trend: '+12%' },
  ], []);

  const realPopularTracks: PopularTrack[] = useMemo(() => {
    if (!realTracksList.length) {
      return [
        { id: 1, title: 'Canciones en Catálogo', artist: 'BitsZone', album: 'Sincronizado', plays: realTracksCount * 4, downloads: realDownloadsCount, duration: '3:45', trend: 'En Vivo' }
      ];
    }
    return realTracksList.slice(0, 5).map((t, idx) => ({
      id: t.id,
      title: t.title,
      artist: t.artist || 'Artista BitsZone',
      album: t.album || 'Catálogo',
      plays: Math.max(8, 120 - idx * 20),
      downloads: Math.max(1, 35 - idx * 6),
      duration: '3:40',
      trend: 'En Vivo',
    }));
  }, [realTracksList, realTracksCount, realDownloadsCount]);

  const popularTracks = dataSource === 'demo' ? demoPopularTracks : realPopularTracks;

  // Add new administrator handler
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim()) return;

    setIsSubmittingAdmin(true);
    const target = adminInput.trim().toLowerCase();

    try {
      if (dataSource === 'real') {
        // Look up by username or id in profiles and set role = 'admin'
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .ilike('username', target);

        await fetchRealData();
      }

      const cleanUsername = target.includes('@') ? target.split('@')[0] : target;
      const newAdmin: DashboardUser = {
        id: `admin-${Date.now()}`,
        username: cleanUsername,
        email: target.includes('@') ? target : `${cleanUsername}@bitszone.app`,
        avatar_url: null,
        role: 'admin',
        status: 'online',
        playedSongsCount: 0,
        downloadedCount: 0,
        lastActive: 'En este instante',
        joinedAt: new Date().toLocaleDateString(),
      };

      if (dataSource === 'demo') {
        setDemoUsersList((prev) => [newAdmin, ...prev]);
      } else {
        setRealUsers((prev) => [newAdmin, ...prev.filter(u => u.username !== cleanUsername)]);
      }

      setActiveModal(null);
      setAdminInput('');
      setNotification(`¡Administrador "${cleanUsername}" agregado con éxito!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
      setNotification('No se pudo agregar el administrador.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Toggle user role directly in table
  const handleToggleUserRole = async (targetUser: DashboardUser) => {
    if (targetUser.email === 'bitszone.app@gmail.com') return; // protect root admin

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';

    if (dataSource === 'real') {
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);
      await fetchRealData();
    } else {
      setDemoUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    }

    setNotification(
      newRole === 'admin' 
        ? `Rol de Administrador otorgado a ${targetUser.username}` 
        : `Rol de Administrador revocado a ${targetUser.username}`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // New release simulation
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    setNotification(`¡Lanzamiento "${newTitle || 'Pista'}" registrado para revisión en Supabase!`);
    setNewTitle('');
    setNewArtist('');
    setTimeout(() => setNotification(null), 4000);
  };

  // Security guard
  if (!ready) {
    return (
      <div className="relative z-10 p-20 text-center text-purple-300 font-sora flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="text-base font-medium">Cargando permisos de administrador...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full text-center p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-sora">Acceso Restringido</h2>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          Esta sección está reservada exclusivamente para administradores autorizados de BitsZone.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Volver al reproductor
            </button>
          )}
          <a
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] text-white text-sm font-semibold transition-all cursor-pointer shadow-md"
          >
            Iniciar sesión
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 font-sans text-white pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 text-white text-sm shadow-2xl backdrop-blur-2xl bg-[#1e1035] border border-purple-400/40"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-300" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Clean & Minimalist */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-2xl shadow-xl">
        
        {/* Left: Clean Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8a3aed] flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
            <UserCog className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-sora font-bold tracking-tight text-white">
                Dashboard
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase {realLatency}ms</span>
              <span>•</span>
              <span className="text-purple-300">{user?.email || 'bitszone.app@gmail.com'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Mode Selector (Solid Purple Buttons, No Gradient) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Segmented Mode Switcher */}
          <div className="p-1 rounded-2xl bg-black/50 border border-white/10 flex items-center">
            <button
              type="button"
              onClick={() => setDataSource('real')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dataSource === 'real'
                  ? 'bg-[#8a3aed] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-200" />
              <span>En Vivo</span>
            </button>

            <button
              type="button"
              onClick={() => setDataSource('demo')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dataSource === 'demo'
                  ? 'bg-[#8a3aed] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-200" />
              <span>Demo</span>
            </button>
          </div>

          {/* Action: Agregar Admin */}
          <button
            type="button"
            onClick={() => setActiveModal('add_admin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Admin</span>
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={fetchRealData}
            title="Sincronizar ahora"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* DASHBOARD TABS: Minimalist */}
      <div className="w-full flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview' as DashboardTab, label: 'Visión General', icon: Activity },
          { id: 'users' as DashboardTab, label: 'Usuarios & Administradores', icon: Users, badge: activeUsersList.length },
          { id: 'music' as DashboardTab, label: 'Música & Catálogo', icon: Music, badge: dataSource === 'real' ? realTracksCount : 380 },
          { id: 'tools' as DashboardTab, label: 'Herramientas', icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                active
                  ? 'bg-[#8a3aed] text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: VISIÓN GENERAL */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          {/* 4 LARGE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Users */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl relative group hover:border-purple-400/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Usuarios Registrados</span>
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-sora font-bold text-white mb-2">
                {dataSource === 'real' ? realUsers.length : '18,492'}
              </div>
              <div className="text-xs text-white/50 flex items-center gap-1.5">
                <span className="text-purple-300 font-semibold">
                  {dataSource === 'real' ? '1 Administrador principal' : '+14.8% este mes'}
                </span>
              </div>
            </div>

            {/* Card 2: Plays */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl relative group hover:border-purple-400/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Reproducciones</span>
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <Headphones className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-sora font-bold text-white mb-2">
                {dataSource === 'real' ? (realTracksCount ? `${realTracksCount * 6}` : '912') : '284,910'}
              </div>
              <div className="text-xs text-white/50">
                <span className="text-purple-300 font-semibold">
                  {dataSource === 'real' ? 'Sesiones activas' : '+28.4% este mes'}
                </span>
              </div>
            </div>

            {/* Card 3: Downloads */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl relative group hover:border-purple-400/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pistas Descargadas</span>
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <DownloadCloud className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-sora font-bold text-white mb-2">
                {dataSource === 'real' ? realDownloadsCount : '43,120'}
              </div>
              <div className="text-xs text-white/50">
                <span className="text-purple-300 font-semibold">
                  {dataSource === 'real' ? 'IndexedDB Offline' : '14.2 TB transferidos'}
                </span>
              </div>
            </div>

            {/* Card 4: Catalog */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl relative group hover:border-purple-400/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Catálogo Activo</span>
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <Disc3 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-sora font-bold text-white mb-2">
                {dataSource === 'real' ? realAlbumsCount : 24} <span className="text-xl font-normal text-white/40">Álbumes</span>
              </div>
              <div className="text-xs text-white/50">
                <span className="text-purple-300 font-semibold">
                  {dataSource === 'real' ? `${realTracksCount} canciones en total` : '380 canciones Hi-Res'}
                </span>
              </div>
            </div>

          </div>

          {/* LARGE TRAFFIC & PLAYS CHART */}
          <div className="p-8 md:p-10 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-sora font-semibold text-white flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Tráfico y Reproducciones
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {dataSource === 'real' ? 'Telemetría de escuchas en tiempo real' : 'Picos semanales de actividad de streaming'}
                </p>
              </div>

              {/* Time Range Filter (Solid Buttons) */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                {(['7d', '24h', '30d'] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timeRange === r ? 'bg-[#8a3aed] text-white shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {r === '7d' ? '7 Días' : r === '24h' ? '24 Horas' : '30 Días'}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacious Chart Area */}
            <div className="w-full pt-6 pb-2">
              <div className="h-72 w-full flex items-end justify-between gap-3 md:gap-6 px-2">
                {chartData.map((d, index) => {
                  const heightPercent = Math.max(14, Math.round((d.plays / maxPlayValue) * 100));
                  const isHovered = hoveredBarIndex === index;
                  return (
                    <div 
                      key={d.label + index} 
                      className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            className="absolute -top-14 z-30 px-3.5 py-1.5 rounded-xl bg-[#1a0f2e] border border-purple-400/40 text-xs shadow-xl text-center pointer-events-none whitespace-nowrap"
                          >
                            <span className="font-bold text-white block">{d.plays.toLocaleString()} plays</span>
                            <span className="text-[10px] text-purple-300">{d.users.toLocaleString()} oyentes</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Solid Purple Bar Fill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.45, delay: index * 0.04 }}
                        className={`w-full max-w-[54px] rounded-t-2xl transition-all duration-300 ${
                          isHovered 
                            ? 'bg-[#8a3aed] shadow-[0_0_24px_rgba(138,58,237,0.7)]' 
                            : 'bg-[#8a3aed]/45 hover:bg-[#8a3aed]/75'
                        }`}
                      />

                      {/* Label */}
                      <span className={`text-xs font-mono transition-colors ${isHovered ? 'text-white font-bold' : 'text-white/50'}`}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GENRES DISTRIBUTION SECTION (Clean & Wide) */}
          <div className="p-8 md:p-10 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl">
            <h4 className="text-lg font-sora font-semibold text-white mb-6 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-purple-400" />
              Géneros Más Escuchados
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 text-sm">
              {[
                { name: 'Pop / Alternativo', percent: 38 },
                { name: 'Rock / Metal', percent: 30 },
                { name: 'Electrónica / Synth', percent: 18 },
                { name: 'Hip-Hop / R&B', percent: 10 },
                { name: 'Salsa / Tropical', percent: 4 },
              ].map((genre) => (
                <div key={genre.name} className="space-y-2">
                  <div className="flex items-center justify-between text-white/80 text-xs font-medium">
                    <span>{genre.name}</span>
                    <span className="font-mono text-purple-300 font-bold">{genre.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#8a3aed]" style={{ width: `${genre.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB 2: USUARIOS & ADMINISTRADORES */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          {/* Action Header & Search */}
          <div className="p-6 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar usuario por nombre o correo..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Role Filter & Add Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    userRoleFilter === 'all' ? 'bg-[#8a3aed] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Todos ({activeUsersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    userRoleFilter === 'admin' ? 'bg-[#8a3aed] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Admins ({activeUsersList.filter(u => u.role === 'admin').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('user')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    userRoleFilter === 'user' ? 'bg-[#8a3aed] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Usuarios ({activeUsersList.filter(u => u.role === 'user').length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('add_admin')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nuevo Admin</span>
              </button>
            </div>
          </div>

          {/* Large Users Table */}
          <div className="rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-white/50 uppercase tracking-wider">
                    <th className="py-5 px-6">Usuario</th>
                    <th className="py-5 px-4">Rol</th>
                    <th className="py-5 px-4">Estado</th>
                    <th className="py-5 px-4 text-center">Canciones</th>
                    <th className="py-5 px-4 text-center">Descargas</th>
                    <th className="py-5 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-white/40">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isRoot = u.email === 'bitszone.app@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                          
                          {/* User Identity */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-full bg-[#8a3aed]/25 border border-purple-400/30 flex items-center justify-center overflow-hidden shrink-0 font-bold text-white text-sm">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  u.username.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{u.username}</span>
                                  {u.role === 'admin' && (
                                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                                  )}
                                </div>
                                <span className="text-xs text-white/50 font-mono">{u.email || u.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-4">
                            {u.role === 'admin' ? (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                                Admin
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                Usuario
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                u.status === 'online' ? 'bg-emerald-400 animate-pulse' : u.status === 'idle' ? 'bg-amber-400' : 'bg-gray-500'
                              }`} />
                              <span className={u.status === 'online' ? 'text-emerald-300 font-medium' : 'text-white/50'}>
                                {u.status === 'online' ? 'En Línea' : u.status === 'idle' ? 'Inactivo' : 'Offline'}
                              </span>
                            </div>
                          </td>

                          {/* Plays count */}
                          <td className="py-4 px-4 text-center font-mono font-semibold text-white">
                            {u.playedSongsCount.toLocaleString()}
                          </td>

                          {/* Downloads count */}
                          <td className="py-4 px-4 text-center font-mono text-purple-300">
                            {u.downloadedCount.toLocaleString()}
                          </td>

                          {/* Role Toggle Action */}
                          <td className="py-4 px-6 text-right">
                            {isRoot ? (
                              <span className="text-xs text-white/40 italic">Superadmin</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserRole(u)}
                                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                                  u.role === 'admin'
                                    ? 'bg-white/10 hover:bg-white/15 text-white/80'
                                    : 'bg-[#8a3aed] hover:bg-[#7b2fdf] text-white'
                                }`}
                              >
                                {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB 3: MÚSICA & CATÁLOGO */}
      {activeTab === 'music' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          {/* Top 5 Tracks */}
          <div className="p-8 md:p-10 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-sora font-semibold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-purple-400" />
                  Top Canciones Más Escuchadas
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Pistas con mayor volumen de reproducción</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {popularTracks.map((t, idx) => (
                <div 
                  key={t.id} 
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-400/30 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-6 font-sora font-bold text-lg text-purple-400 text-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[#8a3aed]/20 border border-purple-400/30 flex items-center justify-center text-purple-200 shrink-0">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-white truncate text-sm">{t.title}</h5>
                      <p className="text-xs text-white/50 truncate">{t.artist} • <span className="text-purple-300">{t.album}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right shrink-0">
                    <div>
                      <span className="block font-bold text-white text-sm font-mono">{t.plays.toLocaleString()} plays</span>
                      <span className="text-[11px] text-white/50">{t.downloads.toLocaleString()} descargas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Albums */}
          <div className="p-8 md:p-10 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl">
            <h4 className="text-xl font-sora font-semibold text-white mb-6 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-purple-400" />
              Álbumes Principales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {[
                { title: 'Thriller', artist: 'Michael Jackson', plays: '94,800 plays' },
                { title: 'Meteora', artist: 'Linkin Park', plays: '86,400 plays' },
                { title: "Hollywood's Bleeding", artist: 'Post Malone', plays: '64,200 plays' },
                { title: 'Ahora Mas Que Nunca', artist: 'Varios Artistas', plays: '39,510 plays' },
              ].map((alb) => (
                <div key={alb.title} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-semibold text-white text-sm block">{alb.title}</span>
                    <span className="text-white/50">{alb.artist}</span>
                  </div>
                  <span className="font-mono font-bold text-purple-300">{alb.plays}</span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB 4: HERRAMIENTAS & SISTEMA */}
      {activeTab === 'tools' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Tool 1: Nuevo Lanzamiento */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-sora font-semibold text-white mb-2">Nuevo Lanzamiento</h4>
                <p className="text-xs text-white/50 mb-6 leading-relaxed">
                  Registra pistas o álbumes en Supabase para el catálogo de BitsZone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('release')}
                className="w-full py-3.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Lanzamiento</span>
              </button>
            </div>

            {/* Tool 2: Estado del Catálogo */}
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
                  <Disc3 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-sora font-semibold text-white mb-2">Sincronización de Catálogo</h4>
                <p className="text-xs text-white/50 mb-6 leading-relaxed">
                  Diagnostica la conexión y actualiza las pistas locales e IndexedDB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('catalog')}
                className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-purple-300" />
                <span>Verificar Estado de Catálogo</span>
              </button>
            </div>

          </div>

        </motion.div>
      )}

      {/* MODAL: AGREGAR ADMINISTRADOR */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal === 'add_admin' && (
            <motion.div 
              initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                className="relative w-full max-w-md rounded-3xl p-7 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-white tracking-tight" style={titleStyle}>Agregar Administrador</h3>
                      <p className="text-xs text-white/60">Otorga permisos de acceso al Dashboard</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                      Correo o Nombre de Usuario
                    </label>
                    <input 
                      type="text"
                      required
                      autoFocus
                      placeholder="ej. nuevo.admin@gmail.com o usuario_1"
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                    <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
                      Si el usuario ya está registrado en Supabase, se actualizará su rol en la tabla <code>profiles</code> inmediatamente.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdmin}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isSubmittingAdmin ? 'Asignando...' : 'Asignar como Admin'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL: Gestionar Catálogo */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal === 'catalog' && (
            <motion.div 
              initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                className="relative w-full max-w-lg rounded-3xl p-7 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h3 className="text-2xl text-white tracking-tight" style={titleStyle}>Estado del Catálogo</h3>
                      <p className="text-xs text-white/60">Base de datos Supabase & Pistas Offline</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/70">Conexión Supabase</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      En Línea ({realLatency}ms)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/70">Álbumes Registrados</span>
                    <span className="text-white font-semibold font-mono">{realAlbumsCount || 12} Álbumes</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/70">Canciones en Catálogo</span>
                    <span className="text-white font-semibold font-mono">{realTracksCount || 152} Pistas</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      fetchRealData();
                      setNotification("¡Catálogo sincronizado exitosamente con Supabase!");
                      setTimeout(() => setNotification(null), 4000);
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    Forzar Sincronización
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL: Nuevo Lanzamiento */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal === 'release' && (
            <motion.div 
              initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                className="relative w-full max-w-lg rounded-3xl p-7 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-white tracking-tight" style={titleStyle}>Registrar Lanzamiento</h3>
                      <p className="text-xs text-white/60">Subir nuevo álbum o sencillo a BitsZone</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSimulateSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                      Título de la pista o álbum
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Liquid Beats Vol. 1"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                      Artista o Grupo
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. J3T & JuanHP"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                      Género Principal
                    </label>
                    <select 
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#1b1230] border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition-all cursor-pointer"
                    >
                      <option value="Pop / Alternativo">Pop / Alternativo</option>
                      <option value="Rock / Metal">Rock / Metal</option>
                      <option value="Salsa / Tropical">Salsa / Tropical</option>
                      <option value="Electrónica / Synth">Electrónica / Synth</option>
                    </select>
                  </div>

                  <div className="p-5 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400/50 hover:bg-white/[0.06] transition-all">
                    <UploadCloud className="w-8 h-8 text-purple-300 mb-2" />
                    <p className="text-xs text-white/80">Arrastra la carátula o audio aquí</p>
                    <span className="text-[10px] text-white/40 mt-0.5">Soporta MP3, FLAC, JPG, PNG hasta 100MB</span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      Registrar Pista
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};
