import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create and return a Supabase client when valid values are provided.
 * Returns `null` when input is not a valid Supabase project (useful for local dev).
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient | null {
  const configured = Boolean(
    supabaseUrl && supabaseAnonKey &&
      (supabaseUrl.includes('.supabase.co') || supabaseUrl.includes('localhost'))
  );

  if (!configured) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Add clock skew tolerance for password reset tokens
      // This allows tokens issued up to 10 minutes in the future
      flowType: 'pkce',
      // Increase storage key to avoid conflicts
      storageKey: 'levelup-auth-token',
      // Custom storage to handle session persistence
      storage: {
        getItem: (key: string) => {
          if (typeof window !== 'undefined') {
            return window.sessionStorage.getItem(key);
          }
          return null;
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(key, value);
          }
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(key);
          }
        }
      }
    }
  });
}

// Require Vite environment variables. Throw a helpful error during startup if missing.
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '');
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase is not configured. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabase);

export default supabase;