import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/*
 * Only the project URL and the publishable (anon) key are ever read on the client.
 * Both are public by design: every table is protected by Row Level Security, so the
 * anon key on its own can read nothing but what the signed-in user is allowed to see.
 * The service-role key must never be shipped to the browser.
 */
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = /^https?:\/\//.test(url) && anonKey.length > 40;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'civiclens.auth.v1'
      }
    })
  : null;

export const MISSING_CONFIG_MESSAGE =
  'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server.';

export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error(MISSING_CONFIG_MESSAGE);
  return supabase;
}
