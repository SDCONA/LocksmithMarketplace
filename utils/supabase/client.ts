import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || `https://${projectId}.supabase.co`;

// Singleton client instance
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'locksmith-auth-token'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseClient;
};