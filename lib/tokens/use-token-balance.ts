import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useState, useCallback } from "react";

export interface UserTokens {
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export function useTokenBalance() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<UserTokens | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("user_tokens")
        .select("*")
        .eq("user_id", id)
        .single();

      if (fetchError && fetchError.code === "PGRST116") {
        // No record found, create one
        const { data: newRecord, error: createError } = await supabase
          .from("user_tokens")
          .insert({
            user_id: id,
            balance: 0,
            total_purchased: 0,
            total_used: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        setTokens(newRecord as UserTokens);
      } else if (fetchError) {
        throw fetchError;
      } else {
        setTokens(data as UserTokens);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch balance";
      setError(msg);
      console.error("Error fetching token balance:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { tokens, loading, error, fetchBalance };
}
