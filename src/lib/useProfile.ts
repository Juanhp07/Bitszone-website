import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { getAdminEmails, isCachedAdminEmail, SUPERADMIN_EMAIL } from './adminAccess';

export type Profile = { username: string | null; avatar_url: string | null; role?: string | null };

export const isSuperAdminAccount = (user: User | null, profile: Profile | null) => {
  if (!user && !profile) return false;
  const email = (user?.email || '').toLowerCase().trim();
  const username = (profile?.username || '').toLowerCase().trim();
  const role = (profile?.role || '').toLowerCase().trim();
  const appRole = (user?.app_metadata && (user.app_metadata as Record<string, any>).role) || '';
  const userRole = (user?.user_metadata && (user.user_metadata as Record<string, any>).role) || '';

  return (
    email === SUPERADMIN_EMAIL ||
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

    let resolvedRole = data?.role || 'user';
    const email = (u.email || '').toLowerCase().trim();

    // Check if user is superadmin
    const isSuper = isSuperAdminAccount(u, data || null);

    if (isSuper) {
      resolvedRole = 'superadmin';
    } else if (email) {
      // Check if email is in authorized admin list from Supabase
      const adminEmails = await getAdminEmails();
      const isAuthorizedAdmin = adminEmails.includes(email);

      if (isAuthorizedAdmin) {
        resolvedRole = 'admin';
        // Auto-update profile role in DB if it was still 'user'
        if (data?.role !== 'admin') {
          supabase.from('profiles').upsert({
            id: u.id,
            role: 'admin',
            username: data?.username || email.split('@')[0],
            avatar_url: data?.avatar_url || null,
          }).then();
        }
      } else if (data?.role === 'admin' && !isSuper) {
        // Demoted by superadmin
        resolvedRole = 'user';
        supabase.from('profiles').update({ role: 'user' }).eq('id', u.id).then();
      }
    }

    setProfile(error && !data ? null : {
      username: data?.username ?? null,
      avatar_url: data?.avatar_url ?? null,
      role: resolvedRole
    });
    setReady(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      // never await supabase calls inside this callback (it can deadlock), so defer
      setTimeout(() => load(session?.user ?? null), 0);
    });

    // Realtime listener for admin list updates from app_config
    const channel = supabase
      .channel('app_config_admin_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_config' },
        () => {
          supabase.auth.getSession().then(({ data: sessData }) => {
            if (sessData.session?.user) load(sessData.session.user);
          });
        }
      )
      .subscribe();

    return () => {
      data.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [load]);

  const reload = useCallback(() => load(user), [load, user]);

  const isSuperAdmin = isSuperAdminAccount(user, profile);

  const isAdmin = Boolean(
    isSuperAdmin || (
      user && (
        profile?.role === 'admin' ||
        isCachedAdminEmail(user.email) ||
        (user.app_metadata && (user.app_metadata as Record<string, any>).role === 'admin') ||
        (user.user_metadata && (user.user_metadata as Record<string, any>).role === 'admin')
      )
    )
  );

  return { user, profile, isAdmin, isSuperAdmin, ready, reload };
};
