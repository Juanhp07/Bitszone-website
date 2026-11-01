import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Profile = { username: string | null; avatar_url: string | null; role?: string | null };

export const isSuperAdminAccount = (user: User | null, profile: Profile | null) => {
  if (!user && !profile) return false;
  const email = (user?.email || '').toLowerCase().trim();
  const username = (profile?.username || '').toLowerCase().trim();
  const role = (profile?.role || '').toLowerCase().trim();
  const appRole = (user?.app_metadata && (user.app_metadata as Record<string, any>).role) || '';
  const userRole = (user?.user_metadata && (user.user_metadata as Record<string, any>).role) || '';

  return (
    email === 'bitszone.app@gmail.com' ||
    username === 'owner' ||
    username === 'admin_bitszone' ||
    role === 'superadmin' ||
    role === 'owner' ||
    appRole === 'superadmin' ||
    userRole === 'superadmin'
  );
};

// Current session + its profile row. `profile` stays null if the lookup fails, so a DB hiccup never blocks the app.
export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) { setProfile(null); setReady(true); return; }
    const { data, error } = await supabase.from('profiles').select('username, avatar_url, role').eq('id', u.id).maybeSingle();
    if (error) console.error('profiles lookup failed', error);
    setProfile(error ? null : (data ?? { username: null, avatar_url: null, role: 'user' }));
    setReady(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      // never await supabase calls inside this callback (it can deadlock), so defer
      setTimeout(() => load(session?.user ?? null), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const reload = useCallback(() => load(user), [load, user]);

  const isSuperAdmin = isSuperAdminAccount(user, profile);

  const isAdmin = Boolean(
    isSuperAdmin || (
      user && (
        profile?.role === 'admin' ||
        (user.app_metadata && (user.app_metadata as Record<string, any>).role === 'admin') ||
        (user.user_metadata && (user.user_metadata as Record<string, any>).role === 'admin')
      )
    )
  );

  return { user, profile, isAdmin, isSuperAdmin, ready, reload };
};

