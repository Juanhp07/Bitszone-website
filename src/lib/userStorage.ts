import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabase';

// Per-account storage with the same shape as localStorage (getItem / setItem), kept in the
// `user_library` table: one row per (user, key). Signed out there is nothing to read and
// nothing is saved; signed in, the account's data is loaded on any device and kept in sync live.

const LEGACY_KEYS = ['bz_playlists', 'bz_downloads', 'bz_favorites', 'bz_licenses']; // old device-only copies
const SAVE_DELAY_MS = 800;
const STALE_MS = 5_000;
const TOAST_EVERY_MS = 30_000;

let userId: string | null = null;
let loaded = false; // writes are allowed only after this account's data was read, so a failed read can never overwrite it
let data: Record<string, string> = {};
const dirtyKeys = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;
let version = 0;
let lastLoad = 0;
let started = false;
let lastToast = 0;
let channel: ReturnType<typeof supabase.channel> | null = null;
const listeners = new Set<() => void>();

// bumped whenever the data is replaced (login, logout, remote change) so providers re-read it
const emit = () => { version++; listeners.forEach((l) => l()); };

const notifyFailure = () => {
  if (typeof window === 'undefined' || Date.now() - lastToast < TOAST_EVERY_MS) return;
  lastToast = Date.now();
  window.dispatchEvent(new CustomEvent('show-toast', { detail: 'No se pudo sincronizar tu biblioteca con tu cuenta' }));
};

// Postgres jsonb reorders object keys, so compare values independently of key order
const canon = (v: unknown) =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)))
      : x);
const sameValue = (local: string | undefined, remote: unknown) => local !== undefined && canon(JSON.parse(local)) === canon(remote);

const stopRealtime = () => {
  if (channel) { supabase.removeChannel(channel); channel = null; }
};

// other devices of the same account: apply their changes as they happen
const startRealtime = (uid: string) => {
  stopRealtime();
  channel = supabase
    .channel(`user_library:${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_library', filter: `user_id=eq.${uid}` }, (payload) => {
      if (userId !== uid || !loaded) return;
      const removed = payload.eventType === 'DELETE';
      const row = (removed ? payload.old : payload.new) as { key?: string; value?: unknown };
      const key = row?.key;
      if (!key || dirtyKeys.has(key)) return; // we have newer local edits waiting to be saved
      if (removed) {
        if (key in data) { delete data[key]; emit(); }
        return;
      }
      if (!sameValue(data[key], row.value)) { data[key] = JSON.stringify(row.value); emit(); } // our own saves echo back equal: ignored
    })
    .subscribe();
};

const flush = async () => {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!userId || !loaded || dirtyKeys.size === 0) return;
  const uid = userId;
  const keys = [...dirtyKeys];
  dirtyKeys.clear();
  const rows = keys.map((key) => ({ user_id: uid, key, value: JSON.parse(data[key]), updated_at: new Date().toISOString() }));
  const { error } = await supabase.from('user_library').upsert(rows);
  if (error) {
    console.error('user_library save failed', error);
    notifyFailure();
    if (userId === uid) keys.forEach((k) => dirtyKeys.add(k));
  }
};

const switchUser = (uid: string | null) => {
  if (uid === userId) return false;
  stopRealtime();
  userId = uid;
  data = {};
  dirtyKeys.clear();
  loaded = false;
  emit();
  return true;
};

const load = async (uid: string, quiet = false) => {
  const { data: rows, error } = await supabase.from('user_library').select('key, value').eq('user_id', uid);
  if (userId !== uid) return; // the account changed while we were reading
  if (error) { console.error('user_library load failed', error); notifyFailure(); return; }
  const next: Record<string, string> = {};
  (rows ?? []).forEach((r) => { next[r.key] = JSON.stringify(r.value); });
  const keys = new Set([...Object.keys(next), ...Object.keys(data)]);
  const changed = [...keys].some((k) => !(k in next) || !sameValue(data[k], JSON.parse(next[k])));
  data = next;
  loaded = true;
  lastLoad = Date.now();
  if (!channel) startRealtime(uid);
  if (changed || !quiet) emit();
};

const start = () => {
  if (started || typeof window === 'undefined') return;
  started = true;
  LEGACY_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch { /* storage unavailable */ } });

  supabase.auth.getSession().then(({ data: { session } }) => {
    const uid = session?.user.id ?? null;
    if (uid && switchUser(uid)) load(uid);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    const uid = session?.user.id ?? null;
    // never run supabase calls inside this callback (it can deadlock), so defer
    setTimeout(() => {
      if (event === 'SIGNED_OUT') switchUser(null);
      else if (event === 'SIGNED_IN' && uid && switchUser(uid)) load(uid);
    }, 0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    // coming back to the tab: catch up in case the live connection was asleep
    else if (userId && loaded && dirtyKeys.size === 0 && Date.now() - lastLoad > STALE_MS) load(userId, true);
  });
  window.addEventListener('pagehide', () => { flush(); });
};

export const userStorage = {
  getItem: (key: string): string | null => data[key] ?? null,
  setItem: (key: string, value: string) => {
    if (!userId || !loaded) return; // signed out (or account not read yet): keep nothing
    data[key] = value;
    dirtyKeys.add(key);
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, SAVE_DELAY_MS);
  },
};

/** Saves what is pending (it needs the session), then signs out. Local data is cleared by the SIGNED_OUT event. */
export const signOutUser = async () => {
  await flush();
  await supabase.auth.signOut();
};

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** Changes every time the account's data is replaced; use it as an effect dependency to re-read from `userStorage`. */
export const useUserStorageVersion = () => {
  useEffect(() => { start(); }, []);
  return useSyncExternalStore(subscribe, () => version, () => 0);
};
