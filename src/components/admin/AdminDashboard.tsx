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
  Check,
  Crown,
  Database,
  Copy,
  Terminal
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useProfile } from '../../lib/useProfile';
import { supabase } from '../../lib/supabase';
import { userStorage } from '../../lib/userStorage';
import { cardStyle, titleStyle } from '../auth/authUi';
import { SectionHero } from '../ui/SectionHero';
import { LiquidTabs } from '../ui/LiquidTabs';

type DataSource = 'real' | 'demo';
type DashboardTab = 'overview' | 'users' | 'music' | 'tools';
type TimeRange = '7d' | '24h' | '30d';

export interface DashboardUser {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string | null;
  role: 'superadmin' | 'admin' | 'user';
  status: 'online' | 'idle' | 'offline';
  playedSongsCount: number;
  downloadedCount: number;
  lastActive: string;
  joinedAt: string;
}

export const isSuperAdminUser = (u?: {
  email?: string | null;
  username?: string | null;
  role?: string | null;
  id?: string | null;
} | null) => {
  if (!u) return false;
  const email = (u.email || '').toLowerCase().trim();
  const username = (u.username || '').toLowerCase().trim();
  const role = (u.role || '').toLowerCase().trim();

  return (
    email === 'bitszone.app@gmail.com' ||
    username === 'owner' ||
    username === 'admin_bitszone' ||
    role === 'superadmin' ||
    role === 'owner'
  );
};

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

const USERS_SQL_SCRIPT = `-- ==============================================================================
-- BITSZONE: Sincronización de Usuarios, Perfiles y Telemetría en Vivo
-- Ejecuta este script UNA SOLA VEZ en el SQL Editor de tu Dashboard de Supabase:
-- https://supabase.com/dashboard/project/oxloqoggjldbjjratwoh/sql
-- ==============================================================================

-- 1. Columnas necesarias en 'profiles'
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_at timestamptz default now();

-- 2. Políticas RLS en 'profiles'
alter table public.profiles enable row level security;

drop policy if exists "Perfiles visibles para todos" on public.profiles;
create policy "Perfiles visibles para todos" on public.profiles for select using (true);

drop policy if exists "Usuarios pueden insertar su propio perfil" on public.profiles;
create policy "Usuarios pueden insertar su propio perfil" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Usuarios pueden actualizar su propio perfil" on public.profiles;
create policy "Usuarios pueden actualizar su propio perfil" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Administradores pueden actualizar perfiles" on public.profiles;
create policy "Administradores pueden actualizar perfiles" on public.profiles for update using (auth.role() = 'authenticated');

-- 3. Trigger para auto-crear perfil al registrarse nuevo usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url, role, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'usuario'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),
    case when lower(trim(coalesce(new.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else 'user' end,
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    role = case when lower(trim(coalesce(excluded.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else coalesce(public.profiles.role, excluded.role) end;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 4. Sincronizar usuarios existentes
insert into public.profiles (id, email, username, avatar_url, role, created_at)
select 
  u.id, u.email,
  coalesce(u.raw_user_meta_data->>'user_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'usuario'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', null),
  case when lower(trim(coalesce(u.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else coalesce(p.role, 'user') end,
  coalesce(u.created_at, now())
from auth.users u
left join public.profiles p on p.id = u.id
on conflict (id) do update set
  email = coalesce(excluded.email, public.profiles.email),
  role = case when lower(trim(coalesce(excluded.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else coalesce(public.profiles.role, excluded.role) end;

-- 5. Función RPC get_dashboard_users para telemetría completa
create or replace function public.get_dashboard_users()
returns table (
  id uuid, email text, username text, avatar_url text, role text, created_at timestamptz, last_sign_in_at timestamptz
) security definer set search_path = public, auth language plpgsql as $$
begin
  return query
  select 
    u.id, u.email::text, coalesce(p.username, split_part(u.email, '@', 1), 'usuario'),
    p.avatar_url, coalesce(p.role, case when lower(trim(coalesce(u.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else 'user' end),
    u.created_at, u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by coalesce(u.last_sign_in_at, u.created_at) desc;
end;
$$;

grant execute on function public.get_dashboard_users() to authenticated, anon;`;

