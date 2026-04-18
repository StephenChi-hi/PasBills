import { createClient } from "@/lib/supabase/client";
import { useState, useCallback } from "react";
import { UserTokens } from "./use-token-balance";

interface DeductResult {
  success: boolean;
  message: string;
  tokens: UserTokens | null;
}

export function useTokenDeduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deductTokens = useCallback(
    async (userId: string, amount: number, reason: string): Promise<DeductResult> => {
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

        if (fetchError) {
          throw new Error("Failed to fetch user tokens");
        }

        const currentBalance = userTokens?.balance || 0;

        // Check if sufficient tokens
        if (currentBalance < amount) {
          setLoading(false);
          return {
            success: false,
            message: `Insufficient tokens. You have ${currentBalance} but need ${amount}`,
            tokens: userTokens as UserTokens,
          };
        }

        // Deduct tokens
        const newBalance = currentBalance - amount;
        const newTotalUsed = (userTokens.total_used || 0) + amount;

        const { data: updatedTokens, error: updateError } = await supabase
          .from("user_tokens")
          .update({
            balance: newBalance,
            total_used: newTotalUsed,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log transaction
        await supabase.from("token_transactions").insert({
          user_id: userId,
          type: "usage",
          amount: amount,
          reason: reason,
        });

        setLoading(false);
        return {
          success: true,
          message: "Tokens deducted successfully",
          tokens: updatedTokens as UserTokens,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to deduct tokens";
        setError(msg);
        console.error("Error deducting tokens:", err);
        setLoading(false);
        return {
          success: false,
          message: msg,
          tokens: null,
        };
      }
    },
    [],
  );

  return { deductTokens, loading, error };
}
