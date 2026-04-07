import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // This is a development-only endpoint for creating test data
    // In production, this should be restricted

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "No userId provided" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Create test accounts
    const accountsData = [
      {
        name: "Main Checking",
        type: "checking",
        balance: 5000,
        currency: "NGN",
        user_id: userId,
      },
      {
        name: "Savings Account",
        type: "savings",
        balance: 10000,
        currency: "NGN",
        user_id: userId,
      },
      {
        name: "Cash on Hand",
        type: "cash",
        balance: 2000,
        currency: "NGN",
        user_id: userId,
      },
      {
        name: "Business Account",
        type: "business",
        balance: 25000,
        currency: "NGN",
        user_id: userId,
      },
    ];

    const { data: createdAccounts, error: accountsError } = await supabase
      .from("accounts")
      .insert(accountsData)
      .select();

    if (accountsError)
      throw new Error(`Accounts error: ${accountsError.message}`);

    // Create test transactions
    const transactionsData = [
      {
        user_id: userId,
        amount: 5000,
        type: "income",
        description: "Salary",
        category_id: "1",
        account_id: createdAccounts?.[0]?.id || null,
        transaction_date: new Date().toISOString(),
        tangible_assets: false,
      },
      {
        user_id: userId,
        amount: 1500,
        type: "expense",
        description: "groceries",
        category_id: "2",
        account_id: createdAccounts?.[0]?.id || null,
        transaction_date: new Date().toISOString(),
        tangible_assets: false,
      },
      {
        user_id: userId,
        amount: 2000,
        type: "expense",
        description: "Rent",
        category_id: "3",
        account_id: createdAccounts?.[0]?.id || null,
        transaction_date: new Date().toISOString(),
        tangible_assets: false,
      },
    ];

    const { data: createdTransactions, error: transactionsError } =
      await supabase.from("transactions").insert(transactionsData).select();

    if (transactionsError)
      throw new Error(`Transactions error: ${transactionsError.message}`);

    // Create test business
    const { data: createdBusiness, error: businessError } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: "Side Business",
        description: "Freelance work",
        revenue: 30000,
        expenses: 5000,
        status: "profit",
      })
      .select();

    if (businessError)
      throw new Error(`Business error: ${businessError.message}`);

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      accountsCreated: createdAccounts?.length || 0,
      transactionsCreated: createdTransactions?.length || 0,
      businessCreated: !!createdBusiness?.length,
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
