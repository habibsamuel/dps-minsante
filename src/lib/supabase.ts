import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Vrai quand les variables EXPO_PUBLIC_SUPABASE_* sont renseignées. */
export const isBackendConfigured = url.length > 0 && anonKey.length > 0;

/** Client Supabase, ou null si l'app tourne en mode démo local. */
export const supabase: SupabaseClient | null = isBackendConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;
