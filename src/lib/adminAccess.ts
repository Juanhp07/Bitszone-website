import { supabase } from './supabase';
import { userStorage } from './userStorage';

export interface AdminRecord {
  id?: string;
  email: string;
  username?: string;
  role: 'superadmin' | 'admin';
  addedAt: string;
}

const CONFIG_KEY = 'admin_emails';
const RECORDS_KEY = 'admin_users_list';
const STORAGE_EMAILS = 'bz_admin_emails';
const STORAGE_RECORDS = 'bz_admin_records';

export const SUPERADMIN_EMAIL = 'bitszone.app@gmail.com';
export const SUPERADMIN_USERNAMES = ['owner', 'admin_bitszone'];

/**
 * Check synchronously if an email is in cached authorized admin list
 */
export function isCachedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean === SUPERADMIN_EMAIL) return true;
  try {
    const raw = userStorage.getItem(STORAGE_EMAILS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list.includes(clean);
    }
  } catch (e) {
    // ignore
  }
  return false;
}

/**
 * Fetch the current list of authorized admin emails from Supabase app_config
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((e: string) => String(e).toLowerCase().trim());
        userStorage.setItem(STORAGE_EMAILS, JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('Error reading admin_emails from Supabase:', err);
  }

  // Fallback to local cache
  try {
    const raw = userStorage.getItem(STORAGE_EMAILS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list.map((e: string) => String(e).toLowerCase().trim());
    }
  } catch (e) {
    // ignore
  }

  return [];
}

/**
 * Fetch the list of AdminRecord objects
 */
export async function getAdminRecords(): Promise<AdminRecord[]> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', RECORDS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed)) {
        userStorage.setItem(STORAGE_RECORDS, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading admin_users_list from Supabase:', err);
  }

  // Fallback to local cache
  try {
    const raw = userStorage.getItem(STORAGE_RECORDS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    // ignore
  }

  // Initial seed with superadmin
  return [
    {
      email: SUPERADMIN_EMAIL,
      username: 'owner',
      role: 'superadmin',
      addedAt: '2026-10-28',
    },
  ];
}

/**
 * Add a new administrator by email or username
 */
export async function addAdminAccount(input: string): Promise<{ success: boolean; error?: string }> {
  const clean = input.trim().toLowerCase();
  if (!clean) return { success: false, error: 'Escribe un correo o usuario válido' };

  if (clean === SUPERADMIN_EMAIL || SUPERADMIN_USERNAMES.includes(clean)) {
    return { success: false, error: 'El usuario ya es el Superadministrador principal' };
  }

  const isEmail = /^\S+@\S+\.\S+$/.test(clean);
  const targetEmail = isEmail ? clean : `${clean}@gmail.com`;
  const targetUsername = isEmail ? clean.split('@')[0] : clean;

  const currentEmails = await getAdminEmails();
  const currentRecords = await getAdminRecords();

  if (currentEmails.includes(targetEmail)) {
    return { success: true };
  }

  const newEmails = [...currentEmails, targetEmail];
  const newRecords: AdminRecord[] = [
    ...currentRecords.filter((r) => r.email.toLowerCase() !== targetEmail),
    {
      email: targetEmail,
      username: targetUsername,
      role: 'admin',
      addedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
  ];

  try {
    // 1. Save in app_config
    await supabase.from('app_config').upsert([
      { key: CONFIG_KEY, value: JSON.stringify(newEmails), updated_at: new Date().toISOString() },
      { key: RECORDS_KEY, value: JSON.stringify(newRecords), updated_at: new Date().toISOString() },
    ]);

    userStorage.setItem(STORAGE_EMAILS, JSON.stringify(newEmails));
    userStorage.setItem(STORAGE_RECORDS, JSON.stringify(newRecords));

    // 2. Try to update profile in Supabase if exists
    try {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .or(`username.ilike.%${targetUsername}%,username.ilike.%${clean}%`);
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bz-admin-list-changed'));
    }
    return { success: true };
  } catch (err: any) {
    // Save to local cache even if DB fails
    userStorage.setItem(STORAGE_EMAILS, JSON.stringify(newEmails));
    userStorage.setItem(STORAGE_RECORDS, JSON.stringify(newRecords));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bz-admin-list-changed'));
    }
    return { success: true };
  }
}

/**
 * Remove an administrator by email
 */
export async function removeAdminAccount(email: string): Promise<{ success: boolean; error?: string }> {
  const clean = email.trim().toLowerCase();
  if (clean === SUPERADMIN_EMAIL || SUPERADMIN_USERNAMES.includes(clean)) {
    return { success: false, error: 'No es posible revocar permisos al Superadministrador principal' };
  }

  const currentEmails = await getAdminEmails();
  const currentRecords = await getAdminRecords();

  const newEmails = currentEmails.filter((e) => e !== clean);
  const newRecords = currentRecords.filter((r) => r.email.toLowerCase() !== clean);

  try {
    // 1. Save in app_config
    await supabase.from('app_config').upsert([
      { key: CONFIG_KEY, value: JSON.stringify(newEmails), updated_at: new Date().toISOString() },
      { key: RECORDS_KEY, value: JSON.stringify(newRecords), updated_at: new Date().toISOString() },
    ]);

    userStorage.setItem(STORAGE_EMAILS, JSON.stringify(newEmails));
    userStorage.setItem(STORAGE_RECORDS, JSON.stringify(newRecords));

    // 2. Try to update profile in Supabase to user
    try {
      const username = clean.split('@')[0];
      await supabase
        .from('profiles')
        .update({ role: 'user' })
        .ilike('username', username);
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bz-admin-list-changed'));
    }
    return { success: true };
  } catch (err: any) {
    userStorage.setItem(STORAGE_EMAILS, JSON.stringify(newEmails));
    userStorage.setItem(STORAGE_RECORDS, JSON.stringify(newRecords));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bz-admin-list-changed'));
    }
    return { success: true };
  }
}
