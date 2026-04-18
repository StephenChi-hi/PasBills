import { createClient } from "@/lib/supabase/client";

/**
 * Server-side token utilities using Supabase client
 * Used by API routes for token operations
 */

const supabase = createClient();

export async function addTokensServer(
  userId: string,
  amount: number,
  reason: string,
) {
  try {
    // Get current balance
    const { data: userTokens, error: fetchError } = await supabase
      .from("user_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Create record if doesn't exist
    let currentBalance = 0;
    if (fetchError && fetchError.code === "PGRST116") {
      // Record not found, create it
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

      if (createError) {
        throw createError;
      }

      // Log transaction
      await supabase.from("token_transactions").insert({
        user_id: userId,
        type: "purchase",
        amount: amount,
        reason: reason || "Token purchase",
      });

      return newRecord;
    }

    if (fetchError) {
      throw fetchError;
    }

    // Add tokens
    const newBalance = (userTokens?.balance || 0) + amount;
    const newTotalPurchased = (userTokens?.total_purchased || 0) + amount;

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

    if (updateError) {
      throw updateError;
    }

    // Log transaction
    await supabase.from("token_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: amount,
      reason: reason || "Token purchase",
    });

    return updatedTokens;
  } catch (error) {
    console.error("Error adding tokens:", error);
    throw error;
  }
}

export async function deductTokensServer(
  userId: string,
  amount: number,
  reason: string,
) {
  try {
    // Get current balance
    const { data: userTokens, error: fetchError } = await supabase
      .from("user_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new Error("User tokens record not found");
    }

    const currentBalance = userTokens.balance || 0;

    // Check if sufficient tokens
    if (currentBalance < amount) {
      throw new Error("Insufficient tokens");
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

    if (updateError) {
      throw updateError;
    }

    // Log transaction
    await supabase.from("token_transactions").insert({
      user_id: userId,
      type: "usage",
      amount: amount,
      reason: reason || "Token usage",
    });

    return updatedTokens;
  } catch (error) {
    console.error("Error deducting tokens:", error);
    throw error;
  }
}
