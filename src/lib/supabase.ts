import { createClient } from "@supabase/supabase-js";

// Server-only client, authenticated as service_role. This bypasses RLS, so it
// must never be imported into client components — only route handlers and
// server components/actions.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
