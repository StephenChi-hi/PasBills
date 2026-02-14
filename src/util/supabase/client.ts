// src/util/supabase/client.ts
// Browser-side Supabase client using Next.js auth helpers.
// This stores the session in cookies so middleware and
// server components can see the logged-in user.
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
