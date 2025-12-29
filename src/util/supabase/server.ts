// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const createServerSupabase = () => {
  const cookieStore = cookies();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Server-side cookie auth
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};
