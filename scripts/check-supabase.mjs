import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY).');
  process.exit(2);
}

const supabase = createClient(url, anonKey);

(async () => {
  try {
    console.log('Attempting to fetch current user (if any) and a simple query to `pg_catalog.pg_tables`...');
    const { data: user, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.warn('auth.getUser error:', userErr.message || userErr);
    } else {
      console.log('auth.getUser result:', user?.data ?? null);
    }

    // Run a lightweight SQL query via the REST RPC (select from pg_catalog) - this requires anon role to have access
    const { data, error } = await supabase.from('pg_catalog.pg_tables').select('tablename').limit(3);
    if (error) {
      console.warn('Query error (likely permission issue for anon key):', error.message || error);
    } else {
      console.log('Sample tables:', data?.slice(0,3) ?? data);
    }

    console.log('Connection check finished.');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error while checking Supabase:', err);
    process.exit(3);
  }
})();
