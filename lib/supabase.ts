import { createBrowserClient } from '@supabase/ssr';

// Browser client - uses cookies for session persistence in Next.js App Router
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
