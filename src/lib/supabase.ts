import { createClient } from '@supabase/supabase-js';

/**
 * Supabase is used for one thing: proving who you are. No table is read and no row written
 * through this client; all data comes from the Spring API.
 *
 * That is why the public anon key is fine. It can start a sign in and nothing else,
 * because self-signup is disabled and every reachable table has RLS.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // At import, not at first sign in, or a missing variable looks like a dead button.
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. Copy .env.example to .env.local.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Nothing arrives back through a link, so there is no callback fragment to parse.
    detectSessionInUrl: false,
  },
});
