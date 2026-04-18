import { createClient } from "@/lib/supabase/client";
import { useState, useCallback } from "react";
import { UserTokens } from "./use-token-balance";

export function useTokenAdd() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTokens = useCallback(
    async (userId: string, amount: number, reason: string = "Token purchase") => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // Get current balance
        const { data: userTokens, error: fetchError } = await supabase
          .from("user_tokens")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (fetchError && fetchError.code === "PGRST116") {
          // Create new record
          const { data: newRecord, error: createError } = await supabase
            .from("user_tokens")
            .insert({
              user_id: userId,
              balance: amount,
              total_purchased: amount,
              total_used: 0,
            })
            .select()
            .single();

          if (createError) throw createError;

          // Log transaction
          await supabase.from("token_transactions").insert({
            user_id: userId,
            type: "purchase",
            amount: amount,
            reason: reason,
          });

          setLoading(false);
          return newRecord as UserTokens;
        } else if (fetchError) {
          throw fetchError;
        }

        // Update existing record
        const newBalance = (userTokens.balance || 0) + amount;
        const newTotalPurchased = (userTokens.total_purchased || 0) + amount;

        const { data: updatedTokens, error: updateError } = await supabase
          .from("user_tokens")
          .update({
            balance: newBalance,
            total_purchased: newTotalPurchased,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log transaction
        await supabase.from("token_transactions").insert({
          user_id: userId,
          type: "purchase",
          amount: amount,
          reason: reason,
        });

        setLoading(false);
        return updatedTokens as UserTokens;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add tokens";
        setError(msg);
        console.error("Error adding tokens:", err);
        setLoading(false);
        throw err;
      }
    },
    [],
  );

  return { addTokens, loading, error };
}
