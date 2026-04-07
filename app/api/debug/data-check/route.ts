import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params for testing
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "No userId provided" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Check data in each table
    const [accounts, transactions, businesses, loans, categories, assets] =
      await Promise.all([
        supabase
          .from("accounts")
          .select("count", { count: "exact" })
          .eq("user_id", userId),
        supabase
          .from("transactions")
          .select("count", { count: "exact" })
          .eq("user_id", userId),
        supabase
          .from("businesses")
          .select("count", { count: "exact" })
          .eq("user_id", userId),
        supabase
          .from("loans")
          .select("count", { count: "exact" })
          .eq("user_id", userId),
        supabase
          .from("categories")
          .select("count", { count: "exact" })
          .or(`user_id.is.null,user_id.eq.${userId}`),
        supabase
          .from("transactions")
          .select("count", { count: "exact" })
          .eq("user_id", userId)
          .eq("tangible_assets", true),
      ]);

    return NextResponse.json({
      accounts: { count: accounts.count, error: accounts.error },
      transactions: { count: transactions.count, error: transactions.error },
      businesses: { count: businesses.count, error: businesses.error },
      loans: { count: loans.count, error: loans.error },
      categories: { count: categories.count, error: categories.error },
      assets: { count: assets.count, error: assets.error },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