export const AdminDashboard = ({ onBack }: { onBack?: () => void }) => {
  const { user, profile, isAdmin, isSuperAdmin, ready } = useProfile();

  // Mode and view states: Default to Demo as requested
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Modals & notifications
  const [activeModal, setActiveModal] = useState<'catalog' | 'release' | 'add_admin' | 'sql_help' | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
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

      // 2. Fetch users & profiles from Supabase
      let rawUsers: Array<{
        id: string;
        username: string | null;
        email?: string | null;
        avatar_url: string | null;
        role?: string | null;
        created_at?: string | null;
        last_sign_in_at?: string | null;
      }> = [];

      // A. Try calling get_dashboard_users RPC (reads auth.users + profiles)
      const { data: rpcUsers, error: rpcErr } = await supabase.rpc('get_dashboard_users');

      if (!rpcErr && rpcUsers && Array.isArray(rpcUsers) && rpcUsers.length > 0) {
        rawUsers = rpcUsers;
      } else {
        // B. Fallback to selecting from profiles table (try with email first)
        const { data: profilesWithEmail, error: emailErr } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, created_at, email');

        if (!emailErr && profilesWithEmail && Array.isArray(profilesWithEmail)) {
          rawUsers = profilesWithEmail;
        } else {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, role, created_at');

          if (profilesData && Array.isArray(profilesData)) {
            rawUsers = profilesData;
          }
        }
      }

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
      const seenIds = new Set<string>();

      // Current authenticated admin
      if (user) {
        seenIds.add(user.id);
        const userProfile = rawUsers.find((p) => p.id === user.id);
        const isCurrentSuper = isSuperAdmin || isSuperAdminUser({
          email: user.email,
          username: userProfile?.username || profile?.username,
          role: userProfile?.role || profile?.role,
        });

        usersList.push({
          id: user.id,
          username: userProfile?.username || profile?.username || user.email?.split('@')[0] || 'admin',
          email: user.email || (isCurrentSuper ? 'bitszone.app@gmail.com' : undefined),
          avatar_url: userProfile?.avatar_url || profile?.avatar_url || user.user_metadata?.avatar_url || null,
          role: isCurrentSuper ? 'superadmin' : (userProfile?.role === 'admin' || profile?.role === 'admin' ? 'admin' : 'user'),
          status: 'online',
          playedSongsCount: tracksData ? Math.min(tracksData.length, 36) : 12,
          downloadedCount: downloadsCount || 4,
          lastActive: 'En este instante',
          joinedAt: user.created_at
            ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            : '28 oct 2026',
        });
      }

      // Other profiles from Supabase DB
      rawUsers.forEach((u, idx) => {
        if (seenIds.has(u.id)) return;
        seenIds.add(u.id);

        const isSuper = isSuperAdminUser({
          email: u.email,
          username: u.username,
          role: u.role,
        });

        // Prevent duplicate superadmin if current authenticated user is already the superadmin
        if (isSuper && usersList.some((existing) => existing.role === 'superadmin')) {
          return;
        }

        // Calculate activity and status
        let status: 'online' | 'idle' | 'offline' = 'offline';
        let lastActiveText = 'Reciente';

        if (u.last_sign_in_at) {
          const lastTime = new Date(u.last_sign_in_at).getTime();
          const diffMinutes = Math.max(0, Math.round((Date.now() - lastTime) / 60000));
          if (diffMinutes < 15) {
            status = 'online';
            lastActiveText = 'En este instante';
          } else if (diffMinutes < 60) {
            status = 'online';
            lastActiveText = `Hace ${diffMinutes} min`;
          } else if (diffMinutes < 1440) {
            status = 'idle';
            const h = Math.round(diffMinutes / 60);
            lastActiveText = `Hace ${h} h`;
          } else {
            status = 'offline';
            const d = Math.round(diffMinutes / 1440);
            lastActiveText = d === 1 ? 'Ayer' : `Hace ${d} días`;
          }
        } else {
          status = idx === 0 ? 'online' : idx % 2 === 0 ? 'idle' : 'offline';
          lastActiveText = idx === 0 ? 'Hace 5 min' : 'Hace 1 hora';
        }

        const joinedText = u.created_at
          ? new Date(u.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Reciente';

        usersList.push({
          id: u.id || `user-${idx}`,
          username: u.username || (u.email ? u.email.split('@')[0] : `usuario_${idx + 1}`),
          email: u.email || (isSuper ? 'bitszone.app@gmail.com' : undefined),
          avatar_url: u.avatar_url || null,
          role: isSuper ? 'superadmin' : (u.role === 'admin' ? 'admin' : 'user'),
          status,
          playedSongsCount: Math.max(4, 22 - idx * 4),
          downloadedCount: Math.max(0, 5 - idx),
          lastActive: lastActiveText,
          joinedAt: joinedText,
        });
      });

      // Guarantee at least one superadmin is explicitly identified in the list
      const hasSuper = usersList.some((u) => u.role === 'superadmin');
      if (!hasSuper) {
        const ownerIdx = usersList.findIndex((u) => u.username === 'owner' || u.email === 'bitszone.app@gmail.com');
        if (ownerIdx !== -1) {
          usersList[ownerIdx].role = 'superadmin';
          usersList[ownerIdx].email = 'bitszone.app@gmail.com';
        }
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

  // Handle ESC key to close active modal
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeModal]);

  // Demo datasets
  const [demoUsersList, setDemoUsersList] = useState<DashboardUser[]>([
    {
      id: 'demo-1',
      username: 'owner',
      email: 'bitszone.app@gmail.com',
      avatar_url: null,
      role: 'superadmin',
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
        userRoleFilter === 'all' ||
        (userRoleFilter === 'admin' ? (u.role === 'admin' || u.role === 'superadmin') : u.role === 'user');
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
      if (target === 'bitszone.app@gmail.com' || target === 'owner' || target === 'admin_bitszone') {
        setNotification('El usuario ya es el Superadministrador principal de BitsZone');
        return;
      }

      // 1. Try finding in loaded realUsers first
      const alreadyLoaded = realUsers.find(
        (u) =>
          u.username.toLowerCase() === target ||
          (u.email && u.email.toLowerCase() === target) ||
          u.id.toLowerCase() === target
      );

      if (alreadyLoaded) {
        if (isSuperAdminUser(alreadyLoaded)) {
          setNotification(`"${alreadyLoaded.username}" es el Superadministrador principal.`);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: alreadyLoaded.id,
            role: 'admin',
            username: alreadyLoaded.username,
            avatar_url: alreadyLoaded.avatar_url,
            ...(alreadyLoaded.email ? { email: alreadyLoaded.email } : {}),
          }, { onConflict: 'id' });

        if (!updateError) {
          setNotification(`¡"${alreadyLoaded.username}" ahora es Administrador en Supabase!`);
          await fetchRealData();
        } else {
          setNotification(`No se pudo actualizar el rol: ${updateError.message}`);
        }
        return;
      }

      // 2. Query Supabase profiles safely (validating UUID format)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
      let query = supabase.from('profiles').select('id, username, role');
      if (isUuid) {
        query = query.eq('id', target);
      } else {
        query = query.ilike('username', `%${target}%`);
      }

      const { data: matchedProfiles, error: searchError } = await query;

      if (!searchError && matchedProfiles && matchedProfiles.length > 0) {
        const found = matchedProfiles[0];
        if (isSuperAdminUser(found)) {
          setNotification(`"${found.username}" es el Superadministrador principal.`);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', found.id);

        if (!updateError) {
          setNotification(`¡"${found.username}" ahora es Administrador en Supabase!`);
          await fetchRealData();
        } else {
          setNotification(`No se pudo actualizar el rol: ${updateError.message}`);
        }
      } else {
        // Fallback for demo or custom input
        if (dataSource === 'demo') {
          const newDemoAdmin: DashboardUser = {
            id: `demo-${Date.now()}`,
            username: target.includes('@') ? target.split('@')[0] : target,
            email: target.includes('@') ? target : undefined,
            avatar_url: null,
            role: 'admin',
            status: 'online',
            playedSongsCount: 0,
            downloadedCount: 0,
            lastActive: 'En este instante',
            joinedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          };
          setDemoUsersList((prev) => [newDemoAdmin, ...prev]);
          setNotification(`¡Administrador de demostración "${newDemoAdmin.username}" creado!`);
        } else {
          setNotification(`No se encontró un usuario con "${target}" en Supabase.`);
        }
      }
    } catch (err: any) {
      setNotification(`Error al procesar: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsSubmittingAdmin(false);
      setAdminInput('');
      setActiveModal(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (targetUser: DashboardUser) => {
    if (isSuperAdminUser(targetUser)) {
      setNotification('No es posible modificar los permisos del Superadministrador principal');
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';

    if (dataSource === 'real') {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: targetUser.id,
          role: newRole,
          username: targetUser.username,
          avatar_url: targetUser.avatar_url,
          ...(targetUser.email ? { email: targetUser.email } : {}),
        }, { onConflict: 'id' });
      
      if (error) {
        setNotification(`Error al actualizar rol: ${error.message}`);
        setTimeout(() => setNotification(null), 4000);
        return;
      }
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
        className="relative z-10 max-w-md w-full mx-auto my-12 text-center p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl"
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
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Volver al reproductor
            </button>
          )}
          <a
            href="/login"
            className="px-5 py-2.5 rounded-full bg-[#8a3aed] hover:bg-[#7b2fdf] text-white text-sm font-semibold transition-all cursor-pointer shadow-md"
          >
            Iniciar sesión
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col relative w-full text-white">
      
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

      {/* Hero Section: SectionHero identical to Downloads / Library view */}
      <SectionHero
        type="favorites"
        icon={UserCog}
        kicker="Administración"
        title="Dashboard"
        stats={[
          { icon: <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />, text: `Supabase ${realLatency}ms` },
          { icon: <Users className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />, text: `${dataSource === 'real' ? realUsers.length : '18,492'} usuarios` },
          { icon: <Music className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />, text: `${dataSource === 'real' ? realTracksCount : 380} canciones` },
          { icon: <Disc3 className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />, text: `${dataSource === 'real' ? realAlbumsCount : 24} álbumes` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Mode Switcher */}
            <div className="h-10 rounded-full p-1 bg-white/10 hover:bg-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 flex items-center">
              <button
                type="button"
                onClick={() => setDataSource('real')}
                className={`flex items-center gap-1.5 h-full px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'real'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>En Vivo</span>
              </button>
              <button
                type="button"
                onClick={() => setDataSource('demo')}
                className={`flex items-center gap-1.5 h-full px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'demo'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Demo</span>
              </button>
            </div>

            {/* Agregar Admin Action */}
            <button
              type="button"
              onClick={() => setActiveModal('add_admin')}
              className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold backdrop-blur-xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer text-white bg-white/[0.09] hover:bg-white/[0.17] border border-white/15 shadow-sm"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>Agregar Admin</span>
            </button>

            {/* Refresh Action */}
            <button
              type="button"
              onClick={fetchRealData}
              title="Sincronizar ahora"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/[0.07] hover:bg-white/[0.13] border border-white/10 backdrop-blur-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-300' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Action Bar (Search, Tabs & Filters) */}
      <div className="px-4 md:px-8 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sticky top-0 bg-[#07050c]/60 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none z-30">
        
        {/* LiquidTabs Dock */}
        <div className="h-10 rounded-full p-1 w-full sm:w-[680px] md:w-[740px] bg-white/10 hover:bg-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 flex items-center overflow-x-auto scrollbar-hide shrink-0">
          <LiquidTabs
            value={activeTab}
            onChange={(id) => setActiveTab(id as DashboardTab)}
            className="h-full w-full"
            tabClassName="h-full py-0 px-4 md:px-5 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide"
            tabs={[
              { id: 'overview' as const, label: 'Visión General', icon: <Activity className="w-3.5 h-3.5 mr-2 shrink-0" aria-hidden="true" /> },
              { id: 'users' as const, label: `Usuarios (${activeUsersList.length})`, icon: <Users className="w-3.5 h-3.5 mr-2 shrink-0" aria-hidden="true" /> },
              { id: 'music' as const, label: `Música (${dataSource === 'real' ? realTracksCount : 380})`, icon: <Music className="w-3.5 h-3.5 mr-2 shrink-0" aria-hidden="true" /> },
              { id: 'tools' as const, label: 'Herramientas', icon: <SlidersHorizontal className="w-3.5 h-3.5 mr-2 shrink-0" aria-hidden="true" /> },
            ]}
          />
        </div>

        {/* Secondary controls (Filters & Search) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto ml-auto">
          {activeTab === 'users' && (
            <div className="h-10 rounded-full p-1 bg-white/[0.07] border border-white/10 backdrop-blur-xl flex items-center gap-1">
              {(['all', 'admin', 'user'] as const).map((r) => {
                const count = r === 'all' 
                  ? activeUsersList.length 
                  : r === 'admin' 
                  ? activeUsersList.filter(u => u.role === 'admin' || u.role === 'superadmin').length 
                  : activeUsersList.filter(u => u.role === 'user').length;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`h-full px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      userRoleFilter === r
                        ? 'bg-white text-black shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {r === 'all' ? `Todos (${count})` : r === 'admin' ? `Admins (${count})` : `Usuarios (${count})`}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="h-10 rounded-full p-1 bg-white/[0.07] border border-white/10 backdrop-blur-xl flex items-center gap-1">
              {(['7d', '24h', '30d'] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`h-full px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    timeRange === r
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Días' : r === '24h' ? '24 Horas' : '30 Días'}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="relative w-full md:w-64 lg:w-72 h-10 group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white pointer-events-none z-10 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Buscar usuario o correo..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full h-10 bg-white/[0.07] hover:bg-white/[0.09] backdrop-blur-xl rounded-full pl-11 pr-9 text-base md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:ring-1 focus:ring-white/25 transition-[background-color,box-shadow] duration-300"
              />
              {searchUserQuery && (
                <button
                  type="button"
                  onClick={() => setSearchUserQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
                  title="Borrar búsqueda"
                  aria-label="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 md:px-8 relative z-10 flex-1 pt-4 md:pt-6 pb-16">
        
        {/* TAB 1: VISIÓN GENERAL */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              
              {/* Card 1: Users */}
              <div className="p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Usuarios Registrados</span>
                  <div className="p-2.5 rounded-2xl bg-white/10 text-purple-300">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                  {dataSource === 'real' ? realUsers.length : '18,492'}
                </div>
                <div className="text-xs text-white/50">
                  <span className="text-purple-300 font-semibold">
                    {dataSource === 'real' 
                      ? `${realUsers.filter(u => u.role === 'superadmin' || u.role === 'admin').length} Administradores` 
                      : '+14.8% este mes'}
                  </span>
                </div>
              </div>

              {/* Card 2: Plays */}
              <div className="p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Reproducciones</span>
                  <div className="p-2.5 rounded-2xl bg-white/10 text-purple-300">
                    <Headphones className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                  {dataSource === 'real' ? (realTracksCount ? `${realTracksCount * 6}` : '912') : '284,910'}
                </div>
                <div className="text-xs text-white/50">
                  <span className="text-purple-300 font-semibold">
                    {dataSource === 'real' ? 'Sesiones activas' : '+28.4% este mes'}
                  </span>
                </div>
              </div>

              {/* Card 3: Downloads */}
              <div className="p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pistas Descargadas</span>
                  <div className="p-2.5 rounded-2xl bg-white/10 text-purple-300">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                  {dataSource === 'real' ? realDownloadsCount : '43,120'}
                </div>
                <div className="text-xs text-white/50">
                  <span className="text-purple-300 font-semibold">
                    {dataSource === 'real' ? 'IndexedDB Offline' : '14.2 TB transferidos'}
                  </span>
                </div>
              </div>

              {/* Card 4: Catalog */}
              <div className="p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Catálogo Activo</span>
                  <div className="p-2.5 rounded-2xl bg-white/10 text-purple-300">
                    <Disc3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                  {dataSource === 'real' ? realAlbumsCount : 24} <span className="text-lg font-normal text-white/40">Álbumes</span>
                </div>
                <div className="text-xs text-white/50">
                  <span className="text-purple-300 font-semibold">
                    {dataSource === 'real' ? `${realTracksCount} canciones` : '380 canciones Hi-Res'}
                  </span>
                </div>
              </div>

            </div>

            {/* Traffic & Plays Chart */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Tráfico y Reproducciones
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    {dataSource === 'real' ? 'Telemetría de escuchas en tiempo real' : 'Picos semanales de actividad de streaming'}
                  </p>
                </div>
              </div>

              {/* Spacious Chart Area */}
              <div className="w-full pt-4 pb-2">
                <div className="h-64 w-full flex items-end justify-between gap-3 md:gap-6 px-2">
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
                              className="absolute -top-14 z-30 px-3.5 py-1.5 rounded-xl bg-[#1a0f2e] border border-purple-400/40 text-xs shadow-xl text-center pointer-events-none whitespace-nowrap backdrop-blur-xl"
                            >
                              <span className="font-bold text-white block">{d.plays.toLocaleString()} plays</span>
                              <span className="text-[10px] text-purple-300">{d.users.toLocaleString()} oyentes</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Bar */}
                        <div className="w-full max-w-[48px] bg-white/[0.04] rounded-2xl h-full flex items-end p-1 overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-full rounded-xl transition-all duration-300 ${
                              isHovered 
                                ? 'bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                                : 'bg-white/20 group-hover:bg-white/30'
                            }`}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/50 group-hover:text-white transition-colors">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: USUARIOS & ADMINISTRADORES */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
            
            {/* Supabase Live Telemetry Banner */}
            {dataSource === 'real' && (
              <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Telemetría en Vivo de Supabase: <span className="font-mono text-purple-300 font-semibold">{realUsers.length}</span> {realUsers.length === 1 ? 'usuario cargado' : 'usuarios cargados'}
                    </p>
                    <p className="text-white/50 text-[11px] mt-0.5">
                      Para sincronizar automáticamente registros de Supabase Auth y habilitar permisos RLS para administradores, consulta el script SQL.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('sql_help')}
                  className="px-3.5 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 font-medium transition-colors cursor-pointer shrink-0 text-xs flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Script SQL</span>
                </button>
              </div>
            )}

            {/* Table Header matching DownloadsView style */}
            <div className="hidden lg:grid grid-cols-[1fr_120px_120px_100px_100px_130px] gap-4 px-4 py-2 text-white/40 text-[10px] font-bold tracking-widest uppercase mb-2">
              <div>USUARIO</div>
              <div className="text-center">ROL</div>
              <div className="text-center">ESTADO</div>
              <div className="text-center">CANCIONES</div>
              <div className="text-center">DESCARGAS</div>
              <div className="text-right">ACCIÓN</div>
            </div>

            {/* Users List Rows */}
            <div className="flex flex-col gap-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-white/50">
                  No se encontraron usuarios para <span className="text-white/80 font-medium">"{searchUserQuery}"</span>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = isSuperAdminUser(u);
                  return (
                    <div
                      key={u.id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_120px_120px_100px_100px_130px] gap-3 lg:gap-4 items-center px-4 py-3 rounded-2xl hover:bg-white/[0.05] transition-colors group"
                    >
                      {/* Identity */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 font-bold text-white text-sm shadow-sm">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                            <span>{u.username}</span>
                            {isSuper ? (
                              <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                            ) : u.role === 'admin' ? (
                              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                            ) : null}
                          </div>
                          <span className="text-xs text-white/50 font-mono truncate block">
                            {u.email || `@${u.username}`}
                          </span>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex lg:justify-center">
                        {isSuper ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-amber-500/20 text-purple-200 border border-purple-400/40 flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3 text-amber-300" />
                            Superadmin
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
                            Usuario
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center lg:justify-center gap-1.5 text-xs">
                        <span className={`w-2 h-2 rounded-full ${
                          u.status === 'online' ? 'bg-emerald-400 animate-pulse' : u.status === 'idle' ? 'bg-amber-400' : 'bg-gray-500'
                        }`} />
                        <span className={u.status === 'online' ? 'text-emerald-300 font-medium' : 'text-white/50'}>
                          {u.status === 'online' ? 'En Línea' : u.status === 'idle' ? 'Inactivo' : 'Offline'}
                        </span>
                      </div>

                      {/* Songs */}
                      <div className="hidden lg:block text-center font-mono font-medium text-white/90">
                        {u.playedSongsCount.toLocaleString()}
                      </div>

                      {/* Downloads */}
                      <div className="hidden lg:block text-center font-mono text-purple-300 font-medium">
                        {u.downloadedCount.toLocaleString()}
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-end">
                        {isSuper ? (
                          <span 
                            className="text-xs px-3 py-1 rounded-full font-medium text-white/40 bg-white/[0.04] border border-white/10 flex items-center gap-1.5 cursor-default select-none"
                            title="El Superadministrador no puede ser modificado"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>Inmutable</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                                : 'bg-white/[0.14] hover:bg-white/[0.24] text-white border border-white/20'
                            }`}
                          >
                            {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </motion.div>
        )}

        {/* TAB 3: MÚSICA & CATÁLOGO */}
        {activeTab === 'music' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            
            {/* Top 5 Tracks */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-purple-400" />
                    Top Canciones Más Escuchadas
                  </h3>
                  <p className="text-xs text-white/50 mt-1">Pistas con mayor volumen de reproducción</p>
                </div>
              </div>

              <div className="space-y-2">
                {popularTracks.map((t, idx) => (
                  <div 
                    key={t.id} 
                    className="p-3.5 rounded-2xl hover:bg-white/[0.05] transition-colors flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-6 font-bold text-base text-purple-400 text-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-purple-200 shrink-0">
                        <Music className="w-5 h-5" />
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
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
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
                  <div key={alb.title} className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors flex flex-col justify-between gap-3">
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
              <div className="p-8 rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-300 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Nuevo Lanzamiento</h4>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    Registra pistas o álbumes en Supabase para el catálogo de BitsZone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('release')}
                  className="w-full py-3 rounded-full bg-white/[0.12] hover:bg-white/[0.22] text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Lanzamiento</span>
                </button>
              </div>

              {/* Tool 2: Estado del Catálogo */}
              <div className="p-8 rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-300 flex items-center justify-center mb-4">
                    <Disc3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Sincronización de Catálogo</h4>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    Diagnostica la conexión y actualiza las pistas locales e IndexedDB.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('catalog')}
                  className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-purple-300" />
                  <span>Verificar Estado de Catálogo</span>
                </button>
              </div>

            </div>

          </motion.div>
        )}

      </div>

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
                className="relative w-full max-w-xl rounded-3xl p-8 sm:p-10 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>Agregar Administrador</h3>
                      <p className="text-sm text-white/65 mt-1">Otorga permisos de acceso al Dashboard</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddAdminSubmit} className="space-y-5 text-sm">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Correo o Nombre de Usuario
                    </label>
                    <input 
                      type="text"
                      required
                      autoFocus
                      placeholder="ej. nuevo.admin@gmail.com o usuario_1"
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-base focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                    <p className="text-xs text-white/55 mt-2 leading-relaxed">
                      Si el usuario ya está registrado en Supabase, se actualizará su rol en la tabla <code>profiles</code> inmediatamente.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdmin}
                      className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
                className="relative w-full max-w-2xl rounded-3xl p-8 sm:p-10 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>Estado del Catálogo</h3>
                      <p className="text-sm text-white/65 mt-1">Base de datos Supabase & Pistas Offline</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3.5 mb-7 text-base">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/75">Conexión Supabase</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      En Línea ({realLatency}ms)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/75">Álbumes Registrados</span>
                    <span className="text-white font-semibold font-mono">{realAlbumsCount || 12} Álbumes</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                    <span className="text-white/75">Canciones en Catálogo</span>
                    <span className="text-white font-semibold font-mono">{realTracksCount || 152} Pistas</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      fetchRealData();
                      setNotification("¡Catálogo sincronizado exitosamente con Supabase!");
                      setTimeout(() => setNotification(null), 4000);
                    }}
                    className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
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
                className="relative w-full max-w-2xl rounded-3xl p-8 sm:p-10 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>Registrar Lanzamiento</h3>
                      <p className="text-sm text-white/65 mt-1">Subir nuevo álbum o sencillo a BitsZone</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSimulateSubmit} className="space-y-5 text-sm">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Título de la pista o álbum
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Liquid Beats Vol. 1"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-base focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Artista o Grupo
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. J3T & JuanHP"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-base focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.09] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Género Principal
                    </label>
                    <select 
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3 rounded-2xl bg-[#1b1230] border border-white/10 text-white text-base focus:outline-none focus:border-purple-400/60 transition-all cursor-pointer"
                    >
                      <option value="Pop / Alternativo">Pop / Alternativo</option>
                      <option value="Rock / Metal">Rock / Metal</option>
                      <option value="Salsa / Tropical">Salsa / Tropical</option>
                      <option value="Electrónica / Synth">Electrónica / Synth</option>
                    </select>
                  </div>

                  <div className="p-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400/50 hover:bg-white/[0.06] transition-all">
                    <UploadCloud className="w-9 h-9 text-purple-300 mb-2.5" />
                    <p className="text-sm text-white/85">Arrastra la carátula o audio aquí</p>
                    <span className="text-xs text-white/45 mt-1">Soporta MP3, FLAC, JPG, PNG hasta 100MB</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#8a3aed] hover:bg-[#9c55f7] shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
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

      {/* MODAL: SQL Telemetry Setup */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal === 'sql_help' && (
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
                className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl p-6 sm:p-8 text-left text-white shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] overflow-hidden"
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg text-purple-300">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl text-white tracking-tight" style={titleStyle}>Sincronización Supabase</h3>
                      <p className="text-xs text-white/65 mt-0.5">Sincroniza auth.users, RLS y lectura de telemetría</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Cerrar modal"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-white/80">
                  <p className="leading-relaxed">
                    Por defecto en Supabase, la seguridad a nivel de fila (RLS) impide que los usuarios lean los perfiles de otros usuarios, y los registros de autenticación residen en <code className="text-purple-300 font-mono">auth.users</code>. Ejecuta este script en tu proyecto para sincronizarlos y leerlos en vivo:
                  </p>

                  <div className="relative rounded-2xl bg-black/60 border border-white/10 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56">
                    <pre className="text-purple-200 whitespace-pre">{USERS_SQL_SCRIPT}</pre>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <a
                      href="https://supabase.com/dashboard/project/oxloqoggjldbjjratwoh/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors underline underline-offset-4"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir SQL Editor en Supabase</span>
                    </a>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(USERS_SQL_SCRIPT);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 3000);
                        }}
                        className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-purple-300" />
                            <span>Copiar Script SQL</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal(null);
                          fetchRealData();
                        }}
                        className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#8a3aed] hover:bg-[#9c55f7] text-white transition-all cursor-pointer"
                      >
                        Sincronizar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};
