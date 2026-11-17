import { PostgrestClient } from "@supabase/postgrest-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

/**
 * The public site only reads and writes tables (and calls one RPC) as the anonymous
 * visitor: no sign-in, storage or realtime. So it uses Supabase's REST client alone
 * instead of the full supabase-js bundle. Same API: supabase.from(…), supabase.rpc(…).
 */
export const supabase = supabaseConfigured
  ? new PostgrestClient(`${url.replace(/\/$/, "")}/rest/v1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
  : null;
