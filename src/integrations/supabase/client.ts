/**
 * Backend connection (Lovable Cloud)
 *
 * Lovable Cloud provisions a **Supabase-compatible** project for your app. The browser uses
 * `@supabase/supabase-js` against that API — there is no separate “Lovable-only” client package.
 *
 * Set credentials from your **Lovable project** (Editor → Environment / `.env`), or from the
 * GitHub repo Lovable syncs. For self-hosted builds (Vercel, etc.), define the same `VITE_*` vars
 * in the host’s dashboard so they exist at **build** time.
 *
 * @see https://docs.lovable.dev/tips-tricks/external-deployment-hosting
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (import.meta.env.DEV && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  console.warn(
    "[Latifa] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy them from your Lovable project .env (Lovable Cloud uses Supabase under the hood)."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "",
  SUPABASE_PUBLISHABLE_KEY ?? "",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);